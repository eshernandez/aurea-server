<?php

namespace App\Console\Commands;

use App\Mail\AccountConfirmationMail;
use App\Models\EmailVerificationToken;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SendEmailVerification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:send-verification 
                            {email : El correo electrónico del usuario}
                            {--password= : La contraseña del usuario (opcional, si se proporciona se actualizará la contraseña y se enviará en el correo de bienvenida)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía un correo de verificación de email a un usuario';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->option('password');

        // Buscar el usuario
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("Usuario con email '{$email}' no encontrado.");
            return Command::FAILURE;
        }

        // Verificar si el email ya está verificado
        if ($user->email_verified_at) {
            if (! $this->confirm("El email de este usuario ya está verificado. ¿Deseas enviar el correo de todas formas?")) {
                $this->info('Operación cancelada.');
                return Command::SUCCESS;
            }
        }

        // Generar token de verificación
        if ($password) {
            // Si se proporciona la contraseña, actualizar la contraseña del usuario
            $user->password = Hash::make($password);
            $user->save();
            
            $this->info("✅ Contraseña actualizada para el usuario: {$user->email}");
            
            // Generar token con la nueva contraseña
            $verificationToken = EmailVerificationToken::generateForUser($user, $password);
        } else {
            // Si no se proporciona contraseña, crear un token sin contraseña encriptada
            // Usar transacción para asegurar atomicidad
            $verificationToken = DB::transaction(function () use ($user) {
                // Marcar tokens existentes como usados
                EmailVerificationToken::where('user_id', $user->id)
                    ->where('used', false)
                    ->update(['used' => true]);

                // Generar un token único
                $token = Str::random(64);
                
                // Asegurar que el token sea único (muy improbable pero por si acaso)
                while (EmailVerificationToken::where('token', $token)->exists()) {
                    $token = Str::random(64);
                }

                // Crear nuevo token sin contraseña
                $newToken = EmailVerificationToken::create([
                    'user_id' => $user->id,
                    'token' => $token,
                    'encrypted_password' => encrypt(''), // Contraseña vacía
                    'expires_at' => now()->addHours(24),
                    'used' => false,
                ]);

                return $newToken->fresh();
            });

            $this->warn('⚠️  No se proporcionó contraseña. El correo de bienvenida no incluirá la contraseña del usuario.');
        }

        // Generar URL de verificación
        $verificationUrl = url("/verify-email?token={$verificationToken->token}");

        try {
            // Enviar correo
            Mail::to($user->email)->send(new AccountConfirmationMail($user, $verificationUrl));

            $this->info("✅ Correo de verificación enviado exitosamente a: {$user->email}");
            $this->line("   Token: {$verificationToken->token}");
            $this->line("   URL: {$verificationUrl}");
            $this->line("   Expira en: {$verificationToken->expires_at->diffForHumans()}");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("❌ Error al enviar el correo: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
