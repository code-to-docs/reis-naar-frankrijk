<script lang="ts">
  import type { Alert, WeatherAlertsPayload } from "$lib/types.js";
  import { normalizeFrenchRegionName } from "$lib/utils/dashboard.js";

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

  let actieveAlerts = $derived.by(() => (alerts?.officialAlerts ?? []).filter((alert) => alert.active));
  let rustigeRegioNamen = $derived.by(() =>
    (alerts?.officialAlerts ?? []).filter((alert) => !alert.active).map((alert) => normalizeFrenchRegionName(alert.regionName))
  );
  let rustigeRegioTekst = $derived.by(() =>
    rustigeRegioNamen.length ? `Rustig volgens M\u00E9t\u00E9o-France: ${rustigeRegioNamen.join(", ")}.` : ""
  );
</script>

{#if alertsLaden}
  <div class="alerts-loading">
    <div class="alert-skeleton"></div>
    <div class="alert-skeleton"></div>
  </div>
{:else if alerts}
  <div class="alerts-panel">
    <div class="alerts-grid">
      {#if actieveAlerts.length > 0}
        {#each actieveAlerts as alert (alert.url)}
          <a class="alert-card tone-{alertTone(alert.level)}" href={alert.url} target="_blank" rel="noreferrer">
            <div class="alert-card-top">
              <span class="alert-source">{alert.sourceLabel}</span>
              <span class={`alert-badge ui-chip ${alertChipClass(alert.level)}`}>{alert.levelLabel}</span>
            </div>
            <div class="alert-region">{normalizeFrenchRegionName(alert.regionName)}</div>
            <div class="alert-summary">{formatPhenomena(alert)}</div>
            {#if alert.validUntil}
              <div class="alert-meta">Geldig tot {formatAlertMoment(alert.validUntil)}</div>
            {/if}
          </a>
        {/each}

        {#if rustigeRegioTekst}
          <a class="alert-card tone-calm" href={alerts.sources.meteoFranceUrl} target="_blank" rel="noreferrer">
            <div class="alert-card-top">
              <span class="alert-source">M&eacute;t&eacute;o-France Vigilance</span>
              <span class="alert-badge ui-chip ui-chip--success">Groen</span>
            </div>
            <div class="alert-region">Rustige regio&apos;s</div>
            <div class="alert-summary">{rustigeRegioTekst}</div>
          </a>
        {/if}
      {:else}
        <a class="alert-card tone-calm" href={alerts.sources.meteoFranceUrl} target="_blank" rel="noreferrer">
          <div class="alert-card-top">
            <span class="alert-source">M&eacute;t&eacute;o-France Vigilance</span>
            <span class="alert-badge ui-chip ui-chip--success">Groen</span>
          </div>
          <div class="alert-region">Geen weeralarm van kracht</div>
          <div class="alert-summary">Rustig volgens M&eacute;t&eacute;o-France: Loz&egrave;re, Cantal, Ari&egrave;ge.</div>
          {#if alerts.officialAlerts[0]?.updatedAt}
            <div class="alert-meta">Bijgewerkt {formatAlertMoment(alerts.officialAlerts[0].updatedAt)}</div>
          {/if}
        </a>
      {/if}
    </div>
  </div>
{:else if alertsFout}
  <div class="alerts-error">{alertsFout}</div>
{/if}

<style>
  .alerts-panel {
    margin-bottom: var(--space-3);
  }
  .alerts-grid {
    display: grid;
    gap: var(--space-2-5);
    grid-template-columns: 1fr;
  }
  .alert-card {
    display: block;
    text-decoration: none;
    color: inherit;
    border-radius: var(--radius-xl);
    padding: var(--space-3);
    border: 1px solid var(--border-default);
    background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-sunken) 100%);
    box-shadow: var(--shadow-md);
  }
  .alert-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }
  .alert-source {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    font-weight: var(--weight-bold);
  }
  .alert-badge {
    min-height: var(--ui-touch-compact);
  }
  .alert-region {
    font-size: var(--text-base);
    font-weight: var(--ui-weight-heavy);
    color: var(--text-primary);
    margin-bottom: var(--space-1);
    letter-spacing: -0.01em;
  }
  .alert-summary {
    font-size: var(--ui-text-sm);
    line-height: var(--leading-snug);
    color: var(--text-secondary);
    font-weight: var(--weight-semibold);
  }
  .alert-meta {
    margin-top: var(--space-1-5);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    line-height: var(--leading-snug);
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
  .alerts-error {
    margin-bottom: var(--space-3);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: var(--weight-semibold);
  }
  .alerts-loading {
    display: grid;
    gap: var(--space-2-5);
    margin-bottom: var(--space-3);
  }
  .alert-skeleton {
    height: 86px;
    border-radius: var(--radius-xl);
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
