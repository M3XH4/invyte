<?php

namespace App\Http\Requests\Notifications;

use App\Http\Requests\ApiFormRequest;

class MarkNotificationsReadRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'ids' => ['nullable', 'array'],
            'ids.*' => ['uuid', 'exists:notifications,id'],
        ];
    }
}
