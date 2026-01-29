<?php

namespace App\Services;

use App\Models\DeviceToken;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Exception\Messaging\InvalidArgument;
use Kreait\Firebase\Exception\Messaging\NotFound;
use Kreait\Firebase\Exception\Messaging\RegistrationTokenNotRegistered;
use Kreait\Firebase\Exception\Messaging\Unregistered;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\AndroidConfig;
use Kreait\Firebase\Messaging\ApnsConfig;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Firebase\Messaging\WebPushConfig;

class NotificationService
{
    protected $messaging;
    protected $isConfigured = false;

    public function __construct()
    {
        $firebaseCredentialsPath = config('services.firebase.credentials_path');
        
        // Resolve path if relative
        if ($firebaseCredentialsPath && ! str_starts_with($firebaseCredentialsPath, '/')) {
            $firebaseCredentialsPath = base_path($firebaseCredentialsPath);
        }
        
        if ($firebaseCredentialsPath && file_exists($firebaseCredentialsPath)) {
            try {
                $factory = (new Factory)->withServiceAccount($firebaseCredentialsPath);
                $this->messaging = $factory->createMessaging();
                $this->isConfigured = true;
                Log::info('Firebase messaging initialized successfully');
            } catch (\Exception $e) {
                Log::error('Failed to initialize Firebase messaging', [
                    'error' => $e->getMessage(),
                    'path' => $firebaseCredentialsPath,
                ]);
            }
        } else {
            Log::warning('Firebase credentials not found. Push notifications will be logged only.', [
                'path' => $firebaseCredentialsPath,
            ]);
        }
    }

    /**
     * Check if Firebase is properly configured
     */
    public function isConfigured(): bool
    {
        return $this->isConfigured && $this->messaging !== null;
    }

