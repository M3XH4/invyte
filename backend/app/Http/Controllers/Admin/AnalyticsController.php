<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function rsvp(): JsonResponse
    {
        return $this->success('RSVP analytics loaded', $this->admin->rsvpAnalytics());
    }
}
