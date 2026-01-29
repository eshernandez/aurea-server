<?php

/**
 * Script para verificar que la tabla device_tokens existe y está correctamente configurada
 * 
 * Uso: php verify_device_tokens_table.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "🔍 Verificando tabla device_tokens...\n\n";

// Verificar si la tabla existe
if (Schema::hasTable('device_tokens')) {
    echo "✅ La tabla 'device_tokens' existe\n";
    
    // Verificar estructura
    $columns = Schema::getColumnListing('device_tokens');
    $requiredColumns = ['id', 'user_id', 'platform', 'token', 'last_seen_at', 'created_at', 'updated_at'];
    
    echo "\n📋 Columnas encontradas:\n";
    foreach ($columns as $column) {
        $required = in_array($column, $requiredColumns) ? ' ✅' : '';
        echo "  - {$column}{$required}\n";
    }
    
    // Verificar que todas las columnas requeridas existen
    $missingColumns = array_diff($requiredColumns, $columns);
    if (empty($missingColumns)) {
        echo "\n✅ Todas las columnas requeridas están presentes\n";
    } else {
        echo "\n❌ Faltan columnas: " . implode(', ', $missingColumns) . "\n";
    }
    
    // Contar registros
    try {
        $count = DB::table('device_tokens')->count();
        echo "\n📊 Total de tokens registrados: {$count}\n";
        
        if ($count > 0) {
            $byPlatform = DB::table('device_tokens')
                ->select('platform', DB::raw('count(*) as count'))
                ->groupBy('platform')
                ->get();
            
            echo "\n📱 Tokens por plataforma:\n";
            foreach ($byPlatform as $platform) {
                echo "  - {$platform->platform}: {$platform->count}\n";
            }
        }
    } catch (\Exception $e) {
        echo "\n⚠️  Error al contar registros: {$e->getMessage()}\n";
    }
    
    // Verificar índices
    echo "\n🔑 Verificando índices...\n";
    try {
        $indexes = DB::select("SHOW INDEXES FROM device_tokens");
        $indexNames = array_unique(array_column($indexes, 'Key_name'));
        
        foreach ($indexNames as $indexName) {
            if ($indexName !== 'PRIMARY') {
                echo "  - {$indexName} ✅\n";
            }
        }
        
        // Verificar índice único en token
        $hasUniqueToken = false;
        foreach ($indexes as $index) {
            if ($index->Key_name !== 'PRIMARY' && $index->Non_unique == 0 && $index->Column_name === 'token') {
                $hasUniqueToken = true;
                break;
            }
        }
        
        if ($hasUniqueToken) {
            echo "  ✅ Índice único en 'token' existe\n";
        } else {
            echo "  ⚠️  Índice único en 'token' no encontrado\n";
        }
    } catch (\Exception $e) {
        echo "  ⚠️  Error al verificar índices: {$e->getMessage()}\n";
    }
    
} else {
    echo "❌ La tabla 'device_tokens' NO existe\n";
    echo "\n💡 Ejecuta las migraciones:\n";
    echo "   php artisan migrate\n";
    exit(1);
}

// Verificar modelo
echo "\n🔍 Verificando modelo DeviceToken...\n";
try {
    $model = new \App\Models\DeviceToken();
    echo "✅ Modelo DeviceToken existe\n";
    
    // Verificar relación con User
    if (method_exists($model, 'user')) {
        echo "✅ Relación 'user()' existe en el modelo\n";
    } else {
        echo "❌ Relación 'user()' no existe en el modelo\n";
    }
} catch (\Exception $e) {
    echo "❌ Error al verificar modelo: {$e->getMessage()}\n";
}

// Verificar relación en User
echo "\n🔍 Verificando relación en modelo User...\n";
try {
    $user = new \App\Models\User();
    if (method_exists($user, 'deviceTokens')) {
        echo "✅ Relación 'deviceTokens()' existe en User\n";
    } else {
        echo "❌ Relación 'deviceTokens()' no existe en User\n";
    }
} catch (\Exception $e) {
    echo "❌ Error al verificar relación: {$e->getMessage()}\n";
}

echo "\n✅ Verificación completada\n";
