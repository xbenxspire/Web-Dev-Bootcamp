# YelpCamp Setup Guide

## Prerequisites
- Node.js (v14 or later)
- MongoDB

## Setup Steps

1. Clone the repository:
   git clone https://github.com/your-username/yelpcamp.git
   cd YelpCamp

2. Install dependencies:
   npm install

3. Create a .env file in the root directory with:
   SESSION_SECRET=your_secret_key_here

4. Ensure MongoDB is running locally on default port (27017)

5. Start the application:
   npm start

6. Open a web browser and go to http://localhost:3000

## Development Mode
For auto-reloading during development:
npm run dev

## Notes
- The app uses MongoDB at mongodb://localhost:27017/yelp-camp
- Default port is 3000, change with PORT environment variable
- Customize session secret in .env for security

For more details, refer to the comments in app.js: