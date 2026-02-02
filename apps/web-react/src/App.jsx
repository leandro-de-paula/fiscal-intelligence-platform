import { useMemo, useState } from "react";
import "./styles.css";

const DEFAULT_POLICY_EXAMPLE = `{
  "transition_years": [2029, 2030, 2031, 2032],
  "icms_iss_reduction": {
    "2029": 0.25,
    "2030": 0.5,
    "2031": 0.75,
    "2032": 1.0
  },
  "ibs_increase": {
    "2029": 0.25,
    "2030": 0.5,
    "2031": 0.75,
    "2032": 1.0
  }
}`;

const DEFAULT_RATES_EXAMPLE = `{
  "ibs_rate": 0.175,
  "cbs_rate": 0.09
}`;

const DEFAULT_POLICY_VALUE = JSON.parse(DEFAULT_POLICY_EXAMPLE);

const INITIAL_FORM = {
  base_year: 2028,
  goods_annual: 1000000,
  services_annual: 500000,
  icms: 120000,
  iss: 30000,
  pis_cofins: 80000,
  optimistic: 0.1,
  conservative: 0.05,
  pessimistic: 0.01,
  calculation_mode: "neutral",
  policy_json: "",
  rates_json: "",
};

function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function safeParseJson(input, label, errors) {
  if (!input || !input.trim()) return undefined;
  try {
    return JSON.parse(input);
  } catch (error) {
    errors.push(`${label} JSON is invalid.`);
    return undefined;
  }
}

