"use client";

import { LAYOUTS, pipCount, type LayoutId, type MonitorState } from "@/lib/gallery";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type LayoutSidebarProps = {
  monitorIndex: number;
  monitor: MonitorState;
  selectedPip: number | null;
  onLayoutChange: (layout: LayoutId) => void;
  onSelectPip: (index: number) => void;
  onSourceChange: (value: string) => void;
};

function MiniLayout({ layout, active }: { layout: LayoutId; active: boolean }) {
  const box = "bg-zinc-500";
  const wrap = cn("grid h-10 w-14 gap-px rounded-sm bg-zinc-800 p-0.5", active && "ring-1 ring-amber-400");

  if (layout === "1") return <div className={wrap}><div className={box} /></div>;
  if (layout === "4") return <div className={cn(wrap, "grid-cols-2 grid-rows-2")}>{Array.from({ length: 4 }, (_, i) => <div key={i} className={box} />)}</div>;
  if (layout === "9") return <div className={cn(wrap, "grid-cols-3 grid-rows-3")}>{Array.from({ length: 9 }, (_, i) => <div key={i} className={box} />)}</div>;
  if (layout === "16") return <div className={cn(wrap, "grid-cols-4 grid-rows-4")}>{Array.from({ length: 16 }, (_, i) => <div key={i} className={box} />)}</div>;
  if (layout === "10") {
    return (
      <div className={wrap} style={{ gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "1fr 1.4fr" }}>
        {Array.from({ length: 8 }, (_, i) => <div key={i} className={box} />)}
        <div className={cn(box, "col-span-4")} />
        <div className={cn(box, "col-span-4")} />
      </div>
    );
  }
  return (
    <div className={wrap} style={{ gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "0.7fr 1fr 1fr" }}>
      {Array.from({ length: 8 }, (_, i) => <div key={i} className={box} />)}
      <div className={cn(box, "col-span-6 row-span-2")} />
      <div className={cn(box, "col-span-2")} />
      <div className={cn(box, "col-span-2")} />
    </div>
  );
}

export function LayoutSidebar({
  monitorIndex,
  monitor,
  selectedPip,
  onLayoutChange,
  onSelectPip,
  onSourceChange,
}: LayoutSidebarProps) {
  const count = pipCount(monitor.layout);
  const sourceValue = selectedPip === null ? "" : (monitor.sources[selectedPip] ?? "");

  return (
    <aside className="flex h-full w-full flex-col gap-4 overflow-y-auto border-l border-border bg-card p-4 md:w-80">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Selected monitor</p>
        <h2 className="text-lg font-semibold">Monitor {monitorIndex + 1}</h2>
      </div>
      <div className="space-y-2">
        <Label>Layout</Label>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUTS.map((layout) => {
            const active = monitor.layout === layout.id;
            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => onLayoutChange(layout.id)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-md border p-2 text-left text-xs",
                  active ? "border-amber-400 bg-amber-400/10" : "border-border hover:bg-muted",
                )}
              >
                <MiniLayout layout={layout.id} active={active} />
                <span className="font-medium">{layout.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] leading-4 text-muted-foreground">
          10-way: 8 small on top, 2 large below. 13-way: 8 small on top, large left, 4 small on the right.
        </p>
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>Pips</Label>
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectPip(index)}
              className={cn(
                "rounded border px-1 py-1 font-mono text-[10px]",
                selectedPip === index ? "border-amber-400 bg-amber-400/10" : "border-border",
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      {selectedPip === null ? (
        <p className="text-sm text-muted-foreground">Select a pip on the monitor to name its source.</p>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="source-name">Source for pip {selectedPip + 1}</Label>
          <Input
            id="source-name"
            autoFocus
            value={sourceValue}
            placeholder="e.g. CAM 1, EVS A, PGM"
            onChange={(event) => onSourceChange(event.target.value)}
          />
        </div>
      )}
    </aside>
  );
}