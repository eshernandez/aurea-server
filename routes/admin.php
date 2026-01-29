<?php

use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\QuoteController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Categories
    Route::resource('categories', CategoryController::class);

    // Quotes
    Route::resource('quotes', QuoteController::class);
    Route::post('quotes/generate-ai', [QuoteController::class, 'generateWithAI'])->name('quotes.generate-ai');

    // Articles
    Route::resource('articles', ArticleController::class);
    Route::post('articles/generate-ai', [ArticleController::class, 'generateWithAI'])->name('articles.generate-ai');

    // Users
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::post('users/{user}/toggle-block', [UserController::class, 'toggleBlock'])->name('users.toggle-block');
    Route::post('users/{user}/activate', [UserController::class, 'activate'])->name('users.activate');
    Route::post('users/{user}/deactivate', [UserController::class, 'deactivate'])->name('users.deactivate');

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/{notification}', [NotificationController::class, 'show'])->name('notifications.show');
    Route::post('notifications/{notification}/send-now', [NotificationController::class, 'sendNow'])->name('notifications.send-now');
    Route::post('notifications/{notification}/reactivate', [NotificationController::class, 'reactivate'])->name('notifications.reactivate');
    Route::post('notifications/{notification}/cancel', [NotificationController::class, 'cancel'])->name('notifications.cancel');
});
