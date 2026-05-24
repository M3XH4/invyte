<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Resources\Admin\AdminThemeResource;
use App\Models\Theme;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThemeController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function index(Request $request): JsonResponse
    {
        return $this->success(
            'Themes loaded',
            AdminThemeResource::collection($this->admin->listThemes($request->only(['search', 'category_id', 'active'])))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:themes,slug'],
            'category_id' => ['nullable', 'uuid', 'exists:event_categories,id'],
            'categoryId' => ['nullable', 'uuid', 'exists:event_categories,id'],
            'colors' => ['nullable', 'array'],
            'colors.*' => ['string', 'max:32'],
            'preview_colors' => ['nullable', 'array'],
            'primary_color' => ['nullable', 'string', 'max:32'],
            'secondary_color' => ['nullable', 'string', 'max:32'],
            'background_color' => ['nullable', 'string', 'max:32'],
            'mood' => ['nullable', 'string', 'max:255'],
            'preview_image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'isActive' => ['nullable', 'boolean'],
            'config' => ['nullable', 'array'],
        ]);

        $theme = $this->admin->createTheme($data);

        return $this->success('Theme created', new AdminThemeResource($theme), 201);
    }

    public function update(Request $request, Theme $theme): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:themes,slug,'.$theme->id],
            'category_id' => ['nullable', 'uuid', 'exists:event_categories,id'],
            'categoryId' => ['nullable', 'uuid', 'exists:event_categories,id'],
            'colors' => ['nullable', 'array'],
            'colors.*' => ['string', 'max:32'],
            'preview_colors' => ['nullable', 'array'],
            'primary_color' => ['nullable', 'string', 'max:32'],
            'secondary_color' => ['nullable', 'string', 'max:32'],
            'background_color' => ['nullable', 'string', 'max:32'],
            'mood' => ['nullable', 'string', 'max:255'],
            'preview_image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'isActive' => ['nullable', 'boolean'],
            'config' => ['nullable', 'array'],
        ]);

        $theme = $this->admin->updateTheme($theme, $data);

        return $this->success('Theme updated', new AdminThemeResource($theme));
    }

    public function destroy(Theme $theme): JsonResponse
    {
        $this->admin->deleteTheme($theme);

        return $this->success('Theme deleted');
    }
}
