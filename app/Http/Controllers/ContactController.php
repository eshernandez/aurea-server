<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Show the contact page.
     */
    public function index(): Response
    {
        return Inertia::render('download-app');
    }

    /**
     * Handle contact form submission.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // TODO: Enviar email o guardar en base de datos
        // Por ahora, solo retornamos éxito
        // Mail::to(config('mail.from.address'))->send(new ContactMail($request->all()));

        return back()->with('success', 'Mensaje enviado exitosamente');
    }
}
