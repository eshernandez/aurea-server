<?php

use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
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
});
