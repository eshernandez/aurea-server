<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Requests\Api\V1\RegisterRequest;
use App\Mail\AccountConfirmationMail;
use App\Models\EmailVerificationToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create default preferences
        $user->preferences()->create([
            'timezone' => $request->input('timezone', 'America/Bogota'), // Colombia por defecto
            'notifications_enabled' => true,
            'notifications_per_day' => 3,
            'preferred_hours' => [8, 12, 18],
        ]);

        // Generate verification token and send confirmation email
        $verificationToken = EmailVerificationToken::generateForUser($user, $request->password);
        // Use web route for browser-friendly verification page
        $verificationUrl = url("/verify-email?token={$verificationToken->token}");
        
        Mail::to($user->email)->send(new AccountConfirmationMail($user, $verificationUrl));

        return response()->json([
            'message' => 'Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta.',
            'user' => $user,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas.',
            ], 401);
        }

        // Check if email is verified
        if (! $user->email_verified_at) {
            // Log for debugging
            Log::warning('Login attempt with unverified email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
            ]);
            
            return response()->json([
                'message' => 'Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada para el correo de confirmación.',
                'email_not_verified' => true,
            ], 403);
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(): JsonResponse
    {
        auth()->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente.',
        ]);
    }

    public function user(): JsonResponse
    {
        $user = auth()->user()->load('preferences');

        // Log for debugging
        Log::info('User data returned', [
            'user_id' => $user->id,
            'profile_image' => $user->profile_image,
            'request_url' => request()->getSchemeAndHttpHost(),
        ]);

        return response()->json([
            'user' => $user,
        ]);
    }

    public function verifyEmail(): JsonResponse
    {
        $token = request()->query('token');

        if (! $token) {
            return response()->json([
                'message' => 'Token de verificación no proporcionado.',
            ], 400);
        }

        // Buscar el token (sin filtrar por 'used' primero para mejor debugging)
        $verificationToken = EmailVerificationToken::where('token', $token)->first();

        if (! $verificationToken) {
            return response()->json([
                'message' => 'Token de verificación no encontrado.',
            ], 400);
        }

        // Verificar si ya fue usado
        if ($verificationToken->used) {
            return response()->json([
                'message' => 'Este token de verificación ya fue utilizado. Por favor solicita uno nuevo.',
            ], 400);
        }

        // Verificar si es válido (no expirado)
        if (! $verificationToken->isValid()) {
            return response()->json([
                'message' => 'El token de verificación ha expirado. Por favor solicita uno nuevo.',
            ], 400);
        }

        $user = $verificationToken->user;

        if (! $user) {
            return response()->json([
                'message' => 'Usuario asociado al token no encontrado.',
            ], 400);
        }

        // Use transaction to ensure both updates happen
        try {
            DB::transaction(function () use ($verificationToken, $user) {
                // Mark token as used
                $verificationToken->update(['used' => true]);

                // Verify user's email - use update() with fillable field to ensure it works
                $updated = User::where('id', $user->id)->update([
                    'email_verified_at' => now()
                ]);

                // Log for debugging
                Log::info('Email verification update (API)', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'updated_rows' => $updated,
                ]);
            });

            // Refresh user to get latest data
            $user = User::find($user->id);
            
            // Double-check that the update worked
            if (!$user->email_verified_at) {
                Log::error('Email verification failed - email_verified_at is still null (API)', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
                
                // Try one more time with a direct update
                User::where('id', $user->id)->update(['email_verified_at' => now()]);
                $user = User::find($user->id);
            }
        } catch (\Exception $e) {
            Log::error('Error during email verification (API)', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'message' => 'Error al verificar el correo electrónico. Por favor intenta nuevamente.',
            ], 500);
        }

        // Get the original password (if available)
        try {
            $plainPassword = $verificationToken->getPlainPassword();
            // Only send welcome email with password if password is not empty
            if (!empty($plainPassword)) {
                Mail::to($user->email)->send(new \App\Mail\WelcomeMail($user, $plainPassword));
            }
        } catch (\Exception $e) {
            // If password decryption fails or password is empty, skip welcome email
            // This can happen if the token was created without a password
        }

        return response()->json([
            'message' => 'Correo electrónico verificado exitosamente. Se ha enviado un correo de bienvenida a tu dirección.',
            'user' => $user->fresh(),
        ]);
    }

    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'Usuario no encontrado.',
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'El correo electrónico ya está verificado.',
            ], 400);
        }

        // We need the password to generate a new token, but we can't get it from the request
        // So we'll need to create a token without password encryption
        // For now, let's create a simple token that doesn't require password
        // Or we can ask the user to provide password in the request
        
        // Option: Require password for security
        if (! $request->has('password') || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Se requiere la contraseña para reenviar el correo de verificación.',
            ], 400);
        }

        // Generate new verification token and send confirmation email
        $verificationToken = EmailVerificationToken::generateForUser($user, $request->password);
        // Use web route for browser-friendly verification page
        $verificationUrl = url("/verify-email?token={$verificationToken->token}");
        
        Mail::to($user->email)->send(new AccountConfirmationMail($user, $verificationUrl));

        return response()->json([
            'message' => 'Se ha enviado un nuevo correo de verificación a tu dirección.',
        ]);
    }

    /**
     * Force verify email for a user (temporary endpoint for debugging)
     * This should be removed or protected in production
     */
    public function forceVerifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'Usuario no encontrado.',
            ], 404);
        }

        // Force verify the email
        $updated = User::where('id', $user->id)->update([
            'email_verified_at' => now()
        ]);

        $user->refresh();

        Log::info('Force email verification', [
            'user_id' => $user->id,
            'email' => $user->email,
            'updated_rows' => $updated,
            'email_verified_at' => $user->email_verified_at,
        ]);

        return response()->json([
            'message' => 'Email verificado manualmente.',
            'user' => $user->fresh(),
            'email_verified_at' => $user->email_verified_at,
        ]);
    }
}
