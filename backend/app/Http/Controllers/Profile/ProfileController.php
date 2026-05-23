<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends ApiController
{
    public function show(Request $request): JsonResponse
    {
        return $this->success('Profile loaded', new UserResource($request->user()));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $request->user()->update($request->validated());

        return $this->success('Profile updated successfully', new UserResource($request->user()->refresh()));
    }

    public function avatar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'avatar' => ['required', 'image', 'max:4096'],
        ]);

        $path = $validated['avatar']->store('avatars', 'public');
        $request->user()->update([
            'avatar' => $request->getSchemeAndHttpHost().Storage::url($path),
        ]);

        return $this->success('Profile photo updated successfully', new UserResource($request->user()->refresh()));
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $events = $user->events()->withCount('guests')->get();
        $guestTotal = $events->sum('guests_count');
        $checkedInTotal = $user->events()
            ->withCount(['guests as checked_in_count' => fn ($query) => $query->whereNotNull('checked_in_at')])
            ->get()
            ->sum('checked_in_count');

        return $this->success('Profile stats loaded', [
            'events_hosted' => $events->count(),
            'guests_invited' => $guestTotal,
            'upcoming_events' => $user->events()->whereDate('start_date', '>', now()->toDateString())->count(),
            'unread_notifications' => $user->notifications()->where('is_read', false)->count(),
            'attendance_rate' => $guestTotal > 0 ? round(($checkedInTotal / $guestTotal) * 100).'%' : '0%',
        ]);
    }
}
