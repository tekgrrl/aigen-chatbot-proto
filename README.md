# ChatBot_Prototype Application

## Overview

This document provides setup instructions, an architecture overview, and API documentation for the ChatBot_Prototype application. The application is designed to be a scalable, secure, and maintainable chatbot platform leveraging modern technologies including Node.js, MongoDB, Express, and various AI services.

## Setup Instructions

1. **Environment Configuration**: Before running the application, ensure to configure the necessary environment variables. Create a `.env` file in the root directory with the following variables:
   - `PORT`: The port number on which the application will run. e.g., `3000`.
   - `MONGODB_URI`: The MongoDB connection string.
   - `SESSION_SECRET`: A secret key for session management.
   - `CREDENTIALS`: Path to your X509 certificate for MongoDB Atlas connection.

2. **Install Dependencies**: Run `npm install` to install all required dependencies listed in the `package.json` file.

3. **Starting the Application**: After configuring the environment variables and installing dependencies, start the application by running `npm start`. This will start the server on the configured port.

## Architecture Overview

The application follows a modular architecture to ensure scalability and maintainability:

- **Backend**: The Node.js backend uses Express to handle HTTP requests and Mongoose for interacting with MongoDB. It serves the Gradio interface for the chatbot and handles authentication and session management.

- **Database**: MongoDB Atlas is used for persistent storage of user profiles and chat histories. Secure connection to the database is ensured through the use of an X509 certificate.

- **AI Services Integration**: The application integrates with AI models (OpenAI GPT-4 or GPT-3.5, and Ollama) via API calls for generating chatbot responses.

- **Frontend**: The frontend employs Bootstrap for styling and Gradio for creating the chatbot interface.

- **Authentication and Session Management**: User authentication is managed through session cookies, with persistent login implemented using `express-session` and `connect-mongo`.

## API Documentation

### Authentication Endpoints

- `/auth/register`: Registers a new user with a username and password.
- `/auth/login`: Authenticates a user and establishes a session.
- `/auth/logout`: Logs out a user and destroys the session.
- `/auth/profile`: Displays and allows updating the user's profile (authenticated users only).

### Chat Interface

- `/chat`: Serves the Gradio interface for interacting with the chatbot. Accessible only to authenticated users.

## Logging and Error Handling

Logging is implemented using the Winston library for both console and file logging. Error handling is centralized through middleware that captures and logs errors, returning user-friendly messages to the client.

## Security Considerations

The application includes several security measures:
- Sanitization of input data to prevent injection attacks.
- Secure session management with HTTP-only, Secure, and SameSite cookie attributes.
- Encrypted password storage using bcrypt.
- Management of sensitive configuration data through environment variables.

For any additional information or support, please refer to the project's GitHub repository or contact the development team.