<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmailVerificationToken extends Model
{
    protected $fillable = [
        'user_id',
        'token',
        'encrypted_password',
        'expires_at',
        'used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a new verification token for a user
     * This will mark all existing unused tokens as used and create a new one
     */
    public static function generateForUser(User $user, string $plainPassword): self
    {
        // Use a transaction to ensure atomicity
        return DB::transaction(function () use ($user, $plainPassword) {
            // Mark any existing unused tokens as used
            self::where('user_id', $user->id)
                ->where('used', false)
                ->update(['used' => true]);

            // Encrypt the password using Laravel's encryption
            $encryptedPassword = encrypt($plainPassword);

            // Generate a unique token
            $token = Str::random(64);
            
            // Ensure token is unique (very unlikely but just in case)
            while (self::where('token', $token)->exists()) {
                $token = Str::random(64);
            }

            // Create and return the new token
            $newToken = self::create([
                'user_id' => $user->id,
                'token' => $token,
                'encrypted_password' => $encryptedPassword,
                'expires_at' => now()->addHours(24), // Token válido por 24 horas
                'used' => false,
            ]);

            // Refresh to ensure we have the latest data
            return $newToken->fresh();
        });
    }

    /**
     * Decrypt and get the original password
     */
    public function getPlainPassword(): string
    {
        return decrypt($this->encrypted_password);
    }

    /**
     * Verify if token is valid and not used
     */
    public function isValid(): bool
    {
        return !$this->used && $this->expires_at->isFuture();
    }
}
