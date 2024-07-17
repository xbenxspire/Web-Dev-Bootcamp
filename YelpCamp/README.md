# YelpCamp Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB

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

1. Copy `.env.example` to `.env`
2. Fill in your own values in the `.env` file

4. Start MongoDB locally (default port: 27017)

5. Launch the app:
   ```
   npm start
   ```

6. Visit http://localhost:3000 in your browser

## Development

For auto-reloading:
```
npm run dev
```

## Configuration

- MongoDB URL: `mongodb://localhost:27017/yelp-camp`
- Default port: 3000 (override with PORT env variable)
- Session secret: Set in `.env` file

For more details, see comments in `app.js`.