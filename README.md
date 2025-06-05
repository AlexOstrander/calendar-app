# Calendar Application

A full-stack calendar application with Google Calendar integration, built with React and Laravel.

## Features

- 📅 Calendar view with month/week/day views
- 🔄 Google Calendar sync
- 📱 Responsive design
- 🔐 User authentication
- 🎨 Modern UI with event colors
- ⏰ All-day and timed events
- 🔍 Event search and filtering

## Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 16+ and npm
- MySQL 8.0+
- Nginx
- SSL certificate (for Google OAuth)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd calendar-app
```

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your .env file with:
# - Database credentials
# - Google OAuth credentials
# - Session and Sanctum settings

# Run migrations
php artisan migrate

# Set proper permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your .env file with:
# - REACT_APP_API_BASE_URL (your backend URL)
```

### 4. Nginx Configuration

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/calendar-app
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/calendar-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Deployment

We've created a deployment script to make it easy to deploy and maintain the application. First, set up the script:

```bash
# Make the script executable
chmod +x deploy.sh

# Set proper ownership (important for security)
sudo chown www-data:www-data deploy.sh

# Make the script available system-wide (optional)
sudo ln -s $(pwd)/deploy.sh /usr/local/bin/calendar-deploy
```

Then use the following commands (you can use either the local script or the system-wide command):

```bash
# Using the local script
sudo -u www-data ./deploy.sh help

# OR using the system-wide command
sudo -u www-data calendar-deploy help

# Deploy both frontend and backend
sudo -u www-data calendar-deploy deploy-all

# Deploy only frontend
sudo -u www-data calendar-deploy deploy-frontend

# Deploy only backend
sudo -u www-data calendar-deploy deploy-backend

# Clear all caches
sudo -u www-data calendar-deploy clear-cache

# Check system status
sudo -u www-data calendar-deploy check-status

# Fix permissions
sudo -u www-data calendar-deploy fix-permissions
```

Note: Always run the deployment script as the www-data user for proper permissions and security.

## Google Calendar Integration

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Download the credentials and save as `backend/storage/app/google-credentials.json`
6. Add the following to your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=https://your-domain.com/api/calendar-sync/google/callback
   ```

## Development

### Backend Development

```bash
cd backend
php artisan serve
```

### Frontend Development

```bash
cd frontend
npm start
```

## Troubleshooting

### Common Issues

1. **CORS Issues**
   - Check your CORS configuration in `backend/config/cors.php`
   - Ensure your frontend URL is in the allowed origins

2. **Google OAuth Issues**
   - Verify your redirect URI matches exactly
   - Check that your credentials file is in the correct location
   - Ensure your domain is verified in Google Cloud Console

3. **Permission Issues**
   - Run `./deploy.sh fix-permissions` to fix storage and cache permissions

4. **Cache Issues**
   - Run `./deploy.sh clear-cache` to clear all caches

## Security Considerations

1. Always use HTTPS in production
2. Keep your `.env` files secure and never commit them
3. Regularly update dependencies
4. Use strong passwords for your database
5. Keep your SSL certificates up to date

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 