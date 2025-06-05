#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print with color
print_green() {
    echo -e "${GREEN}$1${NC}"
}

print_yellow() {
    echo -e "${YELLOW}$1${NC}"
}

print_red() {
    echo -e "${RED}$1${NC}"
}

# Frontend deployment
deploy_frontend() {
    print_yellow "🚀 Deploying Frontend..."
    cd ~/calendar-app/frontend
    npm install
    npm run build
    sudo cp -r build/* /var/www/calendar-frontend/
    print_green "✅ Frontend deployed successfully!"
    cd ..
}

# Backend deployment
deploy_backend() {
    print_yellow "🚀 Deploying Backend..."
    cd ~/calendar-app/backend
    composer install --no-dev --optimize-autoloader
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    sudo systemctl restart php8.2-fpm
    print_green "✅ Backend deployed successfully!"
    cd ..
}

# Deploy both frontend and backend
deploy_all() {
    deploy_backend
    deploy_frontend
}

# Laravel maintenance commands
laravel_maintenance() {
    print_yellow "🧹 Running Laravel maintenance commands..."
    cd ~/calendar-app/backend
    php artisan config:cache
    php artisan config:clear
    php artisan cache:clear
    php artisan route:clear
    php artisan view:clear
    php artisan optimize:clear
    print_green "✅ Laravel maintenance completed!"
    cd ..
}

# Clear Nginx cache
clear_nginx_cache() {
    print_yellow "🧹 Clearing Nginx cache..."
    sudo rm -rf /var/cache/nginx/*
    sudo systemctl restart nginx
    print_green "✅ Nginx cache cleared!"
}

# Clear all caches (Laravel, Nginx, etc.)
clear_all_caches() {
    laravel_maintenance
    clear_nginx_cache
}

# Check system status
check_status() {
    print_yellow "🔍 Checking system status..."
    
    echo -e "\n${YELLOW}Nginx Status:${NC}"
    sudo systemctl status nginx | grep "Active:"
    
    echo -e "\n${YELLOW}PHP-FPM Status:${NC}"
    sudo systemctl status php8.2-fpm | grep "Active:"
    
    echo -e "\n${YELLOW}Storage Permissions:${NC}"
    ls -l backend/storage/
    
    echo -e "\n${YELLOW}Frontend Build:${NC}"
    ls -l frontend/build/
}

# Fix permissions
fix_permissions() {
    print_yellow "🔧 Fixing permissions..."
    sudo chown -R www-data:www-data backend/storage
    sudo chown -R www-data:www-data backend/bootstrap/cache
    sudo chmod -R 775 backend/storage
    sudo chmod -R 775 backend/bootstrap/cache
    print_green "✅ Permissions fixed!"
}

# Show help
show_help() {
    echo -e "${YELLOW}Available commands:${NC}"
    echo "  deploy-frontend    - Deploy frontend only"
    echo "  deploy-backend     - Deploy backend only"
    echo "  deploy-all        - Deploy both frontend and backend"
    echo "  clear-cache       - Clear all caches (Laravel, Nginx)"
    echo "  laravel-clear     - Clear Laravel caches only"
    echo "  nginx-clear       - Clear Nginx cache only"
    echo "  check-status      - Check system status"
    echo "  fix-permissions   - Fix storage and cache permissions"
    echo "  help             - Show this help message"
}

# Main script
case "$1" in
    "deploy-frontend")
        deploy_frontend
        ;;
    "deploy-backend")
        deploy_backend
        ;;
    "deploy-all")
        deploy_all
        ;;
    "clear-cache")
        clear_all_caches
        ;;
    "laravel-clear")
        laravel_maintenance
        ;;
    "nginx-clear")
        clear_nginx_cache
        ;;
    "check-status")
        check_status
        ;;
    "fix-permissions")
        fix_permissions
        ;;
    "help"|"")
        show_help
        ;;
    *)
        print_red "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac 
