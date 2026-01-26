<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDeviceTokenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'platform' => ['required', 'string', Rule::in(['android', 'ios'])],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'El token del dispositivo es obligatorio.',
            'platform.required' => 'La plataforma es obligatoria.',
            'platform.in' => 'La plataforma debe ser "android" o "ios".',
        ];
    }
}
