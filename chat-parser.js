const OpenAI = require('openai');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Initialize dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

require('dotenv').config();

// Initialize OpenAI client with custom API
const client = new OpenAI({
    apiKey: process.env.A4F_API_KEY,
    baseURL: process.env.A4F_BASE_URL,
});

// Extract and format event title from AI response
function extractTitle(message, aiProvidedTitle) {
    let title = aiProvidedTitle;

    // Use default title if AI response is invalid or generic
    if (!title || typeof title !== 'string' || !title.trim() || /no title|untitled/i.test(title)) {
        title = 'Scheduled Event';
    }

    // Truncate long titles
    if (title.length > 60) {
        title = title.slice(0, 57) + '...';
    }

    // Format title with proper capitalization
    return title.charAt(0).toUpperCase() + title.slice(1).trim();
}

// Parse chat message and extract event details using AI
const parseChat = async (message, timezone = 'UTC') => {
    const now = dayjs().tz(timezone);
    
    // Send message to AI for parsing with timezone context
    const completion = await client.chat.completions.create({
        model: "provider-3/gpt-4",
        messages: [
            {
                role: "system",
                content: `You are an intelligent assistant that parses chat messages to extract event details for calendar scheduling. Your primary goal is to create a valid JSON object with the event details.

                    The current date and time is ${now.format('YYYY-MM-DD HH:mm:ss')} in the ${timezone} timezone.
                    The current year is ${now.year()}.
                    The user is located in the ${timezone} timezone.
                    
                    IMPORTANT: If a user mentions a date without a year (like "July 10th"), and that date has already passed this year, assume they mean next year (${now.year() + 1}).

                From the user's message, you must extract the following information:

                1.  **title**: Create a concise and descriptive title for the event based on the main subject of the conversation. The title MUST be specific and not a generic term like "Meeting", "Schedule", or "Event". For example, if the conversation is about planning a project, a good title would be 'Project Planning Session'.
                2.  **description**: Provide a detailed summary of the event. This should include the main points of the conversation, the agenda, or any relevant context. Do NOT use the entire user message as the description.
                3.  **startTime**: The exact start time for the event. When the user mentions a time like "10am" or "July 12th at 10am", interpret this as ${timezone} local time. Return the time in ISO 8601 format WITHOUT the Z suffix (YYYY-MM-DDTHH:mm:ss) - this represents the LOCAL time in ${timezone}.
                4.  **endTime**: The exact end time for the event in the same format as startTime. If no end time is specified, set it to one hour after the start time.

                IMPORTANT: Do NOT convert times to UTC. When the user says "10am", they mean 10am in ${timezone}. Return times as local time without timezone conversion.

                Your output **MUST** be a single, valid JSON object and nothing else. Do not include any explanatory text, markdown formatting, or anything outside of the JSON object.`
            },
            { role: "user", content: message }
        ],
        temperature: 0.7,
    });

    // Extract JSON from AI response
    let content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{.*\}/s);
    if (jsonMatch) {
        content = jsonMatch[0];
    }

    const parsedContent = JSON.parse(content);

    // Convert AI-provided local times to timezone-aware Date objects
    let startTime, endTime;
    
    try {
        // Parse times as local timezone and convert to Date objects
        startTime = dayjs.tz(parsedContent.startTime, timezone).toDate();
        endTime = dayjs.tz(parsedContent.endTime, timezone).toDate();
        
        // Validate parsed dates
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new Error('Invalid date parsing');
        }
        
        // Ensure end time is after start time
        if (endTime <= startTime) {
            endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        }
        
    } catch (error) {
        console.error('Error parsing AI-provided times:', error);
        // Fallback to current time + 1 hour
        const fallbackStart = dayjs().tz(timezone).add(1, 'hour');
        startTime = fallbackStart.toDate();
        endTime = fallbackStart.add(1, 'hour').toDate();
    }

    // Return structured event data
    const finalContent = {
        startTime: startTime,
        endTime: endTime,
        title: extractTitle(message, parsedContent.title),
        description: parsedContent.description || '',
        participants: parsedContent.participants || []
    };

    return finalContent;
};

module.exports = { parseChat };