<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    private const ACCESS_TOKEN_DAYS = 1;
    private const REMEMBER_TOKEN_DAYS = 30;

    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'username' => $data['username'] ?? null,
            'email' => $data['email'],
            'phone_number' => $data['phone_number'] ?? null,
            'password' => $data['password'],
            'role' => 'host',
            'is_guest' => false,
        ]);

        return $this->tokenPayload($user, $data['device_name'] ?? 'expo-mobile');
    }

    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect.',
            ]);
        }

        return $this->tokenPayload(
            $user,
            $data['device_name'] ?? 'expo-mobile',
            (bool) ($data['remember_me'] ?? false)
        );
    }

    public function guestToken(string $deviceName = 'expo-guest'): array
    {
        $user = User::create([
            'name' => 'Guest User',
            'email' => 'guest-'.str()->uuid().'@guest.invyte.local',
            'password' => str()->password(32),
            'role' => 'guest',
            'is_guest' => true,
        ]);

        return $this->tokenPayload($user, $deviceName);
    }

    public function restoreFromRememberToken(string $rememberToken): array
    {
        $token = PersonalAccessToken::findToken($rememberToken);

        if (! $token || ! $token->can('remember') || ($token->expires_at && $token->expires_at->isPast())) {
            throw ValidationException::withMessages([
                'remember_token' => 'The remember token is invalid or expired.',
            ]);
        }

        $user = $token->tokenable;

        if (! $user instanceof User) {
            throw ValidationException::withMessages([
                'remember_token' => 'The remember token is invalid.',
            ]);
        }

        $token->delete();

        return $this->tokenPayload($user, 'expo-mobile', true);
    }

    private function tokenPayload(User $user, string $deviceName, bool $remember = false): array
    {
        $accessExpiresAt = Carbon::now()->addDays(self::ACCESS_TOKEN_DAYS);
        $accessToken = $user->createToken($deviceName, ['*'], $accessExpiresAt)->plainTextToken;
        $rememberExpiresAt = Carbon::now()->addDays(self::REMEMBER_TOKEN_DAYS);

        return [
            'user' => $user,
            'token' => $accessToken,
            'access_token' => $accessToken,
            'remember_token' => $remember
                ? $user->createToken('remember-token', ['remember'], $rememberExpiresAt)->plainTextToken
                : null,
            'expires_at' => $accessExpiresAt->toIso8601String(),
            'token_type' => 'Bearer',
        ];
    }
}
