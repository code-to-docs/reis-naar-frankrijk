import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import OvernachtingenTabs from './OvernachtingenTabs.svelte';

/**
 * OvernachtingenTabs.test.ts
 * Integratietest voor Svelte 5 component interactie (Runes).
 */

describe('OvernachtingenTabs', () => {
  it('toont de juiste aantallen in de KPI bar', () => {
    const { getByText } = render(OvernachtingenTabs, {
      actieveWeergave: 'overzicht',
      ingeplandeCount: 5,
      shortlistCount: 3,
      onChange: () => {}
    });

    expect(getByText('5 geplande nachten')).toBeInTheDocument();
    expect(getByText('3 shortlist locaties')).toBeInTheDocument();
  });

  it('roept onChange aan bij het klikken op een tab', async () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(OvernachtingenTabs, {
      actieveWeergave: 'overzicht',
      ingeplandeCount: 0,
      shortlistCount: 0,
      onChange: handleChange
    });

    const kalenderTab = getByLabelText('Toon kalender');
    await fireEvent.click(kalenderTab);

    expect(handleChange).toHaveBeenCalledWith('kalender');
  });

  it('markeert de actieve tab met de juiste class', () => {
    const { getByLabelText } = render(OvernachtingenTabs, {
      actieveWeergave: 'kalender',
      ingeplandeCount: 0,
      shortlistCount: 0,
      onChange: () => {}
    });

    const kalenderTab = getByLabelText('Toon kalender');
    expect(kalenderTab).toHaveClass('active');
    
    const overzichtTab = getByLabelText('Toon overzicht');
    expect(overzichtTab).not.toHaveClass('active');
  });
});
