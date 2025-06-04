# Calendar App

A modern calendar application with:
- **React** frontend (FullCalendar, CRUD, Google/Apple sync)
- **Laravel** backend (API, Google OAuth, Apple iCal)
- **Google Calendar** and **Apple Calendar** synchronization
- Ready for deployment on Vercel (frontend) and any PHP host (backend)

---

## Project Structure

```
calendar-app/
├── backend/   # Laravel API
└── frontend/  # React app
```

---

## Getting Started (Local Development)

### 1. Backend (Laravel)

```sh
cd backend
composer install
cp .env.example .env
# Set up your DB and Google credentials in .env
php artisan key:generate
php artisan migrate
php artisan serve
```

- Place your Google OAuth credentials as `backend/storage/app/google-credentials.json`.
- Update `.env` with your DB and Google settings.

### 2. Frontend (React)

```sh
cd frontend
npm install
npm start
```

- The app runs at `http://localhost:3000` by default.

---

## Google OAuth Setup

1. Create a Google Cloud project and OAuth 2.0 credentials.
2. Add these **Authorized redirect URIs**:
   ```
   http://localhost:8000/api/calendar-sync/google/callback
   https://your-production-domain/api/calendar-sync/google/callback
   ```
3. Add these **Authorized domains**:
   ```
   localhost
   your-production-domain
   ```
4. Add your Google account as a test user (if not published).

---

## Deployment

### Frontend (Vercel)

1. **Push your code to GitHub** (see earlier instructions).
2. **Go to [Vercel](https://vercel.com/)** and sign in with your GitHub account.
3. **Import your repository** and select the `frontend/` directory as the project root.
4. **Set Environment Variables** in the Vercel dashboard:
    - If your backend API is deployed (not on localhost), set:
      ```
      REACT_APP_API_BASE_URL=https://your-backend-domain
      ```
    - Update your React code to use this variable, e.g.:
      ```js
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      axios.get(`${API_BASE_URL}/api/calendar-sync/status`);
      ```
5. **Deploy** the project.
6. **Set up your custom domain** (e.g., `calendar.example.dev`) in the Vercel dashboard.
7. **Update your Google OAuth settings**:
    - Add your deployed frontend and backend URLs to the Google Cloud Console as authorized domains and redirect URIs.

#### Notes:
- Your React app will be served from your Vercel domain (e.g., `https://calendar.example.dev`).
- Your backend API must be accessible from this domain (CORS must allow it).
- All API calls in your React app should use the deployed backend URL, not `localhost`.

### Backend (PHP Host)

- Deploy `backend/` to a PHP host (Render, Railway, Heroku, or VPS).
- Set up your `.env` for production.
- Ensure your API is accessible from your frontend domain.

### Update API URLs

- In `frontend/src/components/CalendarSync.jsx` and other files, update API URLs from `http://localhost:8000` to your production backend URL, or use the `REACT_APP_API_BASE_URL` environment variable as shown above.

---

## Environment Variables

- **Never commit `.env` files or secrets to GitHub!**
- Add `.env` to `.gitignore`.

---

## Features

- Full CRUD for calendar events
- Google Calendar sync (OAuth2)
- Apple Calendar export (iCal)
- Modern UI with FullCalendar and custom styling

---

## Troubleshooting

- **CORS errors:** Update `backend/config/cors.php` to allow your frontend domain.
- **Google OAuth errors:** Ensure redirect URIs and authorized domains match exactly.
- **OAuth consent screen:** Add your Google account as a test user or publish the app.

---

## License

MIT

---

## Author

[Alex Ostrander](https://github.com/AlexOstrander) 