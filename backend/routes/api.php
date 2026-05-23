<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Events\EventController;
use App\Http\Controllers\Events\EventMetadataController;
use App\Http\Controllers\Guests\GuestEventController;
use App\Http\Controllers\Guests\GuestController;
use App\Http\Controllers\Notifications\NotificationController;
use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\RSVP\RsvpController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API connected',
        'data' => [
            'status' => 'ok',
        ],
    ]);
});

Route::middleware('throttle:60,1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/remember', [AuthController::class, 'remember']);
        Route::post('/guest', [AuthController::class, 'guest']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/verify-code', [AuthController::class, 'verifyCode']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    Route::prefix('public')->group(function () {
        Route::get('/events/{slug}', [RsvpController::class, 'publicShow']);
        Route::post('/events/{slug}/rsvp', [RsvpController::class, 'publicSubmit']);
    });
});

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/user', fn (Request $request) => response()->json([
        'success' => true,
        'message' => 'Authenticated user loaded',
        'data' => $request->user(),
    ]));

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/event-categories', [EventMetadataController::class, 'categories']);
    Route::get('/themes', [EventMetadataController::class, 'themes']);

    Route::apiResource('events', EventController::class);
    Route::post('/events/{event}/archive', [EventController::class, 'archive']);
    Route::post('/events/{event}/restore', [EventController::class, 'restore']);
    Route::delete('/events/{event}/force', [EventController::class, 'forceDelete']);
    Route::post('/events/{event}/duplicate', [EventController::class, 'duplicate']);
    Route::post('/events/{event}/cover', [EventController::class, 'cover']);
    Route::get('/events/{event}/qr', [EventController::class, 'qr']);
    Route::get('/events/{event}/activity-logs', [EventController::class, 'activityLogs']);

    Route::get('/events/{event}/guests', [GuestController::class, 'index']);
    Route::post('/events/{event}/guests', [GuestController::class, 'store']);
    Route::get('/events/{event}/guests/{guest}', [GuestController::class, 'show']);
    Route::put('/events/{event}/guests/{guest}', [GuestController::class, 'update']);
    Route::delete('/events/{event}/guests/{guest}', [GuestController::class, 'destroy']);
    Route::post('/events/{event}/guests/{guest}/check-in', [GuestController::class, 'checkIn']);
    Route::patch('/events/{event}/guests/{guest}/attendance', [GuestController::class, 'attendance']);

    Route::get('/events/{event}/rsvp/preview', [RsvpController::class, 'preview']);
    Route::get('/events/{event}/rsvp-preview', [RsvpController::class, 'preview']);
    Route::get('/events/{event}/rsvp/stats', [RsvpController::class, 'stats']);
    Route::get('/events/{event}/analytics', [RsvpController::class, 'stats']);
    Route::get('/events/{event}/rsvp/questions', [RsvpController::class, 'questions']);
    Route::post('/events/{event}/rsvp/questions', [RsvpController::class, 'storeQuestion']);
    Route::delete('/events/{event}/rsvp/questions/{question}', [RsvpController::class, 'destroyEventQuestion']);
    Route::post('/events/{event}/questions', [RsvpController::class, 'storeQuestion']);
    Route::delete('/questions/{question}', [RsvpController::class, 'destroyQuestion']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/push-token', [NotificationController::class, 'storePushToken']);
    Route::delete('/notifications/push-token', [NotificationController::class, 'destroyPushToken']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'avatar']);
    Route::get('/profile/stats', [ProfileController::class, 'stats']);

    Route::get('/guest/events', [GuestEventController::class, 'index']);
});
