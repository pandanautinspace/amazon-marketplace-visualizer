# Environment Setup

This project uses environment variables to store Firebase configuration securely. 

## Setup Instructions

1. Copy the example environment file:
   ```
   copy .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values with your actual Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. The `.env` file is automatically ignored by Git to keep your credentials secure.

## Build Process

The environment variables are automatically loaded during the webpack build process and made available to the application via `process.env`.

## Security Notes

- Never commit the `.env` file to version control
- Use the `.env.example` file as a template for new environments
- All Firebase environment variables must be prefixed with `REACT_APP_` to be available in the browser