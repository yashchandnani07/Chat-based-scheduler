require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { parseChat } = require('./chat-parser.js');
const connectDB = require('./config/db');
const Schedule = require('./models/Schedule.js');
const { oauth2Client, createCalendarEvent } = require('./config/google-calendar.js');

// Initialize database connection
connectDB();

const app = express();
const port = 3000;

// Serve Google verification HTML
app.get('/googlefc7477c6e3fb4baa.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'googlefc7477c6e3fb4baa.html'));
});

// Configure middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Configure session management
app.use(session({
    secret: 'your_secret_key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Load OAuth2 credentials from session
app.use((req, res, next) => {
    if (req.session.tokens) {
        oauth2Client.setCredentials(req.session.tokens);
    }
    next();
});

// Google OAuth2 authentication routes
app.get('/auth/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
    });
    res.redirect(url);
});

// Handle OAuth2 callback and store tokens
app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        req.session.tokens = tokens;
        res.redirect('/');
    } catch (error) {
        console.error('Error getting OAuth tokens:', error.message);
        res.status(500).send('Error getting OAuth tokens');
    }
});

// Check if user is authenticated
app.get('/api/is-authenticated', (req, res) => {
    const isAuthenticated = !!(req.session.tokens && req.session.tokens.access_token);
    res.json({ isAuthenticated });
});

// Main endpoint: Parse chat message and create calendar event
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const parsedSchedule = await parseChat(message, 'Asia/Kolkata');
    console.log('Parsed schedule from chat:', parsedSchedule);

    // Validate and ensure proper Date objects
    let startTime = new Date(parsedSchedule.startTime);
    let endTime = new Date(parsedSchedule.endTime);
    const now = new Date();
    
    console.log('Validation check:', {
        startTime: startTime,
        now: now,
        isValid: !isNaN(startTime.getTime()),
        isFuture: startTime > now
    });
    
    if (isNaN(startTime.getTime()) || startTime < now) {
        console.warn('Parsed startTime missing or invalid.');
        return res.status(400).json({ success: false, error: 'Could not parse a valid future start time from your message. Please specify a date and time.' });
    }
    if (isNaN(endTime) || endTime <= startTime) {
        endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        console.warn('Parsed endTime missing or invalid. Defaulting to 1 hour after startTime.');
    }
    parsedSchedule.startTime = startTime;
    parsedSchedule.endTime = endTime;

    // Check authentication
    if (!req.session.tokens || !req.session.tokens.access_token) {
        return res.status(401).json({
            success: false,
            error: 'You must log in with Google to create a calendar event.',
            loginUrl: '/auth/google'
        });
    }

    try {
        // Save schedule to database
        const newSchedule = new Schedule(parsedSchedule);
        await newSchedule.save();

        // Create Google Calendar event
        oauth2Client.setCredentials(req.session.tokens);
        const calendarEvent = await createCalendarEvent(newSchedule, oauth2Client, 'Asia/Kolkata');
        newSchedule.eventLink = calendarEvent.htmlLink || null;
        await newSchedule.save();

        res.json({ success: true, schedule: newSchedule, eventLink: newSchedule.eventLink });
    } catch (err) {
        console.error('Error creating schedule or calendar event:', err.message, err);
        res.status(500).json({ success: false, error: 'Failed to create schedule or Google Calendar event: ' + (err.message || err.toString()) });
    }
});


// Get latest created schedule
app.get('/api/schedule/latest', async (req, res) => {
    try {
        const latest = await Schedule.findOne().sort({ _id: -1 });
        if (!latest) {
            return res.status(404).json({ success: false, error: 'No schedules found' });
        }
        
        res.json({
            success: true,
            schedule: {
                _id: latest._id,
                title: latest.title,
                startTime: latest.startTime,
                endTime: latest.endTime,
                eventLink: latest.eventLink || null, 
            }
        });
    } catch (err) {
        console.error('Error fetching latest schedule:', err.message);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get all schedules
app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find();
        res.json({ success: true, schedules: schedules });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
