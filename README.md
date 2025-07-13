# Chat-Based Scheduler

## Overview
Unlock effortless organization with this sophisticated Node.js chat-based scheduler. It intelligently interprets your natural language commands to manage your calendar, streamline appointments, and enhance productivity through intuitive, conversational interactions.

## Features
- **Natural Language Processing**: Understands and processes scheduling requests in plain English.
- **Calendar Management**: Create, view, and manage events and appointments.
- **Google Calendar Integration**: Seamlessly syncs with your Google Calendar.
- **Database Persistence**: Stores schedule data for reliable access.
- **User-Friendly Frontend**: An intuitive web interface for interaction.

## 🖼️ Screenshots

### Event Creation Success
![Schedule Created](screenshots/Schedule%20Created.png)

### Chat-Based Input
![Chat Input](screenshots/Chat%20Input.png)

### Calendar Integration
![Google Calendar Event](screenshots/Google%20Calendar%20Event.png)


## Technologies Used
- **Backend**: Node.js, Express (inferred), `dotenv`, `chrono-node`, `axios`
- **Database**: (Based on `db.js`, (MongoDB)
- **Frontend**: HTML5, CSS3, JavaScript
- **Version Control**: Git

## Project Structure
- `.` (root): Main server entry point (`index.js`), chat parsing logic (`chat-parser.js`), and project configuration.
- `config/`: Database connection and Google Calendar API setup.
- `frontend/`: All client-side HTML, CSS, and JavaScript files.
- `models/`: Defines data schemas for scheduling entities.

## Installation

### Prerequisites
- Node.js (v14 or higher recommended)
- npm (Node Package Manager)
- A Google Cloud Project with Google Calendar API enabled (for calendar integration)
- A database instance (e.g., MongoDB, PostgreSQL, etc., as configured in `config/db.js`)

### Steps
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yashchandnani07/Chat-based-scheduler.git

    cd Chat-based-scheduler
    ``` 
2.  **Install dependencies:**
    ```bash
    npm install
    npm install openai chrono-node express dotenv googleapis
    ```
3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory of the project. This file will store sensitive information like API keys and database connection strings.
    Example `.env` content:
    ```
    PORT=3000
    MONGO_URI=your_mongodb_connection_string # Or other database connection string
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback # Or your deployed redirect URI
    ```
    *Refer to `config/google-calendar.js` and `config/db.js` for specific variables needed.*

4.  **Set up Google Calendar API:**
    Follow the instructions in `config/google-calendar.js` to set up OAuth 2.0 credentials in your Google Cloud Project. Ensure the redirect URI matches what's configured in your `.env` file and Google Cloud Console.

5.  **Start the server:**
    ```bash
    node index.js
    ```
    The server will typically run on `http://localhost:3000` (or the `PORT` specified in your `.env`).

## Usage
Once the server is running, open `localhost:3000` in your web browser. You can then interact with the chat interface to schedule and manage your events using natural language commands.

## Contributing
Contributions are welcome! Please feel free to open issues or submit pull requests.

