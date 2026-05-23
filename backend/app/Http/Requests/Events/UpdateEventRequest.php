<?php

namespace App\Http\Requests\Events;

class UpdateEventRequest extends StoreEventRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['title'] = ['sometimes', 'required', 'string', 'max:180'];
        $rules['start_date'] = ['sometimes', 'required', 'date'];
        $rules['venue_address'] = ['sometimes', 'required', 'string', 'max:1000'];

        return $rules;
    }
}
