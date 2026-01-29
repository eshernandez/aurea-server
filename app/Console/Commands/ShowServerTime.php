<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;

class ShowServerTime extends Command
{
    protected $signature = 'server:time';

    protected $description = 'Show current server time and timezone information';

    public function handle(): int
    {
        $this->info('🕐 Información de Hora del Servidor');
        $this->newLine();

        // Server timezone
        $serverTimezone = config('app.timezone');
        $this->line("📍 Timezone configurado: <fg=cyan>{$serverTimezone}</>");
        $this->newLine();

        // Current times
        $utcTime = Carbon::now('UTC');
        $serverTime = Carbon::now($serverTimezone);
        $colombiaTime = Carbon::now('America/Bogota');

        $this->table(
            ['Zona', 'Hora', 'Fecha Completa'],
            [
                ['UTC', $utcTime->format('H:i:s'), $utcTime->format('Y-m-d H:i:s')],
                ['Servidor (' . $serverTimezone . ')', $serverTime->format('H:i:s'), $serverTime->format('Y-m-d H:i:s')],
                ['Colombia (America/Bogota)', $colombiaTime->format('H:i:s'), $colombiaTime->format('Y-m-d H:i:s')],
            ]
        );

        $this->newLine();
        $this->info('💡 El timezone por defecto para nuevos usuarios es: <fg=green>America/Bogota</>');

        return Command::SUCCESS;
    }
}
