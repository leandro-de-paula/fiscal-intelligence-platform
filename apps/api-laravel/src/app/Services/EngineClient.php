<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class EngineClient
{
    public function simulateTaxReform(array $payload): ?array
    {
        $baseUrl = rtrim(config('services.engine.url'), '/');

        try {
            $response = Http::timeout(10)->post(
                "{$baseUrl}/simulations/tax-reform",
                $payload
            );
        } catch (\Throwable $exception) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        return $response->json();
    }
}
