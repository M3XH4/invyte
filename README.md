# 🎉 Invyte — RSVP & Event Management Platform

<p align="center">
  <img src="./assets/images/icon.png" alt="Invyte Logo" width="150" />
</p>

<p align="center">
  <strong>Create events, manage guests, track RSVPs, and simplify event planning.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-Expo-blue" />
  <img src="https://img.shields.io/badge/Laravel-13-red" />
  <img src="https://img.shields.io/badge/MySQL-Database-orange" />
  <img src="https://img.shields.io/badge/TypeScript-Supported-blue" />
  <img src="https://img.shields.io/badge/Status-In%20Development-success" />
</p>

---

# 📖 Overview

Invyte is a modern RSVP and Event Management platform designed to streamline the entire event lifecycle—from event creation and invitation management to RSVP tracking, attendance monitoring, and analytics.

The platform consists of:

* 📱 Mobile Application (React Native + Expo)
* 🌐 Web Admin Portal
* ⚙️ Laravel REST API Backend
* 🗄️ MySQL Database
* 📷 QR Code RSVP System
* 🔔 Notification System
* 📊 Analytics Dashboard

---

# ✨ Features

## Event Management

* Create and manage events
* Event categories
* Custom event themes
* Cover image uploads
* Event scheduling
* Venue management
* Event archiving and restoration

## RSVP Management

* QR Code invitations
* RSVP response collection
* RSVP deadline configuration
* Custom RSVP questions
* Plus-one support
* Guest approval workflows

## Guest Management

* Add guests manually
* Import guest lists
* Guest profiles
* Attendance tracking
* RSVP history
* Guest survey responses

## Analytics

* RSVP statistics
* Attendance analytics
* Guest response trends
* Event performance reports

## User Management

* Authentication
* Remember Me functionality
* Profile management
* Role-based access control

## Notifications

* Event updates
* RSVP reminders
* Attendance notifications
* In-app notifications

---

# 🏗️ System Architecture

```text
React Native Mobile App
            │
            ▼
      Laravel API
            │
            ▼
        MySQL DB
            │
            ▼
      File Storage
```

Additional Components:

```text
Mobile App
     │
     ├── QR Scanner
     ├── RSVP Forms
     ├── Event Management
     └── Guest Portal

Admin Portal
     │
     ├── Dashboard
     ├── User Management
     ├── Event Management
     ├── Analytics
     └── Reports

Laravel Backend
     │
     ├── Authentication
     ├── Events Module
     ├── Guests Module
     ├── RSVP Module
     ├── Notifications
     └── Analytics
```

---

# 🛠️ Tech Stack

## Frontend (Mobile)

* React Native
* Expo
* TypeScript
* NativeWind
* Axios
* Expo Router
* Expo Camera
* Expo Image Picker

## Backend

* Laravel 13
* Sanctum Authentication
* REST API
* Eloquent ORM

## Database

* MySQL

## Admin Portal

* React
* TypeScript
* Vite
* Tailwind CSS

---

# 📂 Project Structure

```text
invyte/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── assets/
│
├── backend/
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── storage/
│
├── admin/
│   ├── src/
│   ├── pages/
│   ├── components/
│   └── services/
│
└── docs/
```

---

# 🚀 Installation

## Backend

```bash
git clone https://github.com/yourusername/invyte.git

cd backend

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate --seed

php artisan storage:link

php artisan serve
```

---

## Mobile App

```bash
cd frontend

npm install

npx expo start
```

---

## Admin Portal

```bash
cd admin

npm install

npm run dev
```

---

# 🔑 Environment Variables

## Backend

```env
APP_NAME=Invyte
APP_ENV=production
APP_KEY=
APP_URL=

DB_CONNECTION=mysql
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

---

## Mobile

```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

---

## Admin

```env
VITE_API_URL=https://your-api-domain.com/api
```

---

# 📱 QR RSVP Workflow

```text
Host Creates Event
          │
          ▼
Generate QR Code
          │
          ▼
Guest Scans QR
          │
          ▼
RSVP Form Opens
          │
          ▼
Guest Submits Response
          │
          ▼
Attendance & Analytics Updated
```

---

# 🔒 Security Features

* Laravel Sanctum Authentication
* Password Hashing
* Token-Based Authentication
* Protected API Routes
* Role-Based Access Control
* Secure File Uploads

---

# 📊 Future Enhancements

* Push Notifications
* Email Invitations
* SMS Invitations
* Google Calendar Integration
* Event Check-In Kiosk
* AI Guest Insights
* Multi-Organization Support

---

# 📄 License

This project is licensed under the MIT License.

---