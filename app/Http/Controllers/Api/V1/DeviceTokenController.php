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

        // Validar formato del token según plataforma
        $token = trim($request->token);
        $platform = $request->platform;
        
        // Log para debugging
        \Log::info('Device token registration attempt', [
            'user_id' => $user->id,
            'platform' => $platform,
            'token_length' => strlen($token),
            'token_preview' => substr($token, 0, 20) . '...',
        ]);

        // Validación básica de formato
        // FCM tokens generalmente tienen más de 100 caracteres
        // APNs tokens son hexadecimales y más cortos (64 caracteres)
        if ($platform === 'ios' && strlen($token) < 100) {
            \Log::warning('iOS token seems too short, might be APNs token instead of FCM', [
                'token_length' => strlen($token),
                'token_preview' => substr($token, 0, 20) . '...',
            ]);
        }

        // Buscar primero por token (ya que tiene restricción única)
        // Si el token existe, actualizarlo con el nuevo user_id
        // Si no existe, crearlo
        $deviceToken = DeviceToken::where('token', $token)->first();

        if ($deviceToken) {
            // Token ya existe, actualizar user_id y last_seen_at
            $deviceToken->update([
                'user_id' => $user->id,
                'platform' => $platform,
                'last_seen_at' => now(),
            ]);
        } else {
            // Token no existe, crear nuevo
            $deviceToken = DeviceToken::create([
                'user_id' => $user->id,
                'token' => $token,
                'platform' => $platform,
                'last_seen_at' => now(),
            ]);
        }

        \Log::info('Device token registered successfully', [
            'device_token_id' => $deviceToken->id,
            'user_id' => $user->id,
            'platform' => $platform,
        ]);

        return response()->json([
            'message' => 'Token registrado exitosamente.',
            'device_token' => $deviceToken->fresh(),
        ], 201);
    }
}
