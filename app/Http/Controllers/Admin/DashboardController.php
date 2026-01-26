<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\NotificationDelivery;
use App\Models\Quote;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();
        $today = $now->copy()->startOfDay();

        // User metrics
        $totalUsers = User::count();
        $activeUsers = User::whereHas('preferences', function ($query) {
            $query->where('notifications_enabled', true);
        })->count();
        $adminUsers = User::where('is_admin', true)->count();

        // Content metrics
        $totalCategories = Category::count();
        $activeCategories = Category::where('is_active', true)->count();
        $totalQuotes = Quote::count();
        $activeQuotes = Quote::where('is_active', true)->count();
        $totalArticles = Article::count();
        $activeArticles = Article::where('is_active', true)->count();

        // Notification metrics (today)
        $notificationsToday = NotificationDelivery::whereDate('scheduled_at', $today)->count();
        $notificationsSentToday = NotificationDelivery::whereDate('sent_at', $today)
            ->where('status', 'sent')
            ->count();
        $notificationsFailedToday = NotificationDelivery::whereDate('sent_at', $today)
            ->where('status', 'failed')
            ->count();

        // Notification metrics (last 7 days)
        $last7Days = $now->copy()->subDays(7);
        $notificationsLast7Days = NotificationDelivery::where('scheduled_at', '>=', $last7Days)->count();
        $notificationsSentLast7Days = NotificationDelivery::where('sent_at', '>=', $last7Days)
            ->where('status', 'sent')
            ->count();

        // Recent activity
        $recentNotifications = NotificationDelivery::with(['user', 'quote', 'article'])
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'users' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'admins' => $adminUsers,
                ],
                'content' => [
                    'categories' => [
                        'total' => $totalCategories,
                        'active' => $activeCategories,
                    ],
                    'quotes' => [
                        'total' => $totalQuotes,
                        'active' => $activeQuotes,
                    ],
                    'articles' => [
                        'total' => $totalArticles,
                        'active' => $activeArticles,
                    ],
                ],
                'notifications' => [
                    'today' => [
                        'total' => $notificationsToday,
                        'sent' => $notificationsSentToday,
                        'failed' => $notificationsFailedToday,
                    ],
                    'last_7_days' => [
                        'total' => $notificationsLast7Days,
                        'sent' => $notificationsSentLast7Days,
                    ],
                ],
            ],
            'recentNotifications' => $recentNotifications,
        ]);
    }
}
