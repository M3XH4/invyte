<?php

namespace App\Http\Requests\Events;

use App\Http\Requests\ApiFormRequest;

class UploadEventCoverRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'cover' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
