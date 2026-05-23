<?php

namespace App\Http\Requests\Notifications;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class StorePushTokenRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:512'],
            'platform' => ['nullable', 'string', Rule::in(['ios', 'android', 'web'])],
            'device_name' => ['nullable', 'string', 'max:120'],
        ];
    }
}
