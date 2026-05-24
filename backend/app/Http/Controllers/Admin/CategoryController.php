<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Resources\Admin\AdminCategoryResource;
use App\Models\EventCategory;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function index(Request $request): JsonResponse
    {
        return $this->success(
            'Categories loaded',
            AdminCategoryResource::collection($this->admin->listCategories($request->only(['search', 'active'])))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:event_categories,slug'],
            'icon' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:32'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $category = $this->admin->createCategory($this->normalizeCategoryPayload($data));

        return $this->success('Category created', new AdminCategoryResource($category->loadCount('events')), 201);
    }

    public function update(Request $request, EventCategory $category): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:event_categories,slug,'.$category->id],
            'icon' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:32'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $category = $this->admin->updateCategory($category, $this->normalizeCategoryPayload($data));

        return $this->success('Category updated', new AdminCategoryResource($category->loadCount('events')));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizeCategoryPayload(array $data): array
    {
        if (array_key_exists('isActive', $data)) {
            $data['is_active'] = $data['isActive'];
        }

        return $data;
    }

    public function destroy(EventCategory $category): JsonResponse
    {
        $this->admin->deleteCategory($category);

        return $this->success('Category deleted');
    }
}
