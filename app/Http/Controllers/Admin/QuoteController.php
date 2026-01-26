<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreQuoteRequest;
use App\Http\Requests\Admin\UpdateQuoteRequest;
use App\Models\Category;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Quote::with('category');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('text', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $quotes = $query->orderBy('created_at', 'desc')->paginate(15);
        $categories = Category::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/Quotes/Index', [
            'quotes' => $quotes,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/Quotes/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreQuoteRequest $request): RedirectResponse
    {
        Quote::create($request->validated());

        return redirect()->route('admin.quotes.index')
            ->with('success', 'Frase creada exitosamente.');
    }

    public function show(Quote $quote): Response
    {
        $quote->load(['category', 'notificationDeliveries' => function ($query) {
            $query->latest()->limit(10);
        }]);

        return Inertia::render('Admin/Quotes/Show', [
            'quote' => $quote,
        ]);
    }

    public function edit(Quote $quote): Response
    {
        $quote->load('category');
        $categories = Category::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/Quotes/Edit', [
            'quote' => $quote,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateQuoteRequest $request, Quote $quote): RedirectResponse
    {
        $quote->update($request->validated());

        return redirect()->route('admin.quotes.index')
            ->with('success', 'Frase actualizada exitosamente.');
    }

    public function destroy(Quote $quote): RedirectResponse
    {
        $quote->delete();

        return redirect()->route('admin.quotes.index')
            ->with('success', 'Frase eliminada exitosamente.');
    }

    /**
     * Generate quote content using AI
     */
    public function generateWithAI(Request $request): JsonResponse
    {
        // Aumentar el tiempo máximo de ejecución para operaciones de IA
        set_time_limit(120); // 2 minutos
        
        $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
        ]);

        $category = Category::findOrFail($request->category_id);
        $provider = strtoupper(env('USE_PROVEDER_IA', 'OPENAI'));

        try {
            // Agregar variación al prompt para generar contenido diferente cada vez
            $variations = [
                'una frase única y original',
                'una cita poderosa y diferente',
                'una frase innovadora y fresca',
                'una cita única que no hayas usado antes',
                'una frase completamente nueva y original',
            ];
            $variation = $variations[array_rand($variations)];

            $prompt = "Escribe {$variation} motivadora e inspiradora sobre {$category->name}. 

IMPORTANTE: Esta debe ser una frase COMPLETAMENTE NUEVA y DIFERENTE. No repitas frases que hayas generado anteriormente.

La frase debe ser:
1. Breve y concisa (máximo 200 caracteres)
2. Inspiradora y motivadora
3. Relacionada con el tema de {$category->name}
4. ÚNICA y ORIGINAL - no uses frases comunes o que hayas generado antes
5. Con un autor reconocido (puede ser real o un nombre inspirador)

Responde SOLO con un JSON válido en este formato exacto:
{
    \"text\": \"Texto de la frase o cita\",
    \"author\": \"Nombre del autor (puede ser null si no hay autor específico)\"
}

No incluyas ningún texto adicional fuera del JSON.";

            $systemPrompt = 'Eres un experto en crear frases y citas motivadoras e inspiradoras. Cada frase que escribas debe ser ÚNICA, ORIGINAL y DIFERENTE. Nunca repitas frases que hayas generado anteriormente. Varía el estilo, el enfoque y el mensaje en cada frase.';

            switch ($provider) {
                case 'ANTHROPIC':
                case 'ANTHROPIC_API_KEY':
                    $aiContent = $this->generateWithAnthropic($prompt, $systemPrompt);
                    break;
                case 'CLOUDCODE':
                case 'CLOUDE_CODE':
                case 'CLOUD_CODE':
                    $aiContent = $this->generateWithCloudCode($prompt, $systemPrompt);
                    break;
                case 'OPENAI':
                default:
                    $aiContent = $this->generateWithOpenAI($prompt, $systemPrompt);
                    break;
            }

            // Limpiar el contenido (puede venir con markdown code blocks)
            $aiContent = preg_replace('/```json\s*/', '', $aiContent);
            $aiContent = preg_replace('/```\s*/', '', $aiContent);
            $aiContent = trim($aiContent);

            // Parsear el JSON
            $quoteData = json_decode($aiContent, true);

            if (json_last_error() !== JSON_ERROR_NONE || !isset($quoteData['text'])) {
                Log::error('Error parsing AI response:', [
                    'content' => $aiContent,
                    'json_error' => json_last_error_msg(),
                ]);

                return response()->json([
                    'error' => 'Error al procesar la respuesta de la IA.',
                ], 500);
            }

            return response()->json([
                'text' => $quoteData['text'] ?? '',
                'author' => $quoteData['author'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating quote with AI: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'error' => 'Error al generar la frase: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate quote using OpenAI
     */
    private function generateWithOpenAI(string $prompt, string $systemPrompt): string
    {
        $apiKey = env('OPENAI_API_KEY');

        if (!$apiKey) {
            throw new \Exception('OpenAI API key no configurada.');
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ],
                [
                    'role' => 'user',
                    'content' => $prompt,
                ],
            ],
            'temperature' => 0.9, // Aumentar temperatura para más variación
            'max_tokens' => 500,
        ]);

        if (!$response->successful()) {
            Log::error('OpenAI API Error:', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new \Exception('Error al comunicarse con la API de OpenAI.');
        }

        $responseData = $response->json();
        return $responseData['choices'][0]['message']['content'] ?? '';
    }

    /**
     * Generate quote using Anthropic Claude
     */
    private function generateWithAnthropic(string $prompt, string $systemPrompt): string
    {
        $apiKey = env('ANTHROPIC_API_KEY');

        if (!$apiKey) {
            throw new \Exception('Anthropic API key no configurada.');
        }

        // Intentar con diferentes modelos según disponibilidad
        // Modelos más recientes de Claude 4.5 (2026)
        $models = [
            'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5 (más reciente y recomendado)
            'claude-opus-4-5-20251101', // Claude Opus 4.5 (máxima inteligencia)
            'claude-haiku-4-5-20251001', // Claude Haiku 4.5 (más rápido)
            // Fallback a modelos anteriores si los 4.5 no están disponibles
            'claude-3-5-sonnet-20241022',
            'claude-3-5-sonnet-20240620',
        ];

        $response = null;
        $lastError = null;

        foreach ($models as $model) {
            try {
                $response = Http::withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type' => 'application/json',
                ])->timeout(45)->post('https://api.anthropic.com/v1/messages', [
                    'model' => $model,
                    'max_tokens' => 500,
                    'system' => $systemPrompt,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'temperature' => 0.9, // Aumentar temperatura para más variación
                ]);

                if ($response->successful()) {
                    break; // Modelo funcionó, salir del loop
                }

                $lastError = [
                    'model' => $model,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ];

                Log::warning("Anthropic model {$model} failed, trying next...", $lastError);
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::warning("Anthropic model {$model} connection timeout, trying next...", [
                    'model' => $model,
                    'error' => $e->getMessage(),
                ]);
                $lastError = [
                    'model' => $model,
                    'status' => 'timeout',
                    'error' => 'Connection timeout',
                ];
                continue; // Continuar con el siguiente modelo
            } catch (\Exception $e) {
                Log::warning("Anthropic model {$model} error, trying next...", [
                    'model' => $model,
                    'error' => $e->getMessage(),
                ]);
                $lastError = [
                    'model' => $model,
                    'status' => 'error',
                    'error' => $e->getMessage(),
                ];
                continue; // Continuar con el siguiente modelo
            }
        }

        if (!$response || !$response->successful()) {
            Log::error('Anthropic API Error - All models failed:', [
                'last_error' => $lastError,
            ]);

            throw new \Exception('Error al comunicarse con la API de Anthropic. Ningún modelo disponible funcionó.');
        }

        $responseData = $response->json();
        
        // Anthropic devuelve el contenido en un formato diferente
        if (isset($responseData['content']) && is_array($responseData['content'])) {
            $textContent = '';
            foreach ($responseData['content'] as $content) {
                if ($content['type'] === 'text') {
                    $textContent .= $content['text'];
                }
            }
            return $textContent;
        }

        return '';
    }

    /**
     * Generate quote using Cloud Code
     */
    private function generateWithCloudCode(string $prompt, string $systemPrompt): string
    {
        $apiKey = env('CLOUDCODE_API_KEY') ?: env('ANTHROPIC_API_KEY');

        if (!$apiKey) {
            throw new \Exception('Cloud Code API key no configurada.');
        }

        // Cloud Code puede usar la misma API de Anthropic o tener su propio endpoint
        // Ajusta según la documentación específica de Cloud Code
        // Intentar con diferentes modelos según disponibilidad
        // Modelos más recientes de Claude 4.5 (2026)
        $models = [
            'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5 (más reciente y recomendado)
            'claude-opus-4-5-20251101', // Claude Opus 4.5 (máxima inteligencia)
            'claude-haiku-4-5-20251001', // Claude Haiku 4.5 (más rápido)
            // Fallback a modelos anteriores si los 4.5 no están disponibles
            'claude-3-5-sonnet-20241022',
            'claude-3-5-sonnet-20240620',
        ];

        $response = null;
        $lastError = null;

        foreach ($models as $model) {
            try {
                $response = Http::withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type' => 'application/json',
                ])->timeout(45)->post('https://api.anthropic.com/v1/messages', [
                    'model' => $model,
                    'max_tokens' => 500,
                    'system' => $systemPrompt,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'temperature' => 0.9, // Aumentar temperatura para más variación
                ]);

                if ($response->successful()) {
                    break; // Modelo funcionó, salir del loop
                }

                $lastError = [
                    'model' => $model,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ];

                Log::warning("Cloud Code model {$model} failed, trying next...", $lastError);
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::warning("Cloud Code model {$model} connection timeout, trying next...", [
                    'model' => $model,
                    'error' => $e->getMessage(),
                ]);
                $lastError = [
                    'model' => $model,
                    'status' => 'timeout',
                    'error' => 'Connection timeout',
                ];
                continue; // Continuar con el siguiente modelo
            } catch (\Exception $e) {
                Log::warning("Cloud Code model {$model} error, trying next...", [
                    'model' => $model,
                    'error' => $e->getMessage(),
                ]);
                $lastError = [
                    'model' => $model,
                    'status' => 'error',
                    'error' => $e->getMessage(),
                ];
                continue; // Continuar con el siguiente modelo
            }
        }

        if (!$response || !$response->successful()) {
            Log::error('Cloud Code API Error - All models failed:', [
                'last_error' => $lastError,
            ]);

            throw new \Exception('Error al comunicarse con la API de Cloud Code. Ningún modelo disponible funcionó.');
        }

        $responseData = $response->json();
        
        // Extraer el contenido de texto
        if (isset($responseData['content']) && is_array($responseData['content'])) {
            $textContent = '';
            foreach ($responseData['content'] as $content) {
                if ($content['type'] === 'text') {
                    $textContent .= $content['text'];
                }
            }
            return $textContent;
        }

        return '';
    }
}
