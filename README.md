# Vehicle System

Vehicle System is a React + Vite web app for managing vehicle services, spare parts, bookings, orders, and customer accounts. It uses Firebase for backend services and Razorpay for payment flow.

## Tech Stack

- React 19
- Vite
- React Router
- Firebase
- Razorpay
- Tailwind CSS

## Features

- User registration and login
- Vehicle browsing and store catalog
- Cart and checkout flow
- Service bookings and order tracking
- User profile and dashboard pages
- Admin-oriented management screens

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build the project for production:

```bash
npm run build
```

4. Preview the production build:

```bash
npm run preview
```

5. Create a local `.env` file and add your Firebase API key:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
```

## Project Structure

- `src/pages` - page-level views
- `src/components` - reusable UI components
- `src/context` - shared app context
- `src/config` - Firebase and Razorpay configuration

## Notes

- Firebase config reads the API key from `VITE_FIREBASE_API_KEY`.
- Razorpay settings are configured in `src/config`.
