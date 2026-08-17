export const GALLERIES = [
  { id: "pcr-1", label: "PCR 1" },
  { id: "pcr-2", label: "PCR 2" },
  { id: "pcr-3", label: "PCR 3" },
  { id: "pcr-4", label: "PCR 4" },
  { id: "pcr-5", label: "PCR 5" },
  { id: "pcr-34", label: "PCR 34" },
  { id: "pcr-f", label: "PCR F" },
] as const;

export type GalleryId = (typeof GALLERIES)[number]["id"];

export const LAYOUTS = [
  { id: "1", label: "1-way", pips: 1 },
  { id: "4", label: "4-way", pips: 4 },
  { id: "9", label: "9-way", pips: 9 },
  { id: "16", label: "16-way", pips: 16 },
  { id: "10", label: "10-way", pips: 10 },
  { id: "13", label: "13-way", pips: 13 },
] as const;

export type LayoutId = (typeof LAYOUTS)[number]["id"];

export type MonitorState = {
  layout: LayoutId;
  sources: string[];
};

export type GalleryState = {
  monitors: MonitorState[];
};

export function pipCount(layout: LayoutId) {
  return LAYOUTS.find((item) => item.id === layout)?.pips ?? 1;
}

export function normalizeMonitor(monitor: MonitorState): MonitorState {
  const count = pipCount(monitor.layout);
  const sources = [...monitor.sources];
  while (sources.length < count) sources.push("");
  return { layout: monitor.layout, sources: sources.slice(0, count) };
}

export function emptyMonitor(): MonitorState {
  return { layout: "1", sources: [""] };
}

export function emptyGallery(): GalleryState {
  return {
    monitors: Array.from({ length: 6 }, () => emptyMonitor()),
  };
}

export function parseGalleryState(raw: string | null | undefined): GalleryState {
  if (!raw) return emptyGallery();
  try {
    const parsed = JSON.parse(raw) as GalleryState;
    const monitors = Array.from({ length: 6 }, (_, index) => {
      const monitor = parsed.monitors?.[index];
      if (!monitor || !LAYOUTS.some((layout) => layout.id === monitor.layout)) {
        return emptyMonitor();
      }
      return normalizeMonitor(monitor);
    });
    return { monitors };
  } catch {
    return emptyGallery();
  }
}