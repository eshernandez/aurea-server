<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule notifications every minute
Schedule::command('notifications:schedule')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();
