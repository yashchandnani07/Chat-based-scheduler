const OpenAI = require('openai');
const chrono = require('chrono-node');
require('dotenv').config();

const client = new OpenAI({
    apiKey: process.env.A4F_API_KEY,
    baseURL: process.env.A4F_BASE_URL,
});

function extractTitle(message, aiProvidedTitle) {
    let title = aiProvidedTitle;

    // If AI provided title is empty, not a string, or generic, use a default
    if (!title || typeof title !== 'string' || !title.trim() || /no title|untitled/i.test(title)) {
        title = 'Scheduled Event';
    }

    // Ensure the title is not excessively long
    if (title.length > 60) {
        title = title.slice(0, 57) + '...';
    }

    // Capitalize the first letter and trim whitespace
    return title.charAt(0).toUpperCase() + title.slice(1).trim();
}

const parseChat = async (message, timezone = 'UTC') => {
    const now = new Date();
    try {
        const completion = await client.chat.completions.create({
            model: "provider-3/gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are an intelligent assistant that parses chat messages to extract event details for calendar scheduling. Your primary goal is to create a valid JSON object with the event details.

                    From the user's message, you must extract the following information:

                    1.  **title**: Create a concise and descriptive title for the event based on the main subject of the conversation. The title MUST be specific and not a generic term like "Meeting", "Schedule", or "Event". For example, if the conversation is about planning a project, a good title would be 'Project Planning Session'.
                    2.  **description**: Provide a detailed summary of the event. This should include the main points of the conversation, the agenda, or any relevant context. Do NOT use the entire user message as the description.
                    3.  **startTime**: The exact start time for the event in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
                    4.  **endTime**: The exact end time for the event in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). If no end time is specified, set it to one hour after the start time.

                    Your output **MUST** be a single, valid JSON object and nothing else. Do not include any explanatory text, markdown formatting, or anything outside of the JSON object.`
                },
                { role: "user", content: message }
            ],
            temperature: 0.7,
        });

        let content = completion.choices[0].message.content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            content = jsonMatch[1];
        } else {
            const standaloneJsonMatch = content.match(/\{[\s\S]*\}/);
            if (standaloneJsonMatch && standaloneJsonMatch[0]) {
                content = standaloneJsonMatch[0];
            }
        }

        const parsedContent = JSON.parse(content);

        // Use chrono-node for more robust date parsing
        const referenceDate = new Date();
        const parsedChrono = chrono.parse(message, referenceDate, { forwardDate: true });

        let startTime, endTime;

        if (parsedChrono.length > 0) {
            startTime = parsedChrono[0].start.date();
            if (parsedChrono[0].end) {
                endTime = parsedChrono[0].end.date();
            } else {
                endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default to 1 hour later
            }
        } else {
            startTime = new Date(parsedContent.startTime);
            endTime = new Date(parsedContent.endTime);
        }

        // Validate and adjust times
        if (isNaN(startTime.getTime()) || startTime < now) {
            startTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now as a fallback
        }

        if (isNaN(endTime.getTime()) || endTime.getTime() <= startTime.getTime()) {
            endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
        }

        parsedContent.startTime = startTime.toISOString();
        parsedContent.endTime = endTime.toISOString();
        parsedContent.title = extractTitle(message, parsedContent.title);
        parsedContent.description = parsedContent.description || '';

        return parsedContent;

    } catch (error) {
        console.error("Error parsing chat:", error);
        // Fallback extraction for title and description
        function extractDescription(message) {
            if (typeof message === 'string' && message.trim().length > 0) {
                const lines = message.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                if (lines.length > 1) {
                    return lines.slice(1).join(' ');
                }
            }
            return '';
        }
        return {
            title: extractTitle(message, ''),
            participants: [],
            startTime: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
            endTime: new Date(now.getTime() + 65 * 60 * 1000).toISOString(),
            description: extractDescription(message) || `Failed to parse chat message. Original message: "${message}" `,
        };
    }
};

module.exports = { parseChat };