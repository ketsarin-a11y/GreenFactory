import {
  Boxes,
  Factory,
  Leaf,
  Ruler,
  Waves,
  Zap,
} from "lucide-react";
import { toneConfig } from "./config";
import type { MasterItem } from "./types";

const iconMap = {
  machine: Factory,
  sensor: Waves,
  resource: Zap,
  category: Boxes,
  unit: Ruler,
  emission: Leaf,
};

export default function MasterItemIcon({
  item,
  type,
  large = false,
}: {
  item: MasterItem;
  type: keyof typeof iconMap;
  large?: boolean;
}) {
  const Icon = iconMap[type];
  const tone = toneConfig[item.tone];

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ${tone.bg} ${tone.text} ${
        large ? "h-14 w-14" : "h-9 w-9"
      }`}
    >
      <Icon className={large ? "h-6 w-6" : "h-4 w-4"} />
    </span>
  );
}
