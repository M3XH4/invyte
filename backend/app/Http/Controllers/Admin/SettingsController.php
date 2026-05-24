<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function show(): JsonResponse
    {
        return $this->success('Settings loaded', $this->admin->settings());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'appName' => ['sometimes', 'string', 'max:255'],
            'publicFrontendUrl' => ['sometimes', 'url', 'max:255'],
            'emailNotifications' => ['sometimes', 'boolean'],
            'pushNotifications' => ['sometimes', 'boolean'],
            'rsvpDeadlineDays' => ['sometimes', 'integer', 'min:0', 'max:365'],
            'maxUploadMb' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'adminName' => ['sometimes', 'string', 'max:255'],
            'adminEmail' => ['sometimes', 'email', 'max:255'],
        ]);

        return $this->success('Settings updated', $this->admin->updateSettings($data));
    }
}
