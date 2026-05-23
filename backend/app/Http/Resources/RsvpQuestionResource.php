<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RsvpQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'question' => $this->question,
            'question_type' => $this->question_type,
            'required' => $this->required,
            'options' => $this->options ?? [],
            'sort_order' => $this->sort_order,
        ];
    }
}
