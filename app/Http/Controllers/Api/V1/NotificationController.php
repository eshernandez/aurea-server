<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NotificationDelivery;
use App\Models\Quote;
use App\Models\Article;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function history(): JsonResponse
    {
        $user = auth()->user();

        $deliveries = NotificationDelivery::where('user_id', $user->id)
            ->where('status', 'sent')
            ->with(['quote', 'article'])
            ->orderBy('sent_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'notifications' => $deliveries,
        ]);
    }

    public function show(NotificationDelivery $delivery): JsonResponse
    {
        $user = auth()->user();

        // Ensure the delivery belongs to the authenticated user
        if ($delivery->user_id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $delivery->load(['quote', 'article']);

        return response()->json([
            'notification' => $delivery,
        ]);
    }

    public function getByQuoteAndArticle(int $quoteId, int $articleId): JsonResponse
    {
        $quote = Quote::where('id', $quoteId)
            ->where('is_active', true)
            ->with('category')
            ->first();

        $article = Article::where('id', $articleId)
            ->where('is_active', true)
            ->with('category')
            ->first();

        if (!$quote || !$article) {
            return response()->json([
                'message' => 'Frase o artículo no encontrado.',
            ], 404);
        }

        // Create a mock notification delivery object for the response
        $notification = [
            'id' => null,
            'user_id' => auth()->id(),
            'quote_id' => $quote->id,
            'article_id' => $article->id,
            'status' => 'viewing',
            'sent_at' => null,
            'quote' => $quote,
            'article' => $article,
        ];

        return response()->json([
            'notification' => $notification,
        ]);
    }
}
