<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Resources\Admin\AdminActivityLogResource;
use App\Http\Resources\Admin\AdminEventResource;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;

class DashboardController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function index(): JsonResponse
    {
        return $this->success('Dashboard loaded', [
            'stats' => $this->admin->dashboardStats(),
            'eventGrowth' => $this->admin->eventGrowthChart(),
            'rsvpStatusChart' => $this->admin->rsvpStatusChart(),
            'activityLogs' => AdminActivityLogResource::collection($this->admin->recentActivityLogs()),
            'upcomingEvents' => AdminEventResource::collection($this->admin->upcomingEvents()),
        ]);
    }
}
