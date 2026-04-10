/**
 * Chart color constants — these values match the --chart-1 through --chart-4
 * tokens defined in src/styles/theme.css and are the single source of truth
 * for all Recharts components.
 *
 * Recharts requires concrete color strings (not CSS variable references),
 * so we define them here and keep them in sync with theme.css manually.
 */

/** Multi-city comparison colors, matching --chart-1 … --chart-4 */
export const CHART_COLORS = [
  "hsl(199 97% 55%)", // --chart-1: primary blue
  "hsl(0 84% 60%)",   // --chart-2: rose/red
  "hsl(142 72% 45%)", // --chart-3: green
  "hsl(38 92% 50%)",  // --chart-4: amber
];

/** Perception-vs-reality chart pair: subjective (primary) / objective (muted) */
export const COLOR_SUBJECTIVE = CHART_COLORS[0];
export const COLOR_OBJECTIVE  = "hsl(198 23% 55%)"; // mid-lightness --muted-foreground hue

/** PolarGrid and tooltip border — matches --border: 200 29% 88% */
export const CHART_GRID_COLOR    = "hsl(200 29% 88%)";

/** Axis tick fill colors */
export const CHART_TICK_NORMAL   = "hsl(198 23% 31%)"; // --muted-foreground
export const CHART_TICK_MUTED    = "hsl(198 23% 60%)"; // lighter variant for de-emphasised labels
