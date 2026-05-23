<?php

namespace App\Http\Requests\Guests;

class UpdateGuestRequest extends StoreGuestRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['name'] = ['sometimes', 'required', 'string', 'max:180'];

        return $rules;
    }
}
