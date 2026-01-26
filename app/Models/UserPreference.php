<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    protected $fillable = [
        'user_id',
        'timezone',
        'notifications_enabled',
        'notifications_per_day',
        'preferred_hours',
        'preferred_categories',
    ];

    protected function casts(): array
    {
        return [
            'notifications_enabled' => 'boolean',
            'notifications_per_day' => 'integer',
            'preferred_hours' => 'array',
            'preferred_categories' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
