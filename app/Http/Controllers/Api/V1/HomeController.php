<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $preferences = $user->preferences;

        // Get user's preferred categories or use all active categories
        $categoryIds = $preferences?->preferred_categories ?? [];

        // Get a random quote
        $quoteQuery = Quote::where('is_active', true);
        if (! empty($categoryIds)) {
            $quoteQuery->whereIn('category_id', $categoryIds);
        }
        $quote = $quoteQuery->inRandomOrder()->with('category')->first();

        // If no quote found, get any active quote
        if (! $quote) {
            $quote = Quote::where('is_active', true)->inRandomOrder()->with('category')->first();
        }

        // Get a related article (same category as quote, or random)
        $articleQuery = Article::where('is_active', true);
        if ($quote && $quote->category_id) {
            $articleQuery->where('category_id', $quote->category_id);
        } elseif (! empty($categoryIds)) {
            $articleQuery->whereIn('category_id', $categoryIds);
        }
        $article = $articleQuery->inRandomOrder()->with('category')->first();

        // If no article found, get any active article
        if (! $article) {
            $article = Article::where('is_active', true)->inRandomOrder()->with('category')->first();
        }

        return response()->json([
            'quote' => $quote,
            'article' => $article,
        ]);
    }
}
