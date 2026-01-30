<?php

use App\Http\Controllers\TaxReformController;
use Illuminate\Support\Facades\Route;

Route::post('/simulations/tax-reform', [TaxReformController::class, 'simulate']);
Route::post('/ping', fn () => response()->json(['ok' => true]));

