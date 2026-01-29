<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a {{ config('app.name') }}!</title>
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
        .credentials {
            background-color: #f7fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .credential-item {
            margin: 15px 0;
        }
        .credential-label {
            font-weight: bold;
            color: #4a5568;
            margin-bottom: 5px;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            background-color: white;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #cbd5e0;
            color: #2d3748;
        }
        .footer {
            text-align: center;
            color: #718096;
            font-size: 12px;
            margin-top: 20px;
        }
        .success {
            background-color: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
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
            <div class="success">
                <strong>✅ ¡Cuenta confirmada exitosamente!</strong>
            </div>
            
            <h2>¡Bienvenido a {{ config('app.name') }}, {{ $user->name }}!</h2>
            
            <p>Tu cuenta ha sido activada correctamente. Estamos emocionados de tenerte con nosotros.</p>
            
            <p>Para que no olvides tus credenciales de acceso, aquí tienes la información de tu cuenta:</p>
            
            <div class="credentials">
                <div class="credential-item">
                    <div class="credential-label">Correo electrónico:</div>
                    <div class="credential-value">{{ $user->email }}</div>
                </div>
                <div class="credential-item">
                    <div class="credential-label">Contraseña:</div>
                    <div class="credential-value">{{ $plainPassword }}</div>
                </div>
            </div>
            
            <div class="warning">
                <strong>🔒 Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez. Guarda este correo en un lugar seguro o guarda tus credenciales en un gestor de contraseñas.
            </div>
            
            <p>Ya puedes iniciar sesión en la aplicación y comenzar a disfrutar de todos los beneficios de {{ config('app.name') }}.</p>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            
            <p>¡Que tengas un excelente día!</p>
            
            <p>El equipo de {{ config('app.name') }}</p>
        </div>
        
        <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
