<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class CleanupInvalidTokens extends Command
{
    protected $signature = 'notifications:cleanup-tokens';

    protected $description = 'Clean up invalid device tokens from the database';

    public function handle(NotificationService $notificationService): int
    {
        $this->info('Cleaning up invalid device tokens...');

        if (! $notificationService->isConfigured()) {
            $this->warn('Firebase is not configured. Cannot validate tokens.');
            return Command::FAILURE;
        }

        $result = $notificationService->cleanupInvalidTokens();

        $this->info($result['message']);

        if ($result['removed'] > 0) {
            $this->warn("Removed {$result['removed']} invalid token(s).");
        } else {
            $this->info('No invalid tokens found.');
        }

        return Command::SUCCESS;
    }
}
