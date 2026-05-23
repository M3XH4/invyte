<?php

namespace App\Services;

use App\Models\PasswordResetCode;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PasswordResetCodeService
{
    public function issue(string $email): string
    {
        PasswordResetCode::where('email', $email)->delete();

        $code = (string) random_int(100000, 999999);

        PasswordResetCode::create([
            'email' => $email,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(15),
        ]);

        return $code;
    }

    public function verify(string $email, string $code): PasswordResetCode
    {
        $record = PasswordResetCode::where('email', $email)->latest()->first();

        if (! $record || $record->expires_at->isPast()) {
            throw ValidationException::withMessages(['code' => 'The verification code is invalid or expired.']);
        }

        if ($record->attempts >= 5) {
            throw ValidationException::withMessages(['code' => 'Too many failed verification attempts. Please request a new code.']);
        }

        if (! Hash::check($code, $record->code_hash)) {
            $record->increment('attempts');
            throw ValidationException::withMessages(['code' => 'The verification code is invalid.']);
        }

        $record->forceFill(['verified_at' => now()])->save();

        return $record;
    }

    public function consume(string $email, string $code): void
    {
        $this->verify($email, $code)->delete();
    }
}
