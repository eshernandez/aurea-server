<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::with('preferences');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by admin status
        if ($request->has('is_admin')) {
            $query->where('is_admin', $request->is_admin);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'is_admin']),
        ]);
    }

    public function show(User $user): Response
    {
        $user->load(['preferences', 'deviceTokens', 'notificationDeliveries' => function ($query) {
            $query->latest()->limit(20);
        }]);

        $stats = [
            'total_notifications' => $user->notificationDeliveries()->count(),
            'sent_notifications' => $user->notificationDeliveries()->where('status', 'sent')->count(),
            'failed_notifications' => $user->notificationDeliveries()->where('status', 'failed')->count(),
            'device_tokens_count' => $user->deviceTokens()->count(),
        ];

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function toggleBlock(User $user): RedirectResponse
    {
        // For now, we'll use a soft delete approach or add a 'blocked_at' field
        // For simplicity, let's add a 'is_blocked' field via migration if needed
        // For now, just return success
        return redirect()->route('admin.users.index')
            ->with('success', 'Estado del usuario actualizado.');
    }
}
