<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'profile_image',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_admin' => 'boolean',
        ];
    }

    public function preferences(): HasOne
    {
        return $this->hasOne(UserPreference::class);
    }

    public function deviceTokens(): HasMany
    {
        return $this->hasMany(DeviceToken::class);
    }

    public function notificationDeliveries(): HasMany
    {
        return $this->hasMany(NotificationDelivery::class);
    }

    public function quoteUserHistory(): HasMany
    {
        return $this->hasMany(QuoteUserHistory::class);
    }

    public function emailVerificationTokens(): HasMany
    {
        return $this->hasMany(EmailVerificationToken::class);
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [];

    /**
     * Get the profile image URL.
     */
    protected function profileImage(): Attribute
    {
        return Attribute::make(
            get: function (?string $value) {
                if (!$value) {
                    return null;
                }
                
                // Try to use the current request URL if available (for API requests with ngrok)
                if (app()->runningInConsole() === false && request()) {
                    $scheme = request()->getScheme();
                    $host = request()->getHttpHost();
                    // Ensure we use https for ngrok URLs
                    if (str_contains($host, 'ngrok')) {
                        $scheme = 'https';
                    }
                    $baseUrl = $scheme . '://' . $host;
                    
                    // Extract filename from path (e.g., "profiles/abc123.png" -> "abc123.png")
                    $filename = basename($value);
                    
                    // Use API endpoint to serve the image (more reliable than static files)
                    return $baseUrl . '/api/v1/profile/image/' . $filename;
                }
                
                // Fallback to asset() which uses APP_URL from .env
                return asset('storage/' . $value);
            },
        );
    }

    /**
     * Get the model's array form with accessors.
     */
    public function toArray(): array
    {
        $array = parent::toArray();
        
        // Ensure profile_image is converted to URL using the accessor
        if ($this->profile_image) {
            $array['profile_image'] = $this->profile_image;
        }
        
        return $array;
    }
}
