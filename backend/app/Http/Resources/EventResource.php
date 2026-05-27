<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\EventPermissionService;
use App\Support\MediaUrl;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $going = (int) ($this->going_count ?? $this->guests()->where('response_status', 'going')->count());
        $maybe = (int) ($this->maybe_count ?? $this->guests()->where('response_status', 'maybe')->count());
        $notGoing = (int) ($this->not_going_count ?? $this->guests()->whereIn('response_status', ['not_going', 'cant_go'])->count());
        $pending = (int) ($this->pending_count ?? $this->guests()->where('response_status', 'pending')->count());
        $totalInvited = (int) ($this->guests_count ?? $this->guests()->count());
        $responseRate = $totalInvited > 0 ? (int) round((($going + $maybe + $notGoing) / $totalInvited) * 100) : 0;
        $publicUrl = $this->qrCode?->url ?: rtrim((string) config('app.frontend_url', config('app.url')), '/').'/public-rsvp/'.$this->slug;
        $permissions = app(EventPermissionService::class)->forUser($this->resource, $request->user());
        $coverImage = MediaUrl::publicUrl($this->cover_image_path ?: $this->cover_image);
        $viewerGuest = null;

        if (($permissions['role'] ?? null) === 'guest' && $request->user()) {
            $viewerGuest = $this->guests()
                ->where(function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id);

                    if ($request->user()->email) {
                        $query->orWhere('email', $request->user()->email);
                    }
                })
                ->with('answers.question')
                ->first();
        }

        return [
            'id' => $this->id,
            'uuid' => $this->id,
            'slug' => $this->slug,
            'user_id' => $this->user_id,
            'created_by' => $this->user_id,
            'creator' => new UserResource($this->whenLoaded('host')),
            'host' => [
                'name' => $this->host?->name,
            ],
            'guest' => $viewerGuest ? new EventGuestResource($viewerGuest) : null,
            'title' => $this->title,
            'description' => $this->description,
            'cover_image' => $coverImage,
            'coverImage' => $coverImage,
            'start_date' => $this->start_date?->toDateString(),
            'date' => $this->start_date?->toDateString(),
            'start_time' => $this->start_time,
            'time' => $this->start_time,
            'end_date' => $this->end_date?->toDateString(),
            'end_time' => $this->end_time,
            'venue_name' => $this->venue_name,
            'venue_address' => $this->venue_address,
            'venueAddress' => $this->venue_address,
            'location' => $this->venue_address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'privacy' => $this->privacy,
            'status' => $this->computedStatus(),
            'publication_status' => $this->status,
            'timeline_status' => $this->computedStatus(),
            'dress_code' => $this->dress_code,
            'food_option' => $this->food_option,
            'max_guests' => $this->max_guests,
            'max_companions' => $this->max_companions ?? null,
            'rsvp_enabled' => $this->rsvp_enabled,
            'allow_plus_ones' => $this->allow_plus_ones,
            'allow_guest_invites' => $this->allow_guest_invites,
            'show_guest_list' => $this->show_guest_list,
            'rsvp_deadline' => $this->rsvp_deadline?->toISOString(),
            'archived_at' => $this->archived_at?->toISOString(),
            'is_archived' => (bool) $this->archived_at,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'category_slug' => $this->category?->slug,
            'category_name' => $this->category?->name,
            'theme' => new ThemeResource($this->whenLoaded('theme')),
            'qr' => new QrCodeResource($this->whenLoaded('qrCode')),
            'public_url' => $publicUrl,
            'qr_value' => $publicUrl,
            'guests' => EventGuestResource::collection($this->whenLoaded('guests')),
            'questions' => RsvpQuestionResource::collection($this->whenLoaded('questions')),
            'media' => EventMediaResource::collection($this->whenLoaded('media')),
            'rsvp' => [
                'going' => $going,
                'maybe' => $maybe,
                'not_going' => $notGoing,
                'notGoing' => $notGoing,
                'pending' => $pending,
            ],
            'total_invited' => $totalInvited,
            'totalInvited' => $totalInvited,
            'responseRate' => $responseRate,
            'response_rate' => $responseRate,
            'permissions' => $permissions,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
