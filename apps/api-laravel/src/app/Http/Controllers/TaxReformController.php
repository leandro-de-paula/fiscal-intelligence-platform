<?php

namespace App\Http\Controllers;

use App\Services\EngineClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Client\ConnectionException;

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

        try {
            $response = $this->engineClient->simulateTaxReform($payload);
        } catch (ConnectionException|\Throwable $exception) {
            return response()->json(
                [
                    'error' => 'ENGINE_UNAVAILABLE',
                    'message' => 'Unable to run simulation right now.',
                ],
                502
            );
        }

        if ($response->status() === 422) {
            return response()->json($response->json(), 422);
        }

        if (! $response->successful()) {
            return response()->json(
                [
                    'error' => 'ENGINE_UNAVAILABLE',
                    'message' => 'Unable to run simulation right now.',
                ],
                502
            );
        }

        $body = $response->json();
        $lastYearTaxes = $payload['last_year_taxes_paid'] ?? [];
        $lastYearTotal = array_sum($lastYearTaxes);
        $annualRevenueTotal = ($payload['revenue']['goods_annual'] ?? 0)
            + ($payload['revenue']['services_annual'] ?? 0);
        $transitionYears = $body['transition_2029_2032']
            ? array_map(fn ($row) => $row['year'], $body['transition_2029_2032'])
            : [];
        $finalYear = 2033;
        $calculationMode = $payload['calculation_mode'] ?? 'neutral';

        $body['meta'] = [
            'base_year' => $payload['base_year'] ?? null,
            'transition_years' => $transitionYears,
            'final_year' => $finalYear,
            'calculation_mode' => $calculationMode,
        ];
        $body['baseline'] = [
            'last_year_total' => $lastYearTotal,
            'last_year_taxes_paid' => $lastYearTaxes,
            'revenue_annual_total' => $annualRevenueTotal,
        ];

        foreach (['optimistic', 'conservative', 'pessimistic'] as $scenario) {
            $projection = $body['projection_2033'][$scenario] ?? [];
            $total2033 = $projection['total_tax'] ?? 0;
            $delta = $total2033 - $lastYearTotal;
            $deltaPct = $lastYearTotal > 0 ? ($delta / $lastYearTotal) * 100 : 0;
            $effectiveRate = $annualRevenueTotal > 0 ? ($total2033 / $annualRevenueTotal) * 100 : 0;

            $body['projection_2033'][$scenario]['summary'] = [
                'total_2033' => $total2033,
                'delta_vs_last_year' => $delta,
                'delta_pct_vs_last_year' => $deltaPct,
                'effective_rate_2033' => $effectiveRate,
                'ibs_2033' => $projection['ibs'] ?? 0,
                'cbs_2033' => $projection['cbs'] ?? 0,
            ];
        }

        return response()->json($body);
    }
}
