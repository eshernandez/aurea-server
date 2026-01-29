<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return response()->json([
            'user' => $user->fresh(),
        ]);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        // Log request details for debugging
        Log::info('Profile image upload request', [
            'hasFile' => $request->hasFile('profile_image'),
            'allFiles' => array_keys($request->allFiles()),
            'contentType' => $request->header('Content-Type'),
            'isMultipart' => str_contains($request->header('Content-Type', ''), 'multipart/form-data'),
            'allInputKeys' => array_keys($request->all()),
        ]);

        try {
            $request->validate([
                'profile_image' => ['required', 'image', 'max:5120'], // 5MB max
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Profile image validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            throw $e;
        }

        $user = $request->user();

        // Delete old image if exists (use getRawOriginal to get the path, not the URL)
        $oldImagePath = $user->getRawOriginal('profile_image');
        if ($oldImagePath) {
            Storage::disk('public')->delete($oldImagePath);
        }

        // Store new image
        $path = $request->file('profile_image')->store('profiles', 'public');

        // Update user profile image
        $user->profile_image = $path;
        $user->save();

        // Refresh user to get the accessor value
        $user->refresh();

        // Return full URL - the accessor will convert path to URL
        // Log for debugging
        Log::info('Profile image uploaded', [
            'path' => $path,
            'profile_image_url' => $user->profile_image,
            'request_url' => request()->getSchemeAndHttpHost(),
        ]);

        return response()->json([
            'image_url' => $user->profile_image,
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Serve profile image file
     * This endpoint can be accessed with or without authentication
     * If authenticated, it verifies the image belongs to the user
     * If not authenticated, it still serves the image (for img tags that don't send auth headers)
     */
    public function serveImage(Request $request, string $filename)
    {
        $imagePath = 'profiles/' . $filename;
        $filePath = storage_path('app/public/' . $imagePath);
        
        if (!file_exists($filePath)) {
            abort(404);
        }

        // If user is authenticated, verify the image belongs to them
        if ($request->user()) {
            $user = $request->user();
            $userImagePath = $user->getRawOriginal('profile_image');
            
            if ($userImagePath !== $imagePath) {
                abort(404);
            }
        }

        return response()->file($filePath, [
            'Content-Type' => mime_content_type($filePath),
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}
