<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/download-app', [App\Http\Controllers\ContactController::class, 'index'])->name('download-app');
Route::post('/contact', [App\Http\Controllers\ContactController::class, 'store'])->name('contact.store');

// Email verification (web route for browser access)
Route::get('/verify-email', [App\Http\Controllers\EmailVerificationController::class, 'verify'])->name('email.verify');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        // Si el usuario es admin, redirigir al dashboard de admin
        if (Auth::user() && Auth::user()->is_admin) {
            return redirect()->route('admin.dashboard');
        }
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';