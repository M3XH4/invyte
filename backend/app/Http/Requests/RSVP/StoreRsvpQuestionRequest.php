<?php

namespace App\Http\Requests\RSVP;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class StoreRsvpQuestionRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:255'],
            'question_type' => ['required', Rule::in(['text', 'textarea', 'single_choice', 'multi_choice', 'yes_no'])],
            'required' => ['nullable', 'boolean'],
            'options' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
