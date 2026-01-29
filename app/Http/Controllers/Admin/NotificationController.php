<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendNotificationJob;
use App\Models\NotificationDelivery;
use App\Services\ContentSelectionService;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = NotificationDelivery::with(['user', 'quote', 'article']);

        // Filtros
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id') && $request->user_id !== '') {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('date_from') && $request->date_from !== '') {
            $query->whereDate('scheduled_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to !== '') {
            $query->whereDate('scheduled_at', '<=', $request->date_to);
        }

        // Búsqueda
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Ordenamiento - por defecto mostrar lo más reciente primero
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $notifications = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'filters' => $request->only(['status', 'user_id', 'date_from', 'date_to', 'search', 'sort_by', 'sort_order']),
        ]);
    }

    public function show(NotificationDelivery $notification): Response
    {
        $notification->load(['user', 'quote', 'article', 'user.preferences']);

        return Inertia::render('Admin/Notifications/Show', [
            'notification' => $notification,
        ]);
    }

    /**
     * Enviar notificación ahora (usando job)
     */
    public function sendNow(NotificationDelivery $notification): RedirectResponse
    {
        if ($notification->status !== 'pending') {
            return redirect()->back()->with('error', 'Solo se pueden enviar notificaciones con estado "pending".');
        }

        // Verificar que no esté cancelada para hoy (solo si la columna existe)
        if (Schema::hasColumn('notification_deliveries', 'cancelled_at') &&
            $notification->cancelled_at && 
            $notification->cancelled_at->isSameDay($notification->scheduled_at)) {
            return redirect()->back()->with('error', 'Esta notificación está cancelada para hoy.');
        }

        // Si no tiene contenido seleccionado, seleccionarlo ahora
        if (! $notification->quote_id || ! $notification->article_id || 
            $notification->quote_id === 1 || $notification->article_id === 1) {
            
            $user = $notification->user;
            
            if (! $user) {
                return redirect()->back()->with('error', 'Usuario no encontrado para esta notificación.');
            }
            
            $preferences = $user->preferences;
            
            if ($preferences && $preferences->notifications_enabled) {
                try {
                    $contentSelectionService = app(ContentSelectionService::class);
                    $preferredCategoryIds = $preferences->preferred_categories ?? null;
                    
                    $quote = $contentSelectionService->selectQuote($user, $preferredCategoryIds);
                    $article = $contentSelectionService->selectArticle($quote, $preferredCategoryIds);
                    
                    if ($quote && $article) {
                        $notification->update([
                            'quote_id' => $quote->id,
                            'article_id' => $article->id,
                        ]);
                    } else {
                        return redirect()->back()->with('error', 'No se pudo seleccionar contenido. Verifica que haya frases y artículos activos.');
                    }
                } catch (\Exception $e) {
                    Log::error('Error selecting content for notification', [
                        'notification_id' => $notification->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    return redirect()->back()->with('error', 'Error al seleccionar contenido: ' . $e->getMessage());
                }
            } else {
                return redirect()->back()->with('error', 'El usuario tiene las notificaciones deshabilitadas.');
            }
        }

        // Despachar el job
        SendNotificationJob::dispatch($notification);

        return redirect()->back()->with('success', 'Notificación enviada. Se procesará en breve.');
    }

    /**
     * Reactivar notificación (volver a pending)
     */
    public function reactivate(NotificationDelivery $notification): RedirectResponse
    {
        if (! in_array($notification->status, ['sent', 'failed'])) {
            return redirect()->back()->with('error', 'Solo se pueden reactivar notificaciones enviadas o fallidas.');
        }

        // Si la fecha programada ya pasó, actualizar a ahora
        $newScheduledAt = $notification->scheduled_at;
        if ($notification->scheduled_at->isPast()) {
            $newScheduledAt = now();
        }

        $updateData = [
            'status' => 'pending',
            'sent_at' => null,
            'error_message' => null,
            'scheduled_at' => $newScheduledAt,
        ];

        // Solo incluir cancelled_at si la columna existe
        if (Schema::hasColumn('notification_deliveries', 'cancelled_at')) {
            $updateData['cancelled_at'] = null; // Limpiar cancelación si existe
        }

        $notification->update($updateData);

        return redirect()->back()->with('success', 'Notificación reactivada. El scheduler la procesará en breve.');
    }

    /**
     * Cancelar notificación solo para hoy
     */
    public function cancel(NotificationDelivery $notification): RedirectResponse
    {
        if ($notification->status !== 'pending') {
            return redirect()->back()->with('error', 'Solo se pueden cancelar notificaciones con estado "pending".');
        }

        // Marcar como cancelada para hoy (solo si la columna existe)
        if (Schema::hasColumn('notification_deliveries', 'cancelled_at')) {
            $notification->update([
                'cancelled_at' => now(),
            ]);
        } else {
            // Si la columna no existe, solo actualizar el status
            $notification->update([
                'status' => 'cancelled',
            ]);
        }

        return redirect()->back()->with('success', 'Notificación cancelada para hoy. Se programará nuevamente mañana.');
    }
}
