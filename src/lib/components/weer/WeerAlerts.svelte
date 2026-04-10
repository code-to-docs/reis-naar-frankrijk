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

  function alertChipClass(level: number | undefined) {
    const tone = alertTone(level);
    if (tone === "red") return "ui-chip--danger";
    if (tone === "orange" || tone === "yellow") return "ui-chip--warning";
    return "ui-chip--success";
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
    <div class="alerts-grid">
      {#if actieveOfficieleAlerts().length > 0}
        {#each actieveOfficieleAlerts() as alert}
          <a class="alert-card tone-{alertTone(alert.level)}" href={alert.url} target="_blank" rel="noreferrer">
            <div class="alert-card-top">
              <span class="alert-source">{alert.sourceLabel}</span>
              <span class={`alert-badge ui-chip ${alertChipClass(alert.level)}`}>{alert.levelLabel}</span>
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
            <span class="alert-badge ui-chip ui-chip--success">Groen</span>
          </div>
          <div class="alert-region">Geen weeralarm van kracht</div>
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
    border: 1px solid var(--border-default);
    background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-sunken) 100%);
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
    color: var(--text-secondary);
    font-weight: 700;
  }
  .alert-badge {
    min-height: 28px;
  }
  .alert-region {
    font-size: 1.02rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .alert-summary {
    font-size: 0.9rem;
    line-height: 1.35;
    color: var(--text-secondary);
    font-weight: var(--weight-semibold);
  }
  .alert-meta {
    margin-top: 7px;
    font-size: 0.77rem;
    color: var(--text-secondary);
    line-height: 1.35;
  }
  .tone-calm {
    background: linear-gradient(135deg, var(--color-success-light) 0%, var(--bg-surface) 100%);
    border-color: color-mix(in srgb, var(--color-success-base) 30%, var(--border-default));
  }
  .tone-yellow {
    background: linear-gradient(135deg, var(--color-warning-light) 0%, var(--bg-surface) 100%);
    border-color: color-mix(in srgb, var(--color-warning-base) 36%, var(--border-default));
  }
  .tone-orange {
    background: linear-gradient(135deg, color-mix(in srgb, var(--color-warning-base) 24%, var(--bg-surface)) 0%, var(--bg-surface) 100%);
    border-color: color-mix(in srgb, var(--color-warning-base) 42%, var(--border-default));
  }
  .tone-red {
    background: linear-gradient(135deg, var(--color-error-light) 0%, var(--bg-surface) 100%);
    border-color: color-mix(in srgb, var(--color-error-base) 38%, var(--border-default));
  }
  .alerts-footnote {
    margin-top: 8px;
    font-size: 0.79rem;
    color: var(--text-secondary);
    font-weight: var(--weight-semibold);
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
    background: linear-gradient(90deg, var(--bg-surface-sunken) 25%, var(--bg-surface) 50%, var(--bg-surface-sunken) 75%);
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


