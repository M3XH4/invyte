<?php

namespace App\Http\Requests\Guests;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class StoreGuestRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:180'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:40'],
            'role' => ['nullable', Rule::in(['guest', 'cohost', 'vip'])],
            'invite_status' => ['nullable', Rule::in(['pending', 'sent', 'opened', 'expired'])],
            'response_status' => ['nullable', Rule::in(['pending', 'going', 'maybe', 'not_going'])],
            'plus_ones' => ['nullable', 'integer', 'min:0', 'max:20'],
        ];
    }
}
