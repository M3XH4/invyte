<?php

namespace App\Http\Requests\Events;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'uuid', 'exists:event_categories,id'],
            'category_slug' => ['nullable', 'string', 'exists:event_categories,slug'],
            'theme_id' => ['nullable', 'uuid', 'exists:themes,id'],
            'theme_slug' => ['nullable', 'string', 'exists:themes,slug'],
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:5000'],
            'cover_image' => ['nullable', 'url', 'max:2048'],
            'start_date' => ['required', 'date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'venue_name' => ['nullable', 'string', 'max:180'],
            'venue_address' => ['required', 'string', 'max:1000'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'privacy' => ['nullable', Rule::in(['private', 'public', 'unlisted'])],
            'status' => ['nullable', Rule::in(['draft', 'published', 'cancelled'])],
            'dress_code' => ['nullable', 'string', 'max:120'],
            'food_option' => ['nullable', 'string', 'max:120'],
            'max_guests' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'rsvp_enabled' => ['nullable', 'boolean'],
            'allow_plus_ones' => ['nullable', 'boolean'],
            'allow_guest_invites' => ['nullable', 'boolean'],
            'show_guest_list' => ['nullable', 'boolean'],
            'rsvp_deadline' => ['nullable', 'date'],
            'questions' => ['nullable', 'array'],
            'questions.*.question' => ['required_with:questions', 'string', 'max:255'],
            'questions.*.question_type' => ['nullable', Rule::in(['text', 'textarea', 'single_choice', 'multi_choice', 'yes_no'])],
            'questions.*.required' => ['nullable', 'boolean'],
            'questions.*.options' => ['nullable', 'array'],
        ];
    }
}
