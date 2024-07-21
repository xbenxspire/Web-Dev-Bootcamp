# YelpCamp Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB Atlas account or local MongoDB installation

## Quick Start

1. Clone and enter the repository:
   ```
   git clone https://github.com/your-username/yelpcamp.git
   cd YelpCamp
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Environment Setup

1. Create a `.env` file in the root directory
2. Add the following variables to the `.env` file:
   ```
   DB_URL=mongodb+srv://your_mongodb_atlas_url
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_KEY=your_cloudinary_key
   CLOUDINARY_SECRET=your_cloudinary_secret
   MAPTILER_API_KEY=your_maptiler_api_key
   SECRET=your_session_secret
   ```
3. Replace the placeholder values with your actual credentials

## Database Seeding

To populate the database with initial campgrounds:
```
node seeds/index.js
```

## Launch the Application

Start the server:
```
npm start
```

Visit http://localhost:3000 in your browser

## Development

For auto-reloading during development:
```
npm run dev
```

## Configuration

- Default port: 3000 (override with PORT env variable)
- Session secret: Set in `.env` file

For more details, see comments in `app.js`.