function LineChart({ labels, series, height = 240, formatValue }) {
  if (!labels || labels.length === 0) {
    return <div className="chart-empty">Sem dados ainda.</div>;
  }

  const { min, max } = series.reduce(
    (acc, item) => {
      item.data.forEach((value) => {
        acc.min = Math.min(acc.min, value);
        acc.max = Math.max(acc.max, value);
      });
      return acc;
    },
    { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
  );

  const padding = { top: 16, right: 16, bottom: 28, left: 44 };
  const width = 720;
  const viewHeight = height;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = viewHeight - padding.top - padding.bottom;
  const range = max - min || 1;

  const xStep = labels.length > 1 ? chartWidth / (labels.length - 1) : 0;
  const yForValue = (value) =>
    padding.top + chartHeight - ((value - min) / range) * chartHeight;

  return (
    <div className="chart-wrapper">
      <svg viewBox={`0 0 ${width} ${viewHeight}`} className="chart">
        <g className="chart-grid">
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = padding.top + chartHeight * tick;
            return (
              <line
                key={`grid-${tick}`}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
            );
          })}
        </g>
        <g className="chart-axis">
          {labels.map((label, index) => {
            const x = padding.left + index * xStep;
            return (
              <text key={label} x={x} y={viewHeight - 8} textAnchor="middle">
                {label}
              </text>
            );
          })}
          <text x={padding.left - 8} y={padding.top + 6} textAnchor="end">
            {formatNumber(max)}
          </text>
          <text
            x={padding.left - 8}
            y={padding.top + chartHeight}
            textAnchor="end"
          >
            {formatNumber(min)}
          </text>
        </g>
        {series.map((item) => {
          const path = item.data
            .map((value, index) => {
              const x = padding.left + index * xStep;
              const y = yForValue(value);
              return `${index === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");
              return (
                <g key={item.label}>
                  <path d={path} className="chart-line" stroke={item.color} />
                  {item.data.map((value, index) => {
                    const x = padding.left + index * xStep;
                    const y = yForValue(value);
                    return (
                      <circle
                        key={`${item.label}-${index}`}
                        cx={x}
                        cy={y}
                        r="3"
                        fill={item.color}
                      >
                        <title>
                          {item.label} · {labels[index]}:{" "}
                          {formatValue ? formatValue(value) : formatNumber(value)}
                        </title>
                      </circle>
                    );
                  })}
                </g>
              );
            })}
      </svg>
      <div className="chart-legend">
        {series.map((item) => (
          <div key={item.label} className="legend-item">
            <span className="legend-dot" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ labels, series, height = 240 }) {
  if (!labels || labels.length === 0) {
    return <div className="chart-empty">Sem dados ainda.</div>;
  }

  const max = Math.max(...series.map((item) => item.value), 1);
  const padding = { top: 20, right: 20, bottom: 36, left: 54 };
  const width = 640;
  const viewHeight = height;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = viewHeight - padding.top - padding.bottom;
  const barWidth = chartWidth / series.length - 24;

  return (
    <div className="chart-wrapper">
      <svg viewBox={`0 0 ${width} ${viewHeight}`} className="chart">
        <g className="chart-grid">
          {[0, 0.5, 1].map((tick) => {
            const y = padding.top + chartHeight * tick;
            return (
              <line
                key={`grid-${tick}`}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
            );
          })}
        </g>
        <g className="chart-axis">
          <text x={padding.left - 8} y={padding.top + 6} textAnchor="end">
            {formatCurrency(max)}
          </text>
          <text
            x={padding.left - 8}
            y={padding.top + chartHeight}
            textAnchor="end"
          >
            {formatCurrency(0)}
          </text>
        </g>
        {series.map((item, index) => {
          const x =
            padding.left + index * (barWidth + 24) + (barWidth < 0 ? 0 : 0);
          const barHeight = (item.value / max) * chartHeight;
          const y = padding.top + chartHeight - barHeight;
          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="8"
                fill={item.color}
              >
                <title>
                  {item.label}: {formatCurrency(item.value)}
                </title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={viewHeight - 10}
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);
  const [scenario, setScenario] = useState("conservative");

  const payload = useMemo(() => {
    const data = {
      base_year: Number(form.base_year),
      revenue: {
        goods_annual: Number(form.goods_annual),
        services_annual: Number(form.services_annual),
      },
      last_year_taxes_paid: {
        icms: Number(form.icms),
        iss: Number(form.iss),
        pis_cofins: Number(form.pis_cofins),
      },
      growth_rates: {
        optimistic: Number(form.optimistic),
        conservative: Number(form.conservative),
        pessimistic: Number(form.pessimistic),
      },
      calculation_mode: form.calculation_mode,
    };

    const parseErrors = [];
    const policyInput = form.policy_json.trim();
    const policy = policyInput
      ? safeParseJson(form.policy_json, "Policy", parseErrors)
      : DEFAULT_POLICY_VALUE;
    const rates_override = safeParseJson(
      form.rates_json,
      "Rates override",
      parseErrors
    );

    data.policy = policy;
    if (rates_override) data.rates_override = rates_override;

    return { data, errors: parseErrors };
  }, [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResponse(null);

    if (payload.errors.length) {
      setError(payload.errors.join(" "));
      return;
    }

    setLoading(true);
    try {
      const result = await fetch(
        "http://localhost:8001/api/simulations/tax-reform",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload.data),
        }
      );

      if (!result.ok) {
        throw new Error("ENGINE_UNAVAILABLE");
      }

      const json = await result.json();
      setResponse(json);
    } catch (err) {
      setError("Unable to run simulation right now.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      setError("Unable to copy to clipboard.");
    }
  };

  const totalsSeries = response?.series?.totals;
  const breakdownSeries = response?.series?.breakdown;
  const labels = response?.series?.labels ?? [];
  const lastTransition = response?.transition_2029_2032?.slice(-1)[0];
  const scenarioProjection = response?.projection_2033?.[scenario] ?? {};
  const scenarioSummary = scenarioProjection.summary ?? {};
  const baseline = response?.baseline ?? {};
  const meta = response?.meta ?? {};
  const finalYearTotal =
    scenarioSummary.total_2033 ?? scenarioProjection.total_tax ?? 0;
  const deltaVsLastYear = scenarioSummary.delta_vs_last_year ?? 0;
  const deltaPctVsLastYear = scenarioSummary.delta_pct_vs_last_year ?? 0;
  const effectiveRate2033 = scenarioSummary.effective_rate_2033 ?? 0;
  const ibs2033 = scenarioSummary.ibs_2033 ?? scenarioProjection.ibs ?? 0;
  const cbs2033 = scenarioSummary.cbs_2033 ?? scenarioProjection.cbs ?? 0;
  const annualRevenueTotal = baseline.revenue_annual_total ?? 0;
  const finalYearIndex = labels.length - 1;
  const scenarioTotals2033 = {
    optimistic: (totalsSeries?.optimistic ?? [])[finalYearIndex] ?? 0,
    conservative: (totalsSeries?.conservative ?? [])[finalYearIndex] ?? 0,
    pessimistic: (totalsSeries?.pessimistic ?? [])[finalYearIndex] ?? 0,
  };
  const totalsArray = Object.values(scenarioTotals2033);
  const maxTotal = Math.max(...totalsArray, 0);
  const minTotal = Math.min(...totalsArray, 0);
  const scenariosEqual =
    maxTotal > 0 ? (maxTotal - minTotal) / maxTotal < 0.001 : true;

  const scenarioBreakdown = useMemo(() => {
    if (!response) return [];
    const transitionRows = response.transition_2029_2032 ?? [];
    const projection = response.projection_2033?.[scenario];
    const revenueByYear =
      projection && projection.revenue_projected
        ? projection.revenue_projected
        : null;
    return [
      ...transitionRows,
      {
        year: meta.final_year ?? 2033,
        revenue_projected: revenueByYear ?? null,
        total_tax: projection?.total_tax ?? 0,
        ibs: projection?.ibs ?? 0,
        cbs: projection?.cbs ?? 0,
        icms: projection?.icms ?? 0,
        iss: projection?.iss ?? 0,
        pis_cofins: projection?.cbs ?? 0,
      },
    ];
  }, [response, scenario, meta.final_year]);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Plataforma de Inteligência Fiscal</p>
          <h1>Simulador da Reforma Tributária</h1>
          <p className="lead">
            Simule cenários de transição e compare estruturas tributárias ao
            longo dos anos.
          </p>
        </div>
        <div className="hero-card">
          <div className="meta">
            <span className="meta-label">Status</span>
            <span className="meta-value">Engine connected via Laravel</span>
          </div>
          <div className="meta">
            <span className="meta-label">Endpoint</span>
            <span className="meta-value">/api/simulations/tax-reform</span>
          </div>
          <div className="meta">
            <span className="meta-label">Mode</span>
            <span className="meta-value">
              {form.calculation_mode === "neutral"
                ? "Neutro (padrão)"
                : "Baseado em alíquota"}
            </span>
          </div>
        </div>
      </header>

      <section className="content">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Dados da Simulação</h2>
            <div className="button-row">
              <button
                type="button"
                className="ghost"
                onClick={() =>
                  copyToClipboard(JSON.stringify(payload.data, null, 2))
                }
              >
                Copiar dados
              </button>
            </div>
          </div>

          <div className="grid">
            <label>
              Ano base
              <input
                name="base_year"
                type="number"
                value={form.base_year}
                onChange={handleChange}
              />
            </label>
            <label>
              Receita de bens (anual)
              <input
                name="goods_annual"
                type="number"
                value={form.goods_annual}
                onChange={handleChange}
              />
            </label>
            <label>
              Receita de serviços (anual)
              <input
                name="services_annual"
                type="number"
                value={form.services_annual}
                onChange={handleChange}
              />
            </label>
            <label>
              ICMS pago no último ano
              <input
                name="icms"
                type="number"
                value={form.icms}
                onChange={handleChange}
              />
            </label>
            <label>
              ISS pago no último ano
              <input
                name="iss"
                type="number"
                value={form.iss}
                onChange={handleChange}
              />
            </label>
            <label>
              PIS/COFINS pagos no último ano
              <input
                name="pis_cofins"
                type="number"
                value={form.pis_cofins}
                onChange={handleChange}
              />
            </label>
            <label>
              Crescimento otimista
              <input
                name="optimistic"
                type="number"
                step="0.01"
                value={form.optimistic}
                onChange={handleChange}
              />
            </label>
            <label>
              Crescimento conservador
              <input
                name="conservative"
                type="number"
                step="0.01"
                value={form.conservative}
                onChange={handleChange}
              />
            </label>
            <label>
              Crescimento pessimista
              <input
                name="pessimistic"
                type="number"
                step="0.01"
                value={form.pessimistic}
                onChange={handleChange}
              />
            </label>
            <label>
              Modo de cálculo
              <select
                name="calculation_mode"
                value={form.calculation_mode}
                onChange={handleChange}
              >
                <option value="neutral">neutral</option>
                <option value="rate_based">rate_based</option>
              </select>
            </label>
          </div>

          <details className="advanced">
            <summary>Avançado (opcional)</summary>
            <div className="advanced-grid">
              <label>
                JSON de política
                <textarea
                  name="policy_json"
                  placeholder={DEFAULT_POLICY_EXAMPLE}
                  value={form.policy_json}
                  onChange={handleChange}
                  rows="10"
                />
              </label>
              <label>
                JSON de alíquotas personalizadas
                <textarea
                  name="rates_json"
                  placeholder={DEFAULT_RATES_EXAMPLE}
                  value={form.rates_json}
                  onChange={handleChange}
                  rows="6"
                />
              </label>
            </div>
          </details>

          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? "Executando simulação..." : "Simular"}
            </button>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}
        </form>

        <section className="panel">
          <div className="panel-header">
            <h2>Resultados</h2>
            <div className="button-row">
              <button
                type="button"
                className="ghost"
                onClick={() =>
                  copyToClipboard(
                    response ? JSON.stringify(response, null, 2) : ""
                  )
                }
              >
                Copiar resposta
              </button>
            </div>
          </div>

          {!response ? (
            <div className="empty-state">
              Execute uma simulação para visualizar os detalhes da projeção aqui.
            </div>
          ) : (
            <>
              <div className="summary">
                <div>
                  <span className="summary-label">Ano base</span>
                  <strong>{response.assumptions?.base_year}</strong>
                </div>
                <div>
                  <span className="summary-label">Anos de transição</span>
                  <strong>
                    {response.transition_2029_2032
                      ?.map((row) => row.year)
                      .join(", ")}
                  </strong>
                </div>
              </div>

              <div className="kpi-header">
                <div>
                  <h3>Indicadores principais</h3>
                  <p className="chart-desc">
                    Estimativas para 2033 com base no cenário selecionado.
                  </p>
                </div>
                <label className="kpi-select">
                  Cenário
                  <select
                    name="scenario"
                    value={scenario}
                    onChange={(event) => setScenario(event.target.value)}
                  >
                    <option value="optimistic">Otimista</option>
                    <option value="conservative">Conservador</option>
                    <option value="pessimistic">Pessimista</option>
                  </select>
                </label>
              </div>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-label">
                    Total estimado de tributos em 2033
                  </span>
                  <strong className="kpi-value">
                    {formatCurrency(finalYearTotal)}
                  </strong>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">
                    Diferença vs último ano
                  </span>
                  <strong className="kpi-value">
                    {formatCurrency(deltaVsLastYear)}
                  </strong>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Variação percentual</span>
                  <strong className="kpi-value">
                    {formatNumber(deltaPctVsLastYear)}%
                  </strong>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Alíquota efetiva em 2033</span>
                  <strong className="kpi-value">
                    {formatNumber(effectiveRate2033)}%
                  </strong>
                  <span className="kpi-note">
                    Tributos / receita anual informada
                  </span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">IBS e CBS em 2033</span>
                  <strong className="kpi-value">
                    {formatCurrency(ibs2033)} · {formatCurrency(cbs2033)}
                  </strong>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Período e ano final</span>
                  <strong className="kpi-value">
                    {meta.transition_years?.[0] ??
                      response.transition_2029_2032?.[0]?.year}{" "}
                    — {meta.transition_years?.slice(-1)[0] ??
                      lastTransition?.year}{" "}
                    · {meta.final_year ?? 2033}
                  </strong>
                </div>
              </div>

              <div className="chart-block">
                <h3>Total estimado em 2033 por cenário</h3>
                <p className="chart-desc">
                  Comparação direta entre cenários para o ano{" "}
                  {meta.final_year ?? 2033}.
                </p>
                <BarChart
                  labels={labels}
                  series={[
                    {
                      label: "Otimista",
                      value: scenarioTotals2033.optimistic,
                      color: "#0f766e",
                    },
                    {
                      label: "Conservador",
                      value: scenarioTotals2033.conservative,
                      color: "#2563eb",
                    },
                    {
                      label: "Pessimista",
                      value: scenarioTotals2033.pessimistic,
                      color: "#f97316",
                    },
                  ]}
                />
                {scenariosEqual ? (
                  <p className="chart-hint">
                    Cenários são efetivamente iguais para estes dados.
                  </p>
                ) : null}
              </div>

              <div className="chart-block">
                <h3>Composição tributária por ano (valores absolutos)</h3>
                <p className="chart-desc">
                  Valores em BRL para o cenário selecionado.
                </p>
                <LineChart
                  labels={labels}
                  series={[
                    {
                      label: "ICMS",
                      data:
                        scenario === "conservative"
                          ? breakdownSeries?.icms ?? []
                          : (scenarioBreakdown ?? []).map((row) => row.icms ?? 0),
                      color: "#0ea5e9",
                    },
                    {
                      label: "ISS",
                      data:
                        scenario === "conservative"
                          ? breakdownSeries?.iss ?? []
                          : (scenarioBreakdown ?? []).map((row) => row.iss ?? 0),
                      color: "#6366f1",
                    },
                    {
                      label: "IBS",
                      data:
                        scenario === "conservative"
                          ? breakdownSeries?.ibs ?? []
                          : (scenarioBreakdown ?? []).map((row) => row.ibs ?? 0),
                      color: "#14b8a6",
                    },
                    {
                      label: "CBS",
                      data:
                        scenario === "conservative"
                          ? breakdownSeries?.cbs ?? []
                          : (scenarioBreakdown ?? []).map((row) => row.cbs ?? 0),
                      color: "#f43f5e",
                    },
                  ]}
                  formatValue={formatCurrency}
                />
              </div>

              <div className="chart-block">
                <h3>Resumo anual por cenário selecionado</h3>
                <p className="chart-desc">
                  Receita projetada, total de tributos e principais componentes.
                </p>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ano</th>
                        <th>Receita projetada</th>
                        <th>Total de tributos</th>
                        <th>IBS</th>
                        <th>CBS</th>
                        <th>ICMS</th>
                        <th>ISS</th>
                        <th>PIS/COFINS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(scenarioBreakdown ?? []).map((row) => (
                        <tr key={row.year}>
                          <td>{row.year}</td>
                          <td>
                            {row.revenue_projected
                              ? formatCurrency(row.revenue_projected)
                              : formatCurrency(annualRevenueTotal)}
                          </td>
                          <td>{formatCurrency(row.total_tax ?? 0)}</td>
                          <td>{formatCurrency(row.ibs ?? 0)}</td>
                          <td>{formatCurrency(row.cbs ?? 0)}</td>
                          <td>{formatCurrency(row.icms ?? 0)}</td>
                          <td>{formatCurrency(row.iss ?? 0)}</td>
                          <td>{formatCurrency(row.pis_cofins ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </section>

      <footer className="footer">
        Simulador V1 — números são estimativas.
      </footer>
    </main>
  );
}
