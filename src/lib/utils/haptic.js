// Haptic feedback utility voor mobiel

export function haptic(type = 'light') {
  if (!navigator || !navigator.vibrate) return;

  const patterns = {
    light: [10],
    medium: [25],
    heavy: [50],
    success: [10, 50, 20],
    error: [50, 30, 50],
  };

  navigator.vibrate(patterns[type] || patterns.light);
}