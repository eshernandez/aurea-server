<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class VerifyUserEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:verify-email 
                            {email : El correo electrónico del usuario}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Marca el email de un usuario como verificado manualmente';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');

        // Buscar el usuario
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("Usuario con email '{$email}' no encontrado.");
            return Command::FAILURE;
        }

        // Mostrar estado actual
        $this->info("Usuario encontrado: {$user->name}");
        $this->line("Email: {$user->email}");
        $this->line("Email verificado: " . ($user->email_verified_at ? $user->email_verified_at->format('Y-m-d H:i:s') : 'NO'));

        if ($user->email_verified_at) {
            if (! $this->confirm("El email ya está verificado. ¿Deseas actualizarlo de todas formas?")) {
                $this->info('Operación cancelada.');
                return Command::SUCCESS;
            }
        }

        // Verificar el email
        $user->email_verified_at = now();
        $user->save();

        $this->info("✅ Email verificado exitosamente para: {$user->email}");
        $this->line("   Fecha de verificación: {$user->email_verified_at->format('Y-m-d H:i:s')}");

        return Command::SUCCESS;
    }
}
