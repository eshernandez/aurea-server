<?php

namespace App\Console\Commands;

use App\Jobs\SendNotificationJob;
use App\Models\User;
use App\Services\SchedulingService;
use Illuminate\Console\Command;

class ScheduleNotifications extends Command
{
    protected $signature = 'notifications:schedule';

    protected $description = 'Schedule notifications for all active users';

    public function handle(SchedulingService $schedulingService): int
    {
        $this->info('Scheduling notifications...');

        // Schedule notifications for all users with preferences
        $users = User::whereHas('preferences', function ($query) {
            $query->where('notifications_enabled', true);
        })->get();

        $totalScheduled = 0;

        foreach ($users as $user) {
            $count = $schedulingService->scheduleNotificationsForUser($user);
            $totalScheduled += $count;
        }

        $this->info("Scheduled {$totalScheduled} notifications for {$users->count()} users.");

        // Process pending notifications
        $pending = $schedulingService->getPendingNotifications();
        $this->info("Found {$pending->count()} pending notifications to send.");

        foreach ($pending as $delivery) {
            SendNotificationJob::dispatch($delivery);
        }

        $this->info("Dispatched {$pending->count()} notification jobs.");

        return Command::SUCCESS;
    }
}
