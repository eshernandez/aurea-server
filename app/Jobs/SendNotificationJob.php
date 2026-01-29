<?php

namespace App\Jobs;

use App\Models\NotificationDelivery;
use App\Services\ContentSelectionService;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public NotificationDelivery $delivery
    ) {
    }

    public function handle(
        NotificationService $notificationService,
        ContentSelectionService $contentSelectionService
    ): void {
        $delivery = $this->delivery->fresh(['user', 'user.preferences']);

        if (! $delivery || $delivery->status !== 'pending') {
            Log::warning("Notification delivery {$delivery->id} is not pending");
            return;
        }

        $user = $delivery->user;

        if (! $user) {
            Log::error("User not found for delivery {$delivery->id}");
            $delivery->update([
                'status' => 'failed',
                'error_message' => 'User not found',
            ]);
            return;
        }

        // Check if user has notifications enabled
        $preferences = $user->preferences;
        if (! $preferences || ! $preferences->notifications_enabled) {
            Log::info("Notifications disabled for user {$user->id}");
            $delivery->update([
                'status' => 'failed',
                'error_message' => 'Notifications disabled by user',
            ]);
            return;
        }

        try {
            // Select quote and article
            $preferredCategoryIds = $preferences->preferred_categories ?? null;
            $quote = $contentSelectionService->selectQuote($user, $preferredCategoryIds);
            $article = $contentSelectionService->selectArticle($quote, $preferredCategoryIds);

            if (! $quote || ! $article) {
                throw new \Exception('No content available');
            }

            // Update delivery with selected content
            $delivery->update([
                'quote_id' => $quote->id,
                'article_id' => $article->id,
            ]);

            // Send notification
            $success = $notificationService->sendQuoteAndArticleNotification($user, $quote, $article);

            if ($success) {
                // Record success
                $delivery->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'payload' => [
                        'quote_id' => $quote->id,
                        'article_id' => $article->id,
                        'quote_text' => $quote->text,
                        'article_title' => $article->title,
                    ],
                ]);

                // Record in history
                $contentSelectionService->recordQuoteSent($user, $quote);
            } else {
                throw new \Exception('Failed to send notification');
            }
        } catch (\Exception $e) {
            Log::error("Failed to send notification for delivery {$delivery->id}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $delivery->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}
