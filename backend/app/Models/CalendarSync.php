<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalendarSync extends Model
{
    protected $fillable = [
        'provider',
        'access_token',
        'refresh_token',
        'token_type',
        'expires_at',
        'calendar_id',
        'is_active',
        'sync_settings'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'sync_settings' => 'array'
    ];

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function needsRefresh()
    {
        return $this->isExpired() && $this->refresh_token;
    }
}
