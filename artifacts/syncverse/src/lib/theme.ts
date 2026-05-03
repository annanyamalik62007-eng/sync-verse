import type { CommunityZone } from "@workspace/api-client-react";

export const SV_HOT = "#FF00C8";
export const SV_CYAN = "#00E5FF";
export const SV_ACID = "#DBFF00";
export const SV_GREEN = "#00FF95";
export const SV_INK = "#0A0A0F";
export const SV_GRID = "#1a1a22";

export const ZONE_HUE: Record<CommunityZone, string> = {
  career: "#FFB800",
  startup: SV_HOT,
  study: SV_CYAN,
  social: "#FF6B9D",
  creative: SV_GREEN,
  fitness: SV_ACID,
  research: "#A78BFA",
};

export const ZONE_ROTATION: string[] = [SV_HOT, SV_CYAN, SV_ACID, SV_GREEN];

export function accentByIndex(i: number): string {
  return ZONE_ROTATION[i % ZONE_ROTATION.length]!;
}
