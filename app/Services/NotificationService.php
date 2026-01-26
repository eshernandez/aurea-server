<?php

namespace App\Services;

use App\Models\DeviceToken;
use App\Models\NotificationDelivery;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class NotificationService
{
    protected $messaging;

    public function __construct()
    {
        $firebaseCredentialsPath = config('services.firebase.credentials_path');
        
        if ($firebaseCredentialsPath && file_exists($firebaseCredentialsPath)) {
            $factory = (new Factory)->withServiceAccount($firebaseCredentialsPath);
            $this->messaging = $factory->createMessaging();
        } else {
            Log::warning('Firebase credentials not configured. Push notifications will be logged only.');
        }
    }

    /**
     * Send push notification to user's devices
     */
    public function sendNotification(
        User $user,
        string $title,
        string $body,
        array $data = []
    ): bool {
        $deviceTokens = DeviceToken::where('user_id', $user->id)
            ->whereNotNull('token')
            ->get();

        if ($deviceTokens->isEmpty()) {
            Log::info("No device tokens found for user {$user->id}");
            return false;
        }

        $successCount = 0;
        $failureCount = 0;

        foreach ($deviceTokens as $deviceToken) {
            try {
                if ($this->messaging) {
                    // Send via FCM
                    $message = CloudMessage::withTarget('token', $deviceToken->token)
                        ->withNotification(Notification::create($title, $body))
                        ->withData($data);

                    $this->messaging->send($message);
                } else {
                    // Log only mode (for development)
                    Log::info("Would send notification to token {$deviceToken->token}", [
                        'title' => $title,
                        'body' => $body,
                        'data' => $data,
                    ]);
                }

                // Update last seen
                $deviceToken->update(['last_seen_at' => now()]);
                $successCount++;
            } catch (\Exception $e) {
                Log::error("Failed to send notification to device token {$deviceToken->id}", [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id,
                ]);
                $failureCount++;

                // Remove invalid tokens
                if (str_contains($e->getMessage(), 'Invalid') || 
                    str_contains($e->getMessage(), 'not found')) {
                    $deviceToken->delete();
                }
            }
        }

        return $successCount > 0;
    }

    /**
     * Send notification with quote and article
     */
    public function sendQuoteAndArticleNotification(
        User $user,
        \App\Models\Quote $quote,
        \App\Models\Article $article
    ): bool {
        $title = 'Nueva frase del día';
        $body = $quote->text;
        
        // Truncate body if too long
        if (strlen($body) > 100) {
            $body = substr($body, 0, 97) . '...';
        }

        $data = [
            'type' => 'quote_article',
            'quote_id' => $quote->id,
            'article_id' => $article->id,
            'category_id' => $quote->category_id,
        ];

        return $this->sendNotification($user, $title, $body, $data);
    }
}
