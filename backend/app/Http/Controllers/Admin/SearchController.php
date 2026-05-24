<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Resources\Admin\AdminCategoryResource;
use App\Http\Resources\Admin\AdminEventResource;
use App\Http\Resources\Admin\AdminGuestResource;
use App\Http\Resources\Admin\AdminThemeResource;
use App\Http\Resources\Admin\AdminUserResource;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:120'],
        ]);

        $results = $this->admin->search($data['q']);

        return $this->success('Search results loaded', [
            'events' => AdminEventResource::collection($results['events']),
            'users' => AdminUserResource::collection($results['users']),
            'guests' => AdminGuestResource::collection($results['guests']),
            'categories' => AdminCategoryResource::collection($results['categories']),
            'themes' => AdminThemeResource::collection($results['themes']),
        ]);
    }
}
