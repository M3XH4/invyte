FROM dunglas/frankenphp:php8.4

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libzip-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN composer install --no-dev --optimize-autoloader --no-scripts

RUN chmod -R 775 storage bootstrap/cache

RUN php artisan storage:link || true
RUN php artisan optimize:clear || true

EXPOSE 8000

CMD php artisan migrate --force && \
    php artisan db:seed --force && \
    php artisan octane:frankenphp --host=0.0.0.0 --port=${PORT}