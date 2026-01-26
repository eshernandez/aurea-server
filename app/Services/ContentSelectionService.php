<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Quote;
use App\Models\QuoteUserHistory;
use App\Models\User;
use Carbon\Carbon;

class ContentSelectionService
{
    /**
     * Select a quote for the user, avoiding recent repetitions
     */
    public function selectQuote(User $user, ?array $preferredCategoryIds = null): ?Quote
    {
        $daysToAvoid = 7; // Don't repeat quotes within 7 days

        // Get quotes sent to this user in the last N days
        $recentQuoteIds = QuoteUserHistory::where('user_id', $user->id)
            ->where('sent_at', '>=', Carbon::now()->subDays($daysToAvoid))
            ->pluck('quote_id')
            ->toArray();

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
        QuoteUserHistory::create([
            'user_id' => $user->id,
            'quote_id' => $quote->id,
            'sent_at' => now(),
        ]);
    }
}
