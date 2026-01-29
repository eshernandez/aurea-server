<?php

namespace App\Console\Commands;

use App\Models\NotificationDelivery;
use App\Models\User;
use App\Services\SchedulingService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanInvalidNotifications extends Command
{
    protected $signature = 'notifications:clean-invalid {--reprogram : Reprogram notifications for affected users after cleaning}';

    protected $description = 'Clean up notification deliveries with invalid scheduled_at dates (e.g., 1969-12-31)';

    public function handle(SchedulingService $schedulingService): int
    {
        $this->info('🔍 Searching for invalid notifications...');
        $this->newLine();

        // Find notifications with invalid dates (before 1970-01-01 or null)
        // 1969-12-31 is the Unix epoch (timestamp 0) in some timezones
        $cutoffDate = Carbon::parse('1970-01-01 00:00:00');
        
        $invalidNotifications = NotificationDelivery::where('scheduled_at', '<', $cutoffDate)
            ->orWhereNull('scheduled_at')
            ->with('user')
            ->get();

        $count = $invalidNotifications->count();

        if ($count === 0) {
            $this->info('✅ No invalid notifications found.');
            return Command::SUCCESS;
        }

        $this->warn("⚠️  Found {$count} invalid notification(s) with dates before 1970-01-01 or null.");
        $this->newLine();

        // Show details
        $this->info('📋 Invalid notifications:');
        $this->table(
            ['ID', 'User', 'Status', 'Scheduled At', 'Created At'],
            $invalidNotifications->map(function ($notification) {
                $userName = $notification->user ? $notification->user->name : 'Unknown';
                $scheduledAt = $notification->scheduled_at 
                    ? $notification->scheduled_at->format('Y-m-d H:i:s')
                    : 'NULL';
                
                return [
                    $notification->id,
                    $userName,
                    $notification->status,
                    $scheduledAt,
                    $notification->created_at->format('Y-m-d H:i:s'),
                ];
            })->toArray()
        );
        $this->newLine();

        // Get unique user IDs for reprogramming
        $affectedUserIds = $invalidNotifications->pluck('user_id')->unique()->filter();

        if (! $this->confirm('Do you want to delete these invalid notifications?', true)) {
            $this->info('❌ Operation cancelled.');
            return Command::SUCCESS;
        }

        $deleted = NotificationDelivery::where('scheduled_at', '<', $cutoffDate)
            ->orWhereNull('scheduled_at')
            ->delete();

        $this->info("✅ Deleted {$deleted} invalid notification(s).");
        $this->newLine();

        // Option to reprogram
        if ($this->option('reprogram') || $this->confirm('Do you want to reprogram notifications for affected users?', true)) {
            if ($affectedUserIds->isEmpty()) {
                $this->warn('⚠️  No valid user IDs found to reprogram.');
                return Command::SUCCESS;
            }

            $this->info('🔄 Reprogramming notifications...');
            $this->newLine();

            $totalScheduled = 0;
            $usersProcessed = 0;

            foreach ($affectedUserIds as $userId) {
                $user = User::find($userId);
                
                if (! $user) {
                    continue;
                }

                try {
                    $scheduled = $schedulingService->scheduleNotificationsForUser($user);
                    $totalScheduled += $scheduled;
                    $usersProcessed++;

                    if ($scheduled > 0) {
                        $this->line("  ✅ User: {$user->name} - Scheduled {$scheduled} notification(s)");
                    } else {
                        $this->line("  ⚠️  User: {$user->name} - No notifications scheduled (preferences may be disabled)");
                    }
                } catch (\Exception $e) {
                    $this->error("  ❌ User: {$user->name} - Error: {$e->getMessage()}");
                }
            }

            $this->newLine();
            $this->info("✅ Reprogrammed notifications for {$usersProcessed} user(s). Total: {$totalScheduled} notification(s) scheduled.");
        }

        return Command::SUCCESS;
    }
}
