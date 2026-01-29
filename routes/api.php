<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Handle OPTIONS requests globally for CORS preflight
Route::options('api/v1/{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN, X-XSRF-TOKEN, ngrok-skip-browser-warning')
        ->header('Access-Control-Allow-Credentials', 'false')
        ->header('Access-Control-Max-Age', '86400');
})->where('any', '.*');

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/register', [App\Http\Controllers\Api\V1\AuthController::class, 'register']);
    Route::post('/login', [App\Http\Controllers\Api\V1\AuthController::class, 'login']);
    Route::get('/verify-email', [App\Http\Controllers\Api\V1\AuthController::class, 'verifyEmail']);
    Route::post('/resend-verification', [App\Http\Controllers\Api\V1\AuthController::class, 'resendVerificationEmail']);
    
    // Temporary endpoint to manually verify email (for debugging)
    Route::post('/force-verify-email', [App\Http\Controllers\Api\V1\AuthController::class, 'forceVerifyEmail']);

    // Public profile image route (img tags don't send auth headers)
    Route::get('/profile/image/{filename}', [App\Http\Controllers\Api\V1\ProfileController::class, 'serveImage']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [App\Http\Controllers\Api\V1\AuthController::class, 'logout']);
        Route::get('/user', [App\Http\Controllers\Api\V1\AuthController::class, 'user']);

        // Device tokens
        Route::post('/device-tokens', [App\Http\Controllers\Api\V1\DeviceTokenController::class, 'store']);

        // User preferences
        Route::get('/preferences', [App\Http\Controllers\Api\V1\UserPreferenceController::class, 'show']);
        Route::put('/preferences', [App\Http\Controllers\Api\V1\UserPreferenceController::class, 'update']);

        // Home (quote + article)
        Route::get('/home', [App\Http\Controllers\Api\V1\HomeController::class, 'index']);

        // Notification history
        Route::get('/notifications/history', [App\Http\Controllers\Api\V1\NotificationController::class, 'history']);

        // Notification detail (for deep linking)
        Route::get('/notifications/{delivery}', [App\Http\Controllers\Api\V1\NotificationController::class, 'show']);
        
        // Get notification by quote and article IDs (for viewing current content)
        Route::get('/notifications/quote/{quoteId}/article/{articleId}', [App\Http\Controllers\Api\V1\NotificationController::class, 'getByQuoteAndArticle']);

        // Profile
        Route::put('/profile', [App\Http\Controllers\Api\V1\ProfileController::class, 'update']);
        Route::post('/profile/image', [App\Http\Controllers\Api\V1\ProfileController::class, 'uploadImage']);
    });
});
