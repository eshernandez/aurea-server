<?php

namespace App\Http\Controllers;

use App\Models\EmailVerificationToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    public function verify(Request $request): Response
    {
        $token = $request->query('token');
        $success = false;
        $message = '';
        $user = null;

        if (! $token) {
            return Inertia::render('auth/email-verification-result', [
                'success' => false,
                'message' => 'Token de verificación no proporcionado.',
            ]);
        }

        // Buscar el token (sin filtrar por 'used' primero para mejor debugging)
        $verificationToken = EmailVerificationToken::where('token', $token)->first();

        if (! $verificationToken) {
            return Inertia::render('auth/email-verification-result', [
                'success' => false,
                'message' => 'Token de verificación no encontrado.',
            ]);
        }

        // Verificar si ya fue usado
        if ($verificationToken->used) {
            return Inertia::render('auth/email-verification-result', [
                'success' => false,
                'message' => 'Este token de verificación ya fue utilizado. Por favor solicita uno nuevo.',
            ]);
        }

        // Verificar si es válido (no expirado)
        if (! $verificationToken->isValid()) {
            return Inertia::render('auth/email-verification-result', [
                'success' => false,
                'message' => 'El token de verificación ha expirado. Por favor solicita uno nuevo.',
            ]);
        }

        $user = $verificationToken->user;

        if (! $user) {
            return Inertia::render('auth/email-verification-result', [
                'success' => false,
                'message' => 'Usuario asociado al token no encontrado.',
            ]);
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
                Log::info('Email verification update', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'updated_rows' => $updated,
                ]);
            });

            // Refresh user to get latest data
            $user = User::find($user->id);
            
            // Double-check that the update worked
            if (!$user->email_verified_at) {
                Log::error('Email verification failed - email_verified_at is still null', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
                
                // Try one more time with a direct update
                User::where('id', $user->id)->update(['email_verified_at' => now()]);
                $user = User::find($user->id);
            }
        } catch (\Exception $e) {
            Log::error('Error during email verification', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
            
            return Inertia::render('auth/email-verification-result', [
                'success' => false,
                'message' => 'Error al verificar el correo electrónico. Por favor intenta nuevamente o contacta al soporte.',
            ]);
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

        return Inertia::render('auth/email-verification-result', [
            'success' => true,
            'message' => '¡Correo electrónico verificado exitosamente! Se ha enviado un correo de bienvenida a tu dirección.',
            'user' => $user->fresh(['preferences']),
        ]);
    }
}
