<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- CRITICAL: Suppress errors from browser extensions FIRST, before any other scripts --}}
        <script>
            (function() {
                'use strict';
                // Global error handler to suppress errors from browser extensions
                // This must run as early as possible, before extensions execute
                const originalErrorHandler = window.onerror;
                window.onerror = function(message, source, lineno, colno, error) {
                    // Suppress MutationObserver errors from browser extensions
                    const messageStr = String(message || '');
                    const sourceStr = String(source || '');
                    
                    if (
                        messageStr.includes('Failed to execute \'observe\' on \'MutationObserver\'') ||
                        messageStr.includes('parameter 1 is not of type \'Node\'') ||
                        messageStr.includes('applyAdblockCode') ||
                        (sourceStr.includes('VM') && messageStr.includes('MutationObserver')) ||
                        (error && error.message && (
                            error.message.includes('MutationObserver') ||
                            error.message.includes('not of type')
                        ))
                    ) {
                        // Silently suppress these errors - they're from browser extensions
                        return true; // Prevents default error handling and console output
                    }
                    
                    // Call original error handler for other errors
                    if (originalErrorHandler) {
                        return originalErrorHandler.call(this, message, source, lineno, colno, error);
                    }
                    return false;
                };

                // Override console.error to filter out these specific errors
                const originalConsoleError = console.error;
                console.error = function(...args) {
                    const message = args.map(arg => 
                        typeof arg === 'string' ? arg : 
                        (arg && arg.message ? arg.message : String(arg))
                    ).join(' ');
                    
                    if (
                        message.includes('Failed to execute \'observe\' on \'MutationObserver\'') ||
                        message.includes('parameter 1 is not of type \'Node\'') ||
                        message.includes('applyAdblockCode') ||
                        (args.some(arg => arg && arg.stack && arg.stack.includes('applyAdblockCode')))
                    ) {
                        // Suppress this specific error - it's from browser extensions
                        return;
                    }
                    // Call original console.error for other errors
                    originalConsoleError.apply(console, args);
                };

                // Also catch unhandled promise rejections
                window.addEventListener('unhandledrejection', function(event) {
                    if (
                        event.reason && 
                        typeof event.reason === 'object' &&
                        event.reason.message &&
                        (
                            event.reason.message.includes('MutationObserver') ||
                            event.reason.message.includes('not of type')
                        )
                    ) {
                        event.preventDefault(); // Suppress the error
                        return true;
                    }
                }, true); // Use capture phase to catch early
            })();
        </script>

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                try {
                    const appearance = '{{ $appearance ?? "system" }}';

                    if (appearance === 'system') {
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                        if (prefersDark) {
                            document.documentElement.classList.add('dark');
                        }
                    }
                } catch (e) {
                    // Silently handle errors from browser extensions
                    console.debug('Theme initialization error (likely from browser extension):', e);
                }
            })();
        </script>
        
        {{-- Wrap MutationObserver to prevent errors from browser extensions --}}
        <script>
            (function() {
                // Wrap MutationObserver to prevent errors from browser extensions
                if (typeof MutationObserver !== 'undefined') {
                    const OriginalMutationObserver = MutationObserver;
                    MutationObserver = function(callback) {
                        try {
                            return new OriginalMutationObserver(function(mutations, observer) {
                                try {
                                    if (callback) {
                                        callback(mutations, observer);
                                    }
                                } catch (e) {
                                    // Silently handle errors from browser extensions
                                    if (!e.message || !e.message.includes('not of type')) {
                                        console.debug('MutationObserver callback error:', e);
                                    }
                                }
                            });
                        } catch (e) {
                            // If MutationObserver creation fails, return a no-op observer
                            return {
                                observe: function() {},
                                disconnect: function() {},
                                takeRecords: function() { return []; }
                            };
                        }
                    };
                    MutationObserver.prototype = OriginalMutationObserver.prototype;
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Aurea') }}</title>

        <link rel="icon" type="image/png" href="/img/circly-only.png">
        <link rel="apple-touch-icon" href="/img/circly-only.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
