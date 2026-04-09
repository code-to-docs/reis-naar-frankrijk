<script lang="ts">
  import { E } from "$lib/emojis.js";
  import type { Alert, WeatherAlertsPayload } from "$lib/types.js";

  interface Props {
    alerts: WeatherAlertsPayload | null;
    alertsLaden: boolean;
    alertsFout: string;
  }

  let { alerts, alertsLaden, alertsFout }: Props = $props();

  function alertTone(level: number | undefined, fallback = "green") {
    if (level === 4) return "red";
    if (level === 3) return "orange";
    if (level === 2) return "yellow";
    return fallback;
  }

  function actieveOfficieleAlerts(): Alert[] {
    return (alerts?.officialAlerts ?? []).filter((alert) => alert.active);
  }

  function rustigeRegios(): string[] {
    return (alerts?.officialAlerts ?? [])
      .filter((alert) => !alert.active)
      .map((alert) => alert.regionName);
  }

  function formatAlertMoment(isoDate: string | null | undefined) {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleString("nl-NL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function formatPhenomena(alert: Alert) {
    if (!alert.activePhenomena.length) return "Officieel weeralarm actief";
    return alert.activePhenomena.map((item) => item.label).join(" - ");
  }
</script>

{#if alertsLaden}
  <div class="alerts-loading">
    <div class="alert-skeleton"></div>
    <div class="alert-skeleton"></div>
  </div>
{:else if alerts}
  <div class="alerts-panel">
    <div class="alerts-header">
      <span>{E.WARN} Offici&#235;le alerts</span>
      <small>M&#233;t&#233;o-France voor je route</small>
    </div>

    <div class="alerts-grid">
      {#if actieveOfficieleAlerts().length > 0}
        {#each actieveOfficieleAlerts() as alert}
          <a class="alert-card tone-{alertTone(alert.level)}" href={alert.url} target="_blank" rel="noreferrer">
            <div class="alert-card-top">
              <span class="alert-source">{alert.sourceLabel}</span>
              <span class="alert-badge">{alert.levelLabel}</span>
            </div>
            <div class="alert-region">{alert.regionName}</div>
            <div class="alert-summary">{formatPhenomena(alert)}</div>
            {#if alert.validUntil}
              <div class="alert-meta">Geldig tot {formatAlertMoment(alert.validUntil)}</div>
            {/if}
          </a>
        {/each}
      {:else}
        <a class="alert-card tone-calm" href={alerts.sources.meteoFranceUrl} target="_blank" rel="noreferrer">
          <div class="alert-card-top">
            <span class="alert-source">M&#233;t&#233;o-France Vigilance</span>
            <span class="alert-badge">Groen</span>
          </div>
          <div class="alert-region">Route rustig</div>
          <div class="alert-summary">Loz&#232;re, Cantal en Ari&#232;ge staan nu op groen.</div>
          {#if alerts.officialAlerts[0]?.updatedAt}
            <div class="alert-meta">Bijgewerkt {formatAlertMoment(alerts.officialAlerts[0].updatedAt)}</div>
          {/if}
        </a>
      {/if}
    </div>

    {#if actieveOfficieleAlerts().length > 0 && rustigeRegios().length > 0}
      <div class="alerts-footnote">Rustig volgens M&#233;t&#233;o-France: {rustigeRegios().join(", ")}.</div>
    {/if}
  </div>
{:else if alertsFout}
  <div class="alerts-footnote alerts-footnote-error">{alertsFout}</div>
{/if}

<style>
  .alerts-panel {
    margin-bottom: 12px;
  }
  .alerts-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .alerts-header span {
    font-size: 1rem;
    font-weight: 800;
    color: #10233a;
    letter-spacing: -0.01em;
  }
  .alerts-header small {
    font-size: 0.78rem;
    color: #64748b;
    font-weight: 600;
  }
  .alerts-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr;
  }
  .alert-card {
    display: block;
    text-decoration: none;
    color: inherit;
    border-radius: 16px;
    padding: 12px 12px 11px;
    border: 1px solid #dbe7f3;
    background: linear-gradient(135deg, #f8fbff 0%, #f3f7fd 100%);
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
  }
  .alert-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .alert-source {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #5b6f89;
    font-weight: 700;
  }
  .alert-badge {
    font-size: 0.75rem;
    font-weight: 800;
    border-radius: 999px;
    padding: 4px 9px;
    background: rgba(15, 77, 132, 0.08);
    color: #0f4d84;
    white-space: nowrap;
  }
  .alert-region {
    font-size: 1.02rem;
    font-weight: 800;
    color: #10233a;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .alert-summary {
    font-size: 0.9rem;
    line-height: 1.35;
    color: #21364e;
    font-weight: 600;
  }
  .alert-meta {
    margin-top: 7px;
    font-size: 0.77rem;
    color: #5f738c;
    line-height: 1.35;
  }
  .tone-calm {
    background: linear-gradient(135deg, #eff9f3 0%, #f7fcf8 100%);
    border-color: #cfe9d9;
  }
  .tone-calm .alert-badge {
    background: rgba(31, 169, 104, 0.12);
    color: #1a7f4f;
  }
  .tone-yellow {
    background: linear-gradient(135deg, #fff8dd 0%, #fffdf1 100%);
    border-color: #f1de92;
  }
  .tone-yellow .alert-badge {
    background: rgba(212, 172, 13, 0.16);
    color: #8b6a00;
  }
  .tone-orange {
    background: linear-gradient(135deg, #fff0e2 0%, #fff7f1 100%);
    border-color: #f3c59a;
  }
  .tone-orange .alert-badge {
    background: rgba(225, 120, 31, 0.16);
    color: #a55311;
  }
  .tone-red {
    background: linear-gradient(135deg, #ffe6e5 0%, #fff3f2 100%);
    border-color: #f0b0ab;
  }
  .tone-red .alert-badge {
    background: rgba(221, 75, 57, 0.15);
    color: #9f2f22;
  }
  .alerts-footnote {
    margin-top: 8px;
    font-size: 0.79rem;
    color: #64748b;
    font-weight: 600;
  }
  .alerts-footnote-error {
    margin-bottom: 12px;
  }
  .alerts-loading {
    display: grid;
    gap: 10px;
    margin-bottom: 12px;
  }
  .alert-skeleton {
    height: 86px;
    border-radius: 16px;
    background: linear-gradient(90deg, #eff4fa 25%, #f8fbff 50%, #eff4fa 75%);
    background-size: 200% 100%;
    animation: alertShimmer 1.3s infinite linear;
  }
  @keyframes alertShimmer {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }
</style>
