<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Resources\Admin\AdminGuestResource;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuestController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function index(Request $request): JsonResponse
    {
        $guests = $this->admin->listGuests($request->only(['search', 'rsvp_status', 'per_page']));

        return $this->success('Guests loaded', AdminGuestResource::collection($guests));
    }
}
