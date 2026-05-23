<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserPushToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    public function register(User $user, array $data): UserPushToken
    {
        return UserPushToken::updateOrCreate(
            ['token' => $data['token']],
            [
                'user_id' => $user->id,
                'platform' => $data['platform'] ?? null,
                'device_name' => $data['device_name'] ?? null,
                'last_used_at' => now(),
            ]
        );
    }

    public function unregister(User $user, string $token): int
    {
        return $user->pushTokens()->where('token', $token)->delete();
    }

    public function sendToUser(User|string $user, string $title, string $body, array $data = []): void
    {
        $query = UserPushToken::query()
            ->where('user_id', $user instanceof User ? $user->id : $user);

        $tokens = $query->pluck('token')->filter()->values();

        if ($tokens->isEmpty()) {
            return;
        }

        $messages = $tokens->map(fn (string $token) => [
            'to' => $token,
            'sound' => 'default',
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'priority' => 'high',
        ])->all();

        try {
            $response = Http::timeout(5)
                ->acceptJson()
                ->post(config('services.expo_push.url'), $messages);

            if (! $response->successful()) {
                Log::warning('Expo push notification request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $error) {
            Log::warning('Expo push notification request errored', [
                'message' => $error->getMessage(),
            ]);
        }
    }
}
