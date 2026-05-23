<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\ApiFormRequest;

class LoginRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember_me' => ['nullable', 'boolean'],
            'device_name' => ['nullable', 'string', 'max:120'],
        ];
    }
}
