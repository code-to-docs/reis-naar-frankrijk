// Haptic feedback utility voor mobiel

/**
 * @param {"light"|"medium"|"heavy"|"success"|"error"} [type]
 */
export function haptic(type = 'light') {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  /** @type {Record<"light"|"medium"|"heavy"|"success"|"error", number[]>} */
  const patterns = {
    light: [10],
    medium: [25],
    heavy: [50],
    success: [10, 50, 20],
    error: [50, 30, 50],
  };

  navigator.vibrate(patterns[type] || patterns.light);
}
