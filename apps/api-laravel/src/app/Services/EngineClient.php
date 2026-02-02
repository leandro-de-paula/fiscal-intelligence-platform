<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;

class EngineClient
{
    public function simulateTaxReform(array $payload): Response
    {
        $baseUrl = rtrim(config('services.engine.url'), '/');

        return Http::timeout(10)->post(
            "{$baseUrl}/simulations/tax-reform",
            $payload
        );
    }
}
