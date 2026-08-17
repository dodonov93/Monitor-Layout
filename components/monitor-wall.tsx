"use client";

import { cn } from "@/lib/utils";
import { LAYOUTS, pipCount, type LayoutId, type MonitorState } from "@/lib/gallery";
import { MonitorScreen } from "@/components/monitor-screen";

type MonitorWallProps = {
  monitors: MonitorState[];
  selectedMonitor: number | null;
  selectedPip: number | null;
  onSelectMonitor: (index: number) => void;
  onSelectPip: (index: number) => void;
};

export function MonitorWall({
  monitors,
  selectedMonitor,
  selectedPip,
  onSelectMonitor,
  onSelectPip,
}: MonitorWallProps) {
  return (
    <div id="gallery-export" className="grid grid-cols-1 gap-3 bg-zinc-950 p-3 md:grid-cols-3 md:grid-rows-2">
      {monitors.map((monitor, index) => {
        const selected = selectedMonitor === index;
        const layoutLabel = LAYOUTS.find((item) => item.id === monitor.layout)?.label ?? monitor.layout;
        return (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => onSelectMonitor(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectMonitor(index);
              }
            }}
            className={cn(
              "flex min-h-0 cursor-pointer flex-col overflow-hidden rounded-md border-4 bg-zinc-950 text-left shadow-lg",
              selected ? "border-amber-400" : "border-zinc-700 hover:border-zinc-500",
            )}
          >
            <div className="flex items-center justify-between bg-zinc-900 px-2 py-1 font-mono text-[10px] text-zinc-400">
              <span>MON {index + 1}</span>
              <span>
                {layoutLabel} · {pipCount(monitor.layout as LayoutId)} pips
              </span>
            </div>
            <div className="aspect-video min-h-0">
              <MonitorScreen
                layout={monitor.layout}
                sources={monitor.sources}
                selectedPip={selected ? selectedPip : null}
                onSelectPip={(pipIndex) => {
                  onSelectMonitor(index);
                  onSelectPip(pipIndex);
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}