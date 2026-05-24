<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Resources\Admin\AdminUserResource;
use App\Models\User;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function index(Request $request): JsonResponse
    {
        $users = $this->admin->listUsers($request->only(['search', 'role', 'per_page']));

        return $this->success('Users loaded', AdminUserResource::collection($users));
    }

    public function show(User $user): JsonResponse
    {
        $user->loadCount(['events', 'guestInvites']);

        return $this->success('User loaded', new AdminUserResource($user));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'username' => ['sometimes', 'string', 'max:255', 'unique:users,username,'.$user->id],
            'role' => ['sometimes', 'in:admin,host,guest'],
        ]);

        $user->update($data);

        return $this->success('User updated', new AdminUserResource($user->fresh()->loadCount(['events', 'guestInvites'])));
    }

    public function destroy(User $user): JsonResponse
    {
        abort_if($user->role === 'admin', 422, 'Admin accounts cannot be deleted from the panel.');

        $user->delete();

        return $this->success('User deleted');
    }
}
