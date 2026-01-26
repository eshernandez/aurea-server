<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'timezone' => ['sometimes', 'string', 'max:255'],
            'notifications_enabled' => ['sometimes', 'boolean'],
            'notifications_per_day' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'preferred_hours' => ['sometimes', 'array'],
            'preferred_hours.*' => ['integer', 'min:0', 'max:23'],
            'preferred_categories' => ['sometimes', 'array'],
            'preferred_categories.*' => ['integer', 'exists:categories,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'notifications_per_day.min' => 'Debes recibir al menos 1 notificación por día.',
            'notifications_per_day.max' => 'No puedes recibir más de 20 notificaciones por día.',
            'preferred_hours.*.integer' => 'Las horas deben ser números enteros.',
            'preferred_hours.*.min' => 'Las horas deben estar entre 0 y 23.',
            'preferred_hours.*.max' => 'Las horas deben estar entre 0 y 23.',
            'preferred_categories.*.exists' => 'Una o más categorías seleccionadas no existen.',
        ];
    }
}
