<?php

namespace App\Services;

use App\Models\NotificationDelivery;
use App\Models\User;
use Carbon\Carbon;

class SchedulingService
{
    /**
     * Calculate next notification times for a user based on their preferences
     */
    public function calculateNextNotificationTimes(User $user): array
    {
        $preferences = $user->preferences;

        if (! $preferences || ! $preferences->notifications_enabled) {
            return [];
        }

        $timezone = $preferences->timezone ?? 'UTC';
        $preferredHours = $preferences->preferred_hours ?? [8, 12, 18];
        $notificationsPerDay = $preferences->notifications_per_day ?? 3;

        // Limit to notifications_per_day
        $preferredHours = array_slice($preferredHours, 0, $notificationsPerDay);

        $now = Carbon::now($timezone);
        $today = $now->copy()->startOfDay();
        $notificationTimes = [];

        foreach ($preferredHours as $hour) {
            $notificationTime = $today->copy()->setTime($hour, 0, 0);

            // If the time has passed today, schedule for tomorrow
            if ($notificationTime->isPast()) {
                $notificationTime->addDay();
            }

            $notificationTimes[] = $notificationTime->utc();
        }

        return $notificationTimes;
    }

    /**
     * Schedule notifications for a user
     */
    public function scheduleNotificationsForUser(User $user): int
    {
        $preferences = $user->preferences;

        if (! $preferences || ! $preferences->notifications_enabled) {
            return 0;
        }

        $notificationTimes = $this->calculateNextNotificationTimes($user);
        $scheduledCount = 0;

        foreach ($notificationTimes as $scheduledAt) {
            // Check if notification already scheduled for this time
            $existing = NotificationDelivery::where('user_id', $user->id)
                ->where('scheduled_at', $scheduledAt)
                ->where('status', 'pending')
                ->first();

            if (! $existing) {
                // Create placeholder delivery (quote and article will be selected when sending)
                NotificationDelivery::create([
                    'user_id' => $user->id,
                    'quote_id' => 1, // Placeholder, will be updated
                    'article_id' => 1, // Placeholder, will be updated
                    'scheduled_at' => $scheduledAt,
                    'status' => 'pending',
                ]);
                $scheduledCount++;
            }
        }

        return $scheduledCount;
    }

    /**
     * Get pending notifications that should be sent now
     */
    public function getPendingNotifications(): \Illuminate\Database\Eloquent\Collection
    {
        $now = Carbon::now();

        return NotificationDelivery::where('status', 'pending')
            ->where('scheduled_at', '<=', $now)
            ->with(['user', 'quote', 'article'])
            ->get();
    }
}
