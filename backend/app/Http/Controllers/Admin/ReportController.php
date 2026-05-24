<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;

class ReportController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function index(): JsonResponse
    {
        return $this->success('Reports loaded', $this->admin->reports());
    }
}
