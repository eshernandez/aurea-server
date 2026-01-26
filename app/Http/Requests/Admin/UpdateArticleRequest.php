<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'summary' => ['nullable', 'string'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'is_active' => ['boolean'],
        ];

        // Validar image_file solo si está presente
        // Validar image_url solo si no hay image_file
        if ($this->hasFile('image_file')) {
            $rules['image_file'] = ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120']; // 5MB max
            $rules['image_url'] = ['nullable'];
        } else {
            $rules['image_url'] = ['nullable', 'url', 'max:500'];
            $rules['image_file'] = ['nullable'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'content.required' => 'El contenido es obligatorio.',
            'category_id.required' => 'La categoría es obligatoria.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'image_url.url' => 'La URL de la imagen debe ser válida.',
            'image_file.required' => 'Debes seleccionar un archivo de imagen.',
            'image_file.image' => 'El archivo debe ser una imagen válida (JPG, PNG, GIF, etc.).',
            'image_file.max' => 'La imagen no debe superar los 5MB.',
            'image_file.uploaded' => 'El archivo falló al subirse. Verifica que el archivo sea válido y no exceda 5MB.',
        ];
    }
}
