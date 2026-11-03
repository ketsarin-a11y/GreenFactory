import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 767px)";

const subscribe = (cb: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
};

export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
