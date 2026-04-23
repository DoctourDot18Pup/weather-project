<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class WeatherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city' => 'required|string|min:2|max:100|regex:/^[a-zA-Z\s\-]+$/'
        ];
    }

    public function messages(): array
    {
        return [
            'city.required' => 'El nombre de la ciudad es requerido',
            'city.string' => 'El nombre de la ciudad debe ser texto',
            'city.min' => 'El nombre de la ciudad debe tener al menos 2 caracteres',
            'city.max' => 'El nombre de la ciudad no puede exceder 100 caracteres',
            'city.regex' => 'El nombre de la ciudad solo puede contener letras, espacios y guiones'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}