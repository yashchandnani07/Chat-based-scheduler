const { google } = require('googleapis');
require('dotenv').config();

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Handle automatic token refresh
oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
        console.log('Refresh token obtained:', tokens.refresh_token);
    }
    console.log('Access token obtained:', tokens.access_token);
});

// Create event in Google Calendar
const createCalendarEvent = async (schedule, auth, timezone) => {
    try {
        const calendar = google.calendar({ version: 'v3', auth });

        // Prepare event data for Google Calendar API
        const event = {
            summary: schedule.title,
            description: schedule.description,
            start: {
                dateTime: schedule.startTime.toISOString(),
                timeZone: timezone || 'Asia/Kolkata',
            },
            end: {
                dateTime: schedule.endTime.toISOString(),
                timeZone: timezone || 'Asia/Kolkata',
            },
        };

        // Insert event into primary calendar
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });
        console.log('Google Calendar API event creation response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating calendar event:', error.message, error);
        throw new Error('Failed to create calendar event');
    }
};

module.exports = { oauth2Client, createCalendarEvent };
