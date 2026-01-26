<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreDeviceTokenRequest;
use App\Models\DeviceToken;
use Illuminate\Http\JsonResponse;

class DeviceTokenController extends Controller
{
    public function store(StoreDeviceTokenRequest $request): JsonResponse
    {
        $user = auth()->user();

        $deviceToken = DeviceToken::updateOrCreate(
            [
                'user_id' => $user->id,
                'token' => $request->token,
            ],
            [
                'platform' => $request->platform,
                'last_seen_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Token registrado exitosamente.',
            'device_token' => $deviceToken,
        ], 201);
    }
}
