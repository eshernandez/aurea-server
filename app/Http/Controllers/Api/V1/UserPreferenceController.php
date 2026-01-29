<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdatePreferencesRequest;
use Illuminate\Http\JsonResponse;

class UserPreferenceController extends Controller
{
    public function show(): JsonResponse
    {
        $user = auth()->user();
        $preferences = $user->preferences;

        if (! $preferences) {
            $preferences = $user->preferences()->create([
                'timezone' => 'America/Bogota', // Colombia por defecto
                'notifications_enabled' => true,
                'notifications_per_day' => 3,
                'preferred_hours' => [8, 12, 18],
            ]);
        }

        return response()->json([
            'preferences' => $preferences,
        ]);
    }

    public function update(UpdatePreferencesRequest $request): JsonResponse
    {
        $user = auth()->user();
        $preferences = $user->preferences;

        if (! $preferences) {
            $preferences = $user->preferences()->create([
                'timezone' => $request->input('timezone', 'America/Bogota'), // Colombia por defecto
                'notifications_enabled' => $request->input('notifications_enabled', true),
                'notifications_per_day' => $request->input('notifications_per_day', 3),
                'preferred_hours' => $request->input('preferred_hours', [8, 12, 18]),
                'preferred_categories' => $request->input('preferred_categories'),
            ]);
        } else {
            $preferences->update($request->validated());
        }

        return response()->json([
            'message' => 'Preferencias actualizadas exitosamente.',
            'preferences' => $preferences->fresh(),
        ]);
    }
}
