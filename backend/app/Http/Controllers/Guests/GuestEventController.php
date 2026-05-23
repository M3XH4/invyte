<?php

namespace App\Http\Controllers\Guests;

use App\Http\Controllers\ApiController;
use App\Http\Resources\GuestEventResource;
use App\Models\EventGuest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuestEventController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $guests = EventGuest::query()
            ->with([
                'event.category',
                'event.theme',
                'event.qrCode',
                'answers.question',
            ])
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id);

                if ($user->email) {
                    $query->orWhere('email', $user->email);
                }
            })
            ->whereHas('event', fn ($query) => $query->whereNull('archived_at'))
            ->latest('responded_at')
            ->get();

        return $this->success('Guest events loaded', GuestEventResource::collection($guests));
    }
}
