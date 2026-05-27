<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\EventPermissionService;
use App\Support\MediaUrl;

class PublicEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $publicUrl = $this->qrCode?->url ?: rtrim((string) config('app.frontend_url', config('app.url')), '/').'/public-rsvp/'.$this->slug;
        $permissions = app(EventPermissionService::class)->forUser($this->resource, $request->user());

        return [
            'id' => $this->id,
            'uuid' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,
            'cover_image' => MediaUrl::publicUrl($this->cover_image_path ?: $this->cover_image),
            'coverImage' => MediaUrl::publicUrl($this->cover_image_path ?: $this->cover_image),
            'start_date' => $this->start_date?->toDateString(),
            'date' => $this->start_date?->toDateString(),
            'start_time' => $this->start_time,
            'time' => $this->start_time,
            'venue_address' => $this->venue_address,
            'venueAddress' => $this->venue_address,
            'location' => $this->venue_address,
            'status' => $this->computedStatus(),
            'timeline_status' => $this->computedStatus(),
            'rsvp_deadline' => $this->rsvp_deadline?->toISOString(),
            'rsvp_enabled' => $this->rsvp_enabled,
            'allow_plus_ones' => $this->allow_plus_ones,
            'max_companions' => $this->max_companions ?? null,
            'show_guest_list' => $this->show_guest_list,
            'rsvp_options' => ['going', 'maybe', 'not_going'],
            'public_url' => $publicUrl,
            'qr_value' => $publicUrl,
            'permissions' => $permissions,
            'questions' => RsvpQuestionResource::collection($this->whenLoaded('questions')),
            'guests' => $this->show_guest_list
                ? $this->guests->map(fn ($guest) => [
                    'id' => $guest->id,
                    'uuid' => $guest->id,
                    'name' => $guest->name,
                    'response_status' => $guest->response_status,
                    'status' => $guest->response_status,
                ])->values()
                : [],
        ];
    }
}
