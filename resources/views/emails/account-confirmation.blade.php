<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmar tu cuenta - {{ config('app.name') }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 30px;
            margin: 20px 0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #4a5568;
            margin-bottom: 10px;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4a5568;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background-color: #2d3748;
        }
        .footer {
            text-align: center;
            color: #718096;
            font-size: 12px;
            margin-top: 20px;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ config('app.name') }}</div>
        </div>
        
        <div class="content">
            <h2>¡Bienvenido a {{ config('app.name') }}!</h2>
            
            <p>Hola <strong>{{ $user->name }}</strong>,</p>
            
            <p>Gracias por registrarte en {{ config('app.name') }}. Para completar tu registro y activar tu cuenta, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
                <a href="{{ $verificationUrl }}" class="button">Confirmar mi cuenta</a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #4a5568; background-color: #f7fafc; padding: 10px; border-radius: 4px;">
                {{ $verificationUrl }}
            </p>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace solo puede ser usado una vez y expirará en 24 horas. Si no confirmas tu cuenta en ese tiempo, deberás solicitar un nuevo enlace de verificación.
            </div>
            
            <p>Si no creaste una cuenta en {{ config('app.name') }}, puedes ignorar este correo.</p>
        </div>
        
        <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
