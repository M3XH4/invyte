<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyCodeRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Notifications\PasswordResetCodeNotification;
use App\Services\AuthService;
use App\Services\PasswordResetCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends ApiController
{
    public function __construct(
        private readonly AuthService $auth,
        private readonly PasswordResetCodeService $codes
    ) {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $payload = $this->auth->register($request->validated());

        return $this->success('Registered successfully', $this->authPayload($payload), 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $payload = $this->auth->login($request->validated());

        return $this->success('Logged in successfully', $this->authPayload($payload));
    }

    public function remember(Request $request): JsonResponse
    {
        $data = $request->validate([
            'remember_token' => ['required', 'string'],
        ]);

        $payload = $this->auth->restoreFromRememberToken($data['remember_token']);

        return $this->success('Session restored successfully', $this->authPayload($payload));
    }

    public function guest(Request $request): JsonResponse
    {
        $payload = $this->auth->guestToken($request->string('device_name', 'expo-guest')->toString());

        return $this->success('Guest session created', $this->authPayload($payload), 201);
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->boolean('logout_all')) {
            $request->user()->tokens()->delete();

            return $this->success('Logged out successfully');
        }

        if ($request->boolean('forget_remember')) {
            $request->user()->tokens()->where('name', 'remember-token')->delete();
        }

        $request->user()->currentAccessToken()?->delete();

        return $this->success('Logged out successfully');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success('Profile loaded', new UserResource($request->user()));
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $code = $this->codes->issue($request->validated('email'));
        User::where('email', $request->validated('email'))->first()?->notify(new PasswordResetCodeNotification($code));

        $data = app()->isProduction() ? null : ['debug_code' => $code];

        return $this->success('Verification code sent', $data);
    }

    public function verifyCode(VerifyCodeRequest $request): JsonResponse
    {
        $this->codes->verify($request->validated('email'), $request->validated('code'));

        return $this->success('Verification code confirmed');
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->codes->consume($data['email'], $data['code']);

        User::where('email', $data['email'])->firstOrFail()->update([
            'password' => $data['password'],
        ]);

        return $this->success('Password reset successfully');
    }

    private function authPayload(array $payload): array
    {
        return [
            'user' => new UserResource($payload['user']),
            'token' => $payload['token'],
            'access_token' => $payload['access_token'] ?? $payload['token'],
            'remember_token' => $payload['remember_token'] ?? null,
            'expires_at' => $payload['expires_at'] ?? null,
            'token_type' => $payload['token_type'],
        ];
    }
}
