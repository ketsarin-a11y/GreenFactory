import {
  Atom, Droplet, Droplets, Factory, Flame, Fuel, type LucideIcon, Package, Recycle, Snowflake, Sun, Waves, Wind, Zap,
} from "lucide-react";

/**
 * Fixed color + icon per resource so electricity is the same blue on every chart.
 * Colors are the 8 validated categorical slots from DESIGN.md (var(--chart-N));
 * anything else folds into a neutral "other" color instead of inventing a 9th hue.
 */
const META: Record<string, { slot: number; icon: LucideIcon }> = {
  ELECTRICITY: { slot: 1, icon: Zap },
  SOLAR_ELECTRICITY: { slot: 6, icon: Sun },
  DIESEL: { slot: 2, icon: Fuel },
  TAP_WATER: { slot: 3, icon: Droplet },
  GROUNDWATER: { slot: 3, icon: Droplet },
  PROCESS_WATER: { slot: 3, icon: Droplet },
  LPG: { slot: 4, icon: Flame },
  NATURAL_GAS: { slot: 4, icon: Flame },
  DI_WATER: { slot: 5, icon: Droplets },
  RO_WATER: { slot: 5, icon: Droplets },
  COOLING_WATER: { slot: 5, icon: Droplets },
  CHILLED_WATER: { slot: 5, icon: Snowflake },
  COMPRESSED_AIR: { slot: 7, icon: Wind },
  NITROGEN: { slot: 7, icon: Atom },
  STEAM: { slot: 8, icon: Waves },
  GASOLINE: { slot: 2, icon: Fuel },
};

export const OTHER_COLOR = "var(--muted-foreground)";
export const resourceColor = (code: string) => (META[code] ? `var(--chart-${META[code].slot})` : OTHER_COLOR);
export function resourceIcon(code: string, category?: string): LucideIcon {
  if (META[code]) return META[code].icon;
  if (category === "WASTE") return Recycle;
  if (category === "PACKAGING" || category === "MATERIAL") return Package;
  return Factory;
}

/** Order resources appear in on dashboards. */
export const RESOURCE_PRIORITY = ["ELECTRICITY", "TAP_WATER", "COMPRESSED_AIR", "DI_WATER", "LPG", "DIESEL", "NATURAL_GAS", "STEAM", "NITROGEN"];
export const byPriority = (a: string, b: string) => {
  const ia = RESOURCE_PRIORITY.indexOf(a), ib = RESOURCE_PRIORITY.indexOf(b);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
};
