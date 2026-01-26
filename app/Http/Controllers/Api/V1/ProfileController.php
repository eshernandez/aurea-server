<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        $request->validate([
            'profile_image' => ['required', 'image', 'max:5120'], // 5MB max
        ]);

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
        return response()->json([
            'image_url' => $user->profile_image,
            'user' => $user->fresh(),
        ]);
    }
}
