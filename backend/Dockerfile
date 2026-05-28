FROM richarvey/nginx-php-fpm:latest

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-scripts

RUN chmod -R 775 storage bootstrap/cache

RUN php artisan storage:link || true
RUN php artisan optimize:clear || true

CMD php artisan migrate --force && \
    php artisan db:seed --force && \
    /start.sh