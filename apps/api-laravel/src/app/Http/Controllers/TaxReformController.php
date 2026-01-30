<?php

namespace App\Http\Controllers;

use App\Services\EngineClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxReformController extends Controller
{
    public function __construct(private EngineClient $engineClient)
    {
    }

    public function simulate(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'base_year' => ['required', 'integer'],
            'revenue' => ['required', 'array'],
            'revenue.goods_annual' => ['required', 'numeric', 'min:0'],
            'revenue.services_annual' => ['required', 'numeric', 'min:0'],
            'last_year_taxes_paid' => ['required', 'array'],
            'last_year_taxes_paid.icms' => ['required', 'numeric', 'min:0'],
            'last_year_taxes_paid.iss' => ['required', 'numeric', 'min:0'],
            'last_year_taxes_paid.pis_cofins' => ['required', 'numeric', 'min:0'],
            'growth_rates' => ['required', 'array'],
            'growth_rates.optimistic' => ['required', 'numeric'],
            'growth_rates.conservative' => ['required', 'numeric'],
            'growth_rates.pessimistic' => ['required', 'numeric'],
            'policy' => ['sometimes', 'array'],
        ]);

        $result = $this->engineClient->simulateTaxReform($payload);

        if ($result === null) {
            return response()->json(
                [
                    'error' => 'ENGINE_UNAVAILABLE',
                    'message' => 'Unable to run simulation right now.',
                ],
                502
            );
        }

        return response()->json($result);
    }
}
