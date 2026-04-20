# MoodBoard 🧠✨

MoodBoard is a modern, private daily emotional journal that allows you to log your feelings, identify patterns, and receive AI-powered insights about your emotional well-being using the Google Gemini ecosystem.

## Features

- **Auth & Security**: Secure authentication via Firebase using Email/Password and Google OAuth.
- **Daily Journaling**: Interactive grids to identify emotional severity mapped to dynamic color hierarchies. Look back sequentially into notes reflecting what drove your highs and lows.
- **Real-Time Database Data Engine**: Leverages Firebase Firestore listeners securely downloading history across devices without ever refreshing.
- **AI Analytics Engine**: Utilizes Google's Gemini 2.0 Flash REST endpoint analyzing recent histories mapping out explicit "Emotional Patterns", "Key Triggers", and highly "Personalized Suggestions".
- **Dynamic Trend Charting**: Leverages `recharts` arrays visualizing your specific rolling frequencies over 7, 30, and 90-day trajectory paths.
- **Offline Draft Resilience**: Implements caching buffers into the logging flow guaranteeing accidental tab closes never destroy unsaved diary entries.
- **Streak Gamification**: Calculates sequential commitments natively against server timestamps securely.

## Tech Stack

- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend/DB**: [Firebase](https://firebase.google.com/) (Auth & Firestore)
- **AI/LLM**: [Google Gemini Pro AI](https://deepmind.google/technologies/gemini/)
- **Data Visualizations**: [Recharts](https://recharts.org/)
- **Notifications**: `react-hot-toast`

## Installation & Setup

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file at the root of the directory corresponding to your exact Firebase and Gemini Credentials:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
   VITE_GEMINI_API_KEY="your-gemini-key"
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

## Design Architecture & Performance

MoodBoard was built avoiding heavy UI render thrashing. It heavily leverages `useCallback` and `useMemo` hooks isolating presentation blocks to ensure interactive dashboards featuring custom graphical components map safely against constant state calculations.

_Note: To avoid explicit Google Cloud Composite Index requirements during early development phases, `getMoodsByUser` filters arrays directly utilizing native Javascript iterators over explicit Firestore queries._
