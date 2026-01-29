<?php

namespace App\Services;

use App\Models\NotificationDelivery;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

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

        $timezone = $preferences->timezone ?? 'America/Bogota'; // Colombia por defecto
        $preferredHours = $preferences->preferred_hours ?? [8, 12, 18];
        $notificationsPerDay = $preferences->notifications_per_day ?? 3;

        // Validate and filter preferred_hours
        if (! is_array($preferredHours) || empty($preferredHours)) {
            $preferredHours = [8, 12, 18]; // Default fallback
        }

        // Filter out invalid hours (null, non-numeric, out of range)
        $preferredHours = array_filter($preferredHours, function ($hour) {
            return is_numeric($hour) && $hour >= 0 && $hour <= 23;
        });

        // If no valid hours remain, use defaults
        if (empty($preferredHours)) {
            $preferredHours = [8, 12, 18];
        }

        // Convert to integers and remove duplicates
        $preferredHours = array_unique(array_map('intval', $preferredHours));
        sort($preferredHours);

        // Limit to notifications_per_day
        $preferredHours = array_slice($preferredHours, 0, $notificationsPerDay);

        // Validate timezone
        try {
            $now = Carbon::now($timezone);
        } catch (\Exception $e) {
            // Invalid timezone, fallback to UTC
            $timezone = 'UTC';
            $now = Carbon::now($timezone);
        }

        $today = $now->copy()->startOfDay();
        $notificationTimes = [];

        foreach ($preferredHours as $hour) {
            try {
                $notificationTime = $today->copy()->setTime((int) $hour, 0, 0);

                // Validate the date was created correctly
                if (! $notificationTime->isValid()) {
                    continue; // Skip invalid dates
                }

                // If the time has passed today, schedule for tomorrow
                if ($notificationTime->isPast()) {
                    $notificationTime->addDay();
                }

                $utcTime = $notificationTime->utc();

                // Final validation: ensure UTC time is valid
                if ($utcTime->isValid() && $utcTime->timestamp > 0) {
                    $notificationTimes[] = $utcTime;
                }
            } catch (\Exception $e) {
                // Skip invalid hours
                continue;
            }
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

        $query = NotificationDelivery::where('status', 'pending')
            ->where('scheduled_at', '<=', $now);

        // Solo aplicar filtro de cancelled_at si la columna existe
        if (Schema::hasColumn('notification_deliveries', 'cancelled_at')) {
            $query->where(function ($query) {
                // Excluir notificaciones canceladas para hoy
                $query->whereNull('cancelled_at')
                    ->orWhere(function ($q) {
                        // Si está cancelada, verificar que no sea del mismo día que scheduled_at
                        $q->whereNotNull('cancelled_at')
                            ->whereRaw('DATE(cancelled_at) != DATE(scheduled_at)');
                    });
            });
        }

        return $query->with(['user', 'quote', 'article'])->get();
    }
}
