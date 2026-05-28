FROM richarvey/nginx-php-fpm:latest

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chmod -R 775 storage bootstrap/cache

RUN php artisan storage:link || true

RUN php artisan config:clear
RUN php artisan route:clear
RUN php artisan view:clear

CMD php artisan migrate --force && \
    php artisan db:seed --force && \
    /start.sh