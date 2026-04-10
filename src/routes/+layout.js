import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
import { browser } from "$app/environment";

export const ssr = false;

if (browser) {
  injectSpeedInsights();
}
