<script>
  import { activePagina } from '$lib/stores.js';
  const paginas = [
    { id: 'home',     emoji: '🏠', label: 'Home' },
    { id: 'campings', emoji: '🏕️', label: 'Campings' },
    { id: 'poi',      emoji: '📍', label: 'POIs' },
    { id: 'budget',   emoji: '💰', label: 'Budget' },
    { id: 'meer',     emoji: '☰',  label: 'Meer' },
  ];
</script>

<nav class="nav-bar">
  {#each paginas as p}
    <button class="nav-item" class:active={$activePagina === p.id}
      onclick={() => activePagina.set(p.id)}>
      <span class="emoji">{p.emoji}</span>{p.label}
    </button>
  {/each}
</nav>
