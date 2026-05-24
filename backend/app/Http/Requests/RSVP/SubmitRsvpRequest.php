<?php

namespace App\Http\Requests\RSVP;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class SubmitRsvpRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'guest_id' => ['nullable', 'uuid', 'exists:event_guests,id'],
            'name' => [
                Rule::requiredIf(fn () => ! $this->filled('guest_id') && ! $this->user('sanctum')),
                'nullable',
                'string',
                'max:180',
            ],
            'email' => ['nullable', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:40'],
            'response_status' => ['required', Rule::in(['going', 'maybe', 'not_going'])],
            'plus_ones' => ['nullable', 'integer', 'min:0', 'max:20'],
            'answers' => ['nullable', 'array'],
            'answers.*.question_id' => ['required_with:answers', 'uuid', 'exists:rsvp_questions,id'],
            'answers.*.answer' => ['nullable'],
        ];
    }
}
