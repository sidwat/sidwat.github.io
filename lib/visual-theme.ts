import configuration from "./visual-theme.json";

export type VisualTheme = "web" | "galactic";
export const visualTheme = configuration.active as VisualTheme;
export function usesGalacticTheme() { return visualTheme === "galactic"; }
