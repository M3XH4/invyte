<?php

namespace App\Http\Controllers\Events;

use App\Http\Controllers\ApiController;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ThemeResource;
use App\Models\EventCategory;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;

class EventMetadataController extends ApiController
{
    public function categories(): JsonResponse
    {
        $categories = EventCategory::query()
            ->orderBy('name')
            ->get();

        return $this->success('Categories loaded', CategoryResource::collection($categories));
    }

    public function themes(): JsonResponse
    {
        $themes = Theme::query()
            ->orderBy('name')
            ->get();

        return $this->success('Themes loaded', ThemeResource::collection($themes));
    }
}
