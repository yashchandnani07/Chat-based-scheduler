# Chat-Based Scheduler

## Overview
Unlock effortless organization with this sophisticated Node.js chat-based scheduler. It intelligently interprets your natural language commands to manage your calendar, streamline appointments, and enhance productivity through intuitive, conversational interactions.

## Features
- **Natural Language Processing**: Understands and processes scheduling requests in plain English using Groq Cloud's powerful AI models.
- **Calendar Management**: Create, view, and manage events and appointments.
- **Google Calendar Integration**: Seamlessly syncs with your Google Calendar.
- **Database Persistence**: Stores schedule data in MongoDB for reliable access.
- **User-Friendly Frontend**: An intuitive web interface for interaction.

## 🖼️ Screenshots

### Event Creation Success
![Schedule Created](screenshots/Schedule%20Created.png)

### Chat-Based Input
![Chat Input](screenshots/Chat%20Input.png)

### Calendar Integration
![Google Calendar Event](screenshots/Google%20Calendar%20Event.png)


## Technologies Used
- **Backend**: Node.js, Express, `dotenv`, `googleapis`
- **AI Provider**: Groq Cloud (via OpenAI SDK)
- **Database**: MongoDB (Mongoose)
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
- A Google Cloud Project with Google Calendar API enabled
- A MongoDB database instance

### Steps
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yashchandnani07/Chat-based-scheduler.git
    cd Chat-based-scheduler
    ``` 
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory of the project.
    
    Example `.env` content:
    ```env
    MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
    
    # Google Calendar API
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
    
    # Groq Cloud API
    GROQ_API_KEY=gsk_...
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3000`.

## Usage
1.  Open `http://localhost:3000` in your web browser.
2.  Log in with your Google account to enable Calendar sync.
3.  Type a request like "Schedule a meeting with John next Friday at 2 PM".
4.  The app will parse your request and add it to your Google Calendar.

## Contributing
Contributions are welcome! Please feel free to open issues or submit pull requests.

