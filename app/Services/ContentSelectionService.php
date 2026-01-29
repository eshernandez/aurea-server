<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Quote;
use App\Models\QuoteUserHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ContentSelectionService
{
    /**
     * Select a quote for the user, avoiding repetitions.
     *
     * Regla actual:
     * - No repetir una frase que ya se haya enviado antes a ese usuario.
     * - Si ya se enviaron todas las frases activas a ese usuario, NO se selecciona nada
     *   (la notificación para ese horario se omite).
     */
    public function selectQuote(User $user, ?array $preferredCategoryIds = null): ?Quote
    {
        // Obtener TODAS las frases que ya se han enviado a este usuario.
        // Si la tabla no existe (por ejemplo en entornos locales sin migración),
        // continuamos sin filtrar para no romper el flujo.
        $recentQuoteIds = [];
        try {
            $recentQuoteIds = QuoteUserHistory::where('user_id', $user->id)
                ->pluck('quote_id')
                ->toArray();
        } catch (\Exception $e) {
            // La tabla puede no existir aún; continuar sin filtro de historial.
            Log::warning('QuoteUserHistory table not found, continuing without history filter', [
                'error' => $e->getMessage(),
            ]);
        }

        // Build query for available quotes
        $query = Quote::where('is_active', true)
            ->whereNotIn('id', $recentQuoteIds);

        // Filter by preferred categories if provided
        if (! empty($preferredCategoryIds)) {
            $query->whereIn('category_id', $preferredCategoryIds);
        }

        // Get random quote
        $quote = $query->inRandomOrder()->first();

        // If no quote found with preferences, try without category filter
        if (! $quote && ! empty($preferredCategoryIds)) {
            $query = Quote::where('is_active', true)
                ->whereNotIn('id', $recentQuoteIds);
            $quote = $query->inRandomOrder()->first();
        }

        return $quote;
    }

    /**
     * Select an article related to the quote's category
     */
    public function selectArticle(?Quote $quote, ?array $preferredCategoryIds = null): ?Article
    {
        $query = Article::where('is_active', true);

        // Prefer same category as quote
        if ($quote && $quote->category_id) {
            $query->where('category_id', $quote->category_id);
        } elseif (! empty($preferredCategoryIds)) {
            // Or use preferred categories
            $query->whereIn('category_id', $preferredCategoryIds);
        }

        $article = $query->inRandomOrder()->first();

        // If no article found, get any active article
        if (! $article) {
            $article = Article::where('is_active', true)->inRandomOrder()->first();
        }

        return $article;
    }

    /**
     * Record that a quote was sent to a user
     */
    public function recordQuoteSent(User $user, Quote $quote): void
    {
        try {
            QuoteUserHistory::create([
                'user_id' => $user->id,
                'quote_id' => $quote->id,
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail the notification
            Log::warning('Failed to record quote in history', [
                'user_id' => $user->id,
                'quote_id' => $quote->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
