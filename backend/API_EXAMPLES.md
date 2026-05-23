# Invyte API Examples

Base URL for the Expo app:

```ts
const API_URL = "http://192.168.99.102:8000/api";
```

Store the Sanctum token with SecureStore in the frontend:

```ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({ baseURL: API_URL, headers: { Accept: "application/json" } });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("invyte_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const response = await api.post("/auth/login", { email, password, device_name: "iphone" });
await SecureStore.setItemAsync("invyte_token", response.data.data.token);
```

## Auth

Register:

```http
POST /api/auth/register
```

```json
{
  "name": "Mia Tan",
  "username": "mia_events",
  "email": "mia@example.com",
  "phone_number": "+6591234567",
  "password": "password123",
  "password_confirmation": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "user": { "id": "uuid", "name": "Mia Tan", "email": "mia@example.com" },
    "token": "1|sanctum-token",
    "token_type": "Bearer"
  }
}
```

Forgot password:

```json
POST /api/auth/forgot-password
{ "email": "mia@example.com" }
```

Verify code:

```json
POST /api/auth/verify-code
{ "email": "mia@example.com", "code": "123456" }
```

Reset password:

```json
POST /api/auth/reset-password
{
  "email": "mia@example.com",
  "code": "123456",
  "password": "newPassword123",
  "password_confirmation": "newPassword123"
}
```

## Events

Create event:

```http
POST /api/events
Authorization: Bearer <token>
```

```json
{
  "category_slug": "birthday",
  "theme_slug": "celebration-pop",
  "title": "Ari's 7th Birthday",
  "description": "Cake, games, and dinner.",
  "start_date": "2026-06-20",
  "start_time": "15:00",
  "end_date": "2026-06-20",
  "end_time": "19:00",
  "venue_name": "East Coast Park",
  "venue_address": "Singapore",
  "privacy": "private",
  "status": "published",
  "max_guests": 80,
  "allow_plus_ones": true,
  "rsvp_deadline": "2026-06-15T15:59:00Z",
  "questions": [
    { "question": "Any dietary restrictions?", "question_type": "text", "required": false },
    { "question": "Meal choice", "question_type": "single_choice", "required": true, "options": ["Chicken", "Vegetarian"] }
  ]
}
```

List and search:

```http
GET /api/events?search=birthday&category=birthday&status=upcoming&sort=date_asc&page=1
```

Duplicate, archive, delete:

```http
POST /api/events/{event_uuid}/duplicate
POST /api/events/{event_uuid}/archive
DELETE /api/events/{event_uuid}
```

## Guests

Add guest:

```json
POST /api/events/{event_uuid}/guests
{
  "name": "Jamie Lee",
  "email": "jamie@example.com",
  "phone_number": "+6598765432",
  "invite_status": "sent"
}
```

Search/filter guests:

```http
GET /api/events/{event_uuid}/guests?search=jamie&status=going
```

Check in:

```json
POST /api/events/{event_uuid}/guests/{guest_uuid}/check-in
{ "checked_in": true }
```

## Public RSVP and QR

Public event by slug:

```http
GET /api/public/events/aris-7th-birthday
```

Submit RSVP:

```json
POST /api/public/events/aris-7th-birthday/rsvp
{
  "name": "Jamie Lee",
  "email": "jamie@example.com",
  "response_status": "going",
  "plus_ones": 1,
  "answers": [
    { "question_id": "question-uuid", "answer": "Vegetarian" }
  ]
}
```

QR data is returned on event resources:

```http
GET /api/events/{event_uuid}/qr
```

```json
{
  "qr": {
    "code": "INV-aris-7th-birthday",
    "url": "https://invyte.app/e/aris-7th-birthday",
    "payload": {
      "type": "event_rsvp",
      "slug": "aris-7th-birthday",
      "url": "https://invyte.app/e/aris-7th-birthday"
    }
  }
}
```

## Notifications and Profile

```http
GET /api/notifications
POST /api/notifications/read
GET /api/profile
PUT /api/profile
GET /api/profile/stats
```

Mark notifications as read:

```json
{ "ids": ["notification-uuid"] }
```

Send an empty body to mark all unread notifications as read.