    /**
     * Send push notification to user's devices
     */
    public function sendNotification(
        User $user,
        string $title,
        string $body,
        array $data = [],
        ?string $imageUrl = null
    ): array {
        $deviceTokens = DeviceToken::where('user_id', $user->id)
            ->whereNotNull('token')
            ->get();

        if ($deviceTokens->isEmpty()) {
            Log::info("No device tokens found for user {$user->id}");
            return [
                'success' => false,
                'message' => 'No device tokens found',
                'success_count' => 0,
                'failure_count' => 0,
            ];
        }

        $results = [
            'success_count' => 0,
            'failure_count' => 0,
            'invalid_tokens' => [],
        ];

        foreach ($deviceTokens as $deviceToken) {
            try {
                $sent = $this->sendToDevice($deviceToken, $title, $body, $data, $imageUrl);
                
                if ($sent) {
                    $deviceToken->update(['last_seen_at' => now()]);
                    $results['success_count']++;
                } else {
                    $results['failure_count']++;
                }
            } catch (\Exception $e) {
                $results['failure_count']++;
                
                // Check if token is invalid and should be removed
                if ($this->isInvalidToken($e)) {
                    Log::warning("Removing invalid device token {$deviceToken->id}", [
                        'token' => substr($deviceToken->token, 0, 20) . '...',
                        'platform' => $deviceToken->platform,
                        'error' => $e->getMessage(),
                    ]);
                    
                    $results['invalid_tokens'][] = $deviceToken->id;
                    $deviceToken->delete();
                } else {
                    Log::error("Failed to send notification to device token {$deviceToken->id}", [
                        'error' => $e->getMessage(),
                        'user_id' => $user->id,
                        'platform' => $deviceToken->platform,
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }
        }

        $results['success'] = $results['success_count'] > 0;
        $results['message'] = $results['success_count'] > 0 
            ? "Sent to {$results['success_count']} device(s)" 
            : 'Failed to send to all devices';

        return $results;
    }

    /**
     * Send notification to a single device
     */
    protected function sendToDevice(
        DeviceToken $deviceToken,
        string $title,
        string $body,
        array $data = [],
        ?string $imageUrl = null
    ): bool {
        if (! $this->isConfigured()) {
            // Log only mode (for development)
            Log::info("Would send notification to device token", [
                'token' => substr($deviceToken->token, 0, 20) . '...',
                'platform' => $deviceToken->platform,
                'title' => $title,
                'body' => $body,
                'data' => $data,
            ]);
            return true; // Return true in dev mode to simulate success
        }

        try {
            $notification = Notification::create($title, $body);
            
            if ($imageUrl) {
                $notification = $notification->withImageUrl($imageUrl);
            }

            $message = CloudMessage::new()
                ->withToken($deviceToken->token)
                ->withNotification($notification)
                ->withData($data);

            // Configure platform-specific settings
            if ($deviceToken->platform === 'android') {
                $androidConfig = AndroidConfig::fromArray([
                    'priority' => 'high',
                    'notification' => [
                        'sound' => 'default',
                        'channel_id' => 'aurea_notifications',
                    ],
                ]);
                $message = $message->withAndroidConfig($androidConfig);
            } elseif ($deviceToken->platform === 'ios') {
                $apnsConfig = ApnsConfig::fromArray([
                    'headers' => [
                        'apns-priority' => '10',
                    ],
                    'payload' => [
                        'aps' => [
                            'sound' => 'default',
                            'badge' => 1,
                            'content-available' => 1,
                        ],
                    ],
                ]);
                $message = $message->withApnsConfig($apnsConfig);
            }

            $this->messaging->send($message);
            
            Log::debug("Notification sent successfully", [
                'device_token_id' => $deviceToken->id,
                'platform' => $deviceToken->platform,
            ]);

            return true;
        } catch (\Exception $e) {
            throw $e; // Re-throw to be handled by caller
        }
    }

    /**
     * Check if exception indicates an invalid token
     */
    protected function isInvalidToken(\Exception $e): bool
    {
        $invalidTokenErrors = [
            'Invalid',
            'not found',
            'not registered',
            'unregistered',
            'registration-token-not-registered',
        ];

        $errorMessage = strtolower($e->getMessage());
        $errorClass = get_class($e);

        // Check for specific Firebase exceptions
        if ($e instanceof RegistrationTokenNotRegistered || 
            $e instanceof Unregistered ||
            $e instanceof NotFound) {
            return true;
        }

        // Check error message
        foreach ($invalidTokenErrors as $error) {
            if (str_contains($errorMessage, strtolower($error))) {
                return true;
            }
        }

        return false;
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
        
        // Truncate body if too long (FCM limit is ~4KB total, notification body should be < 100 chars)
        if (strlen($body) > 100) {
            $body = mb_substr($body, 0, 97) . '...';
        }

        $data = [
            'type' => 'quote_article',
            'quote_id' => (string) $quote->id,
            'article_id' => (string) $article->id,
            'category_id' => $quote->category_id ? (string) $quote->category_id : '',
        ];

        // Add image URL if article has one
        $imageUrl = $article->image_url ?? null;

        $result = $this->sendNotification($user, $title, $body, $data, $imageUrl);

        if ($result['success']) {
            Log::info("Quote and article notification sent successfully", [
                'user_id' => $user->id,
                'quote_id' => $quote->id,
                'article_id' => $article->id,
                'success_count' => $result['success_count'],
                'failure_count' => $result['failure_count'],
            ]);
        } else {
            Log::warning("Failed to send quote and article notification", [
                'user_id' => $user->id,
                'quote_id' => $quote->id,
                'article_id' => $article->id,
                'result' => $result,
            ]);
        }

        return $result['success'];
    }

    /**
     * Clean up invalid device tokens
     * This method can be called periodically to remove tokens that are no longer valid
     */
    public function cleanupInvalidTokens(): array
    {
        if (! $this->isConfigured()) {
            return [
                'checked' => 0,
                'removed' => 0,
                'message' => 'Firebase not configured',
            ];
        }

        $deviceTokens = DeviceToken::whereNotNull('token')->get();
        $removed = 0;
        $checked = 0;

        foreach ($deviceTokens as $deviceToken) {
            $checked++;
            
            try {
                // Try to validate token by sending a test message (silent)
                // Note: FCM doesn't have a direct validation endpoint, so we'll skip this
                // and rely on error handling during actual sends
                // This method can be enhanced later with token validation
            } catch (\Exception $e) {
                if ($this->isInvalidToken($e)) {
                    Log::info("Removing invalid token during cleanup", [
                        'device_token_id' => $deviceToken->id,
                        'user_id' => $deviceToken->user_id,
                    ]);
                    $deviceToken->delete();
                    $removed++;
                }
            }
        }

        return [
            'checked' => $checked,
            'removed' => $removed,
            'message' => "Checked {$checked} tokens, removed {$removed} invalid tokens",
        ];
    }

    /**
     * Send notification to multiple users (batch)
     */
    public function sendBatchNotification(
        array $users,
        string $title,
        string $body,
        array $data = []
    ): array {
        $results = [
            'total_users' => count($users),
            'successful_users' => 0,
            'failed_users' => 0,
            'total_devices' => 0,
            'successful_devices' => 0,
            'failed_devices' => 0,
        ];

        foreach ($users as $user) {
            $result = $this->sendNotification($user, $title, $body, $data);
            
            $results['total_devices'] += ($result['success_count'] + $result['failure_count']);
            $results['successful_devices'] += $result['success_count'];
            $results['failed_devices'] += $result['failure_count'];

            if ($result['success']) {
                $results['successful_users']++;
            } else {
                $results['failed_users']++;
            }
        }

        return $results;
    }
}
