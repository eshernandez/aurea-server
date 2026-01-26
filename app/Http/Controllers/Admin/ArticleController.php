<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreArticleRequest;
use App\Http\Requests\Admin\UpdateArticleRequest;
use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Article::with('category');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
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

        $articles = $query->orderBy('created_at', 'desc')->paginate(15);
        $categories = Category::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/Articles/Index', [
            'articles' => $articles,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/Articles/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreArticleRequest $request): RedirectResponse
    {
        try {
            // Debug: Verificar qué está llegando
            Log::info('Store Article Request:', [
                'hasFile' => $request->hasFile('image_file'),
                'allFiles' => array_keys($request->allFiles()),
                'image_file_present' => $request->has('image_file'),
                'allInput' => array_keys($request->all()),
                'contentType' => $request->header('Content-Type'),
                'isMultipart' => str_contains($request->header('Content-Type', ''), 'multipart/form-data'),
            ]);
            
            // Verificar si el archivo está presente pero no se detecta con hasFile
            if ($request->has('image_file') && !$request->hasFile('image_file')) {
                Log::warning('image_file present but not detected as file. Checking raw input...');
                $rawInput = $request->input('image_file');
                Log::info('Raw image_file input type: ' . gettype($rawInput));
            }

            $data = $request->validated();

            // Si se subió un archivo, guardarlo y obtener la URL
            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                
                Log::info('File details:', [
                    'isValid' => $file->isValid(),
                    'getClientOriginalName' => $file->getClientOriginalName(),
                    'getSize' => $file->getSize(),
                    'getMimeType' => $file->getMimeType(),
                ]);
                
                // Verificar que el archivo sea válido
                if (!$file->isValid()) {
                    Log::error('File is not valid');
                    return back()->withErrors(['image_file' => 'El archivo no es válido.'])->withInput();
                }
                
                $path = $file->store('articles', 'public');
                Log::info('File stored at path: ' . $path);
                
                $data['image_url'] = asset('storage/' . $path);
                Log::info('Image URL set to: ' . $data['image_url']);
            } else {
                Log::info('No file uploaded, using image_url if provided');
            }

            // Remover image_file del array si existe
            unset($data['image_file']);

            $article = Article::create($data);
            Log::info('Article created with ID: ' . $article->id . ', image_url: ' . ($article->image_url ?? 'null'));

            return redirect()->route('admin.articles.index')
                ->with('success', 'Artículo creado exitosamente.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error al crear artículo: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['image_file' => 'Error al procesar la imagen: ' . $e->getMessage()])->withInput();
        }
    }

    public function show(Article $article): Response
    {
        $article->load(['category', 'notificationDeliveries' => function ($query) {
            $query->latest()->limit(10);
        }]);

        return Inertia::render('Admin/Articles/Show', [
            'article' => $article,
        ]);
    }

    public function edit(Article $article): Response
    {
        $article->load('category');
        $categories = Category::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/Articles/Edit', [
            'article' => $article,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateArticleRequest $request, Article $article): RedirectResponse
    {
        try {
            // Debug: Verificar qué está llegando
            Log::info('Update Article Request:', [
                'hasFile' => $request->hasFile('image_file'),
                'allFiles' => array_keys($request->allFiles()),
                'image_file_present' => $request->has('image_file'),
                'allInput' => array_keys($request->all()),
                'contentType' => $request->header('Content-Type'),
                'isMultipart' => str_contains($request->header('Content-Type', ''), 'multipart/form-data'),
            ]);
            
            // Verificar si el archivo está presente pero no se detecta con hasFile
            if ($request->has('image_file') && !$request->hasFile('image_file')) {
                Log::warning('image_file present but not detected as file. Checking raw input...');
                $rawInput = $request->input('image_file');
                Log::info('Raw image_file input type: ' . gettype($rawInput));
            }

            $data = $request->validated();

            // Si se subió un archivo, guardarlo y obtener la URL
            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                
                Log::info('File details:', [
                    'isValid' => $file->isValid(),
                    'getClientOriginalName' => $file->getClientOriginalName(),
                    'getSize' => $file->getSize(),
                    'getMimeType' => $file->getMimeType(),
                ]);
                
                // Verificar que el archivo sea válido
                if (!$file->isValid()) {
                    Log::error('File is not valid');
                    return back()->withErrors(['image_file' => 'El archivo no es válido.'])->withInput();
                }

                try {
                    // Eliminar imagen anterior si existe
                    if ($article->image_url) {
                        // Extraer el path relativo desde la URL completa
                        $oldPath = str_replace(asset('storage/'), '', $article->image_url);
                        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                            Storage::disk('public')->delete($oldPath);
                            Log::info('Old image deleted: ' . $oldPath);
                        }
                    }

                    $path = $file->store('articles', 'public');
                    Log::info('File stored at path: ' . $path);
                    
                    $data['image_url'] = asset('storage/' . $path);
                    Log::info('Image URL set to: ' . $data['image_url']);
                } catch (\Exception $e) {
                    Log::error('Error al subir la imagen: ' . $e->getMessage());
                    Log::error('Stack trace: ' . $e->getTraceAsString());
                    return back()->withErrors(['image_file' => 'Error al subir la imagen: ' . $e->getMessage()])->withInput();
                }
            } else {
                Log::info('No file uploaded, using image_url if provided');
            }

            // Remover image_file del array si existe
            unset($data['image_file']);

            $article->update($data);
            Log::info('Article updated with ID: ' . $article->id . ', image_url: ' . ($article->image_url ?? 'null'));

            return redirect()->route('admin.articles.index')
                ->with('success', 'Artículo actualizado exitosamente.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error al actualizar artículo: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['image_file' => 'Error al procesar la imagen: ' . $e->getMessage()])->withInput();
        }
    }

    public function destroy(Article $article): RedirectResponse
    {
        $article->delete();

        return redirect()->route('admin.articles.index')
            ->with('success', 'Artículo eliminado exitosamente.');
    }

    /**
     * Generate article content using AI
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
                'un enfoque completamente diferente',
                'una perspectiva única y original',
                'un ángulo innovador y fresco',
                'un punto de vista distinto',
                'un estilo narrativo diferente',
            ];
            $variation = $variations[array_rand($variations)];
            
            // Agregar timestamp o número aleatorio para forzar variación
            $uniqueId = time() . rand(1000, 9999);

            $prompt = "Escribe un artículo completo y motivador sobre {$category->name} usando {$variation}. 

IMPORTANTE: Este artículo debe ser COMPLETAMENTE DIFERENTE a cualquier otro que hayas generado antes. Varía el título, el enfoque, los ejemplos y el contenido.

El artículo debe tener:
1. Un título atractivo, conciso y ÚNICO (máximo 80 caracteres) - NO repitas títulos anteriores
2. Un resumen breve de 2-3 oraciones (máximo 200 caracteres) con un enfoque diferente
3. Un contenido completo y bien estructurado de al menos 500 palabras, con párrafos bien formateados, usando ejemplos y enfoques NUEVOS
4. Una URL opcional de una imagen relacionada (si tienes una sugerencia, inclúyela)

Responde SOLO con un JSON válido en este formato exacto:
{
    \"title\": \"Título del artículo\",
    \"summary\": \"Resumen breve del artículo\",
    \"content\": \"Contenido completo del artículo con párrafos separados por doble salto de línea\",
    \"image_url\": \"URL de imagen opcional o null\"
}

No incluyas ningún texto adicional fuera del JSON.";

            $systemPrompt = 'Eres un escritor experto en desarrollo personal y motivación. Cada artículo que escribas debe ser ÚNICO, ORIGINAL y DIFERENTE. Nunca repitas títulos, enfoques o contenido de artículos anteriores. Varía el estilo, los ejemplos y la estructura narrativa en cada artículo.';

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
            $articleData = json_decode($aiContent, true);

            if (json_last_error() !== JSON_ERROR_NONE || !isset($articleData['title']) || !isset($articleData['content'])) {
                Log::error('Error parsing AI response:', [
                    'content' => $aiContent,
                    'json_error' => json_last_error_msg(),
                ]);

                return response()->json([
                    'error' => 'Error al procesar la respuesta de la IA.',
                ], 500);
            }

            return response()->json([
                'title' => $articleData['title'] ?? '',
                'summary' => $articleData['summary'] ?? '',
                'content' => $articleData['content'] ?? '',
                'image_url' => $articleData['image_url'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating article with AI: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'error' => 'Error al generar el artículo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate article using OpenAI
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
            'max_tokens' => 2000,
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
     * Generate article using Anthropic Claude
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
                    'max_tokens' => 2000,
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
     * Generate article using Cloud Code
     * Nota: Ajusta la URL y formato según la documentación de Cloud Code
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
                    'max_tokens' => 2000,
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
