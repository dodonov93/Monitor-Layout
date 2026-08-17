import { cn } from "@/lib/utils";
import type { LayoutId } from "@/lib/gallery";

type PipProps = {
  source: string;
  selected: boolean;
  large?: boolean;
  onSelect: () => void;
};

function Pip({ source, selected, large, onSelect }: PipProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#050505] text-left",
        selected ? "ring-2 ring-amber-400 ring-inset" : "ring-1 ring-zinc-800",
      )}
    >
      <div className="flex flex-1 items-center justify-center px-1">
        <span
          className={cn(
            "text-center font-mono uppercase tracking-wider",
            source ? "text-emerald-400" : "text-zinc-600",
            large ? "text-sm md:text-xl" : "text-[9px] md:text-xs",
          )}
        >
          {source || "NO SOURCE"}
        </span>
      </div>
      <div className="flex h-3.5 shrink-0 items-center bg-black/90 px-1 font-mono text-[8px] text-zinc-500 md:h-4 md:text-[10px]">
        <span className="truncate">{source || "---"}</span>
      </div>
    </button>
  );
}

type MonitorScreenProps = {
  layout: LayoutId;
  sources: string[];
  selectedPip: number | null;
  onSelectPip: (index: number) => void;
};

export function MonitorScreen({ layout, sources, selectedPip, onSelectPip }: MonitorScreenProps) {
  const pip = (index: number, large = false) => (
    <Pip
      key={index}
      source={sources[index] ?? ""}
      selected={selectedPip === index}
      large={large}
      onSelect={() => onSelectPip(index)}
    />
  );

  if (layout === "1") {
    return <div className="grid h-full grid-cols-1">{pip(0, true)}</div>;
  }

  if (layout === "4") {
    return <div className="grid h-full grid-cols-2 grid-rows-2 gap-px bg-black">{[0, 1, 2, 3].map((i) => pip(i))}</div>;
  }

  if (layout === "9") {
    return (
      <div className="grid h-full grid-cols-3 grid-rows-3 gap-px bg-black">
        {Array.from({ length: 9 }, (_, i) => pip(i))}
      </div>
    );
  }

  if (layout === "16") {
    return (
      <div className="grid h-full grid-cols-4 grid-rows-4 gap-px bg-black">
        {Array.from({ length: 16 }, (_, i) => pip(i))}
      </div>
    );
  }

  if (layout === "10") {
    return (
      <div
        className="grid h-full gap-px bg-black"
        style={{
          gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
          gridTemplateRows: "1fr 1.7fr",
        }}
      >
        {Array.from({ length: 8 }, (_, i) => pip(i))}
        <div className="col-span-4">{pip(8, true)}</div>
        <div className="col-span-4">{pip(9, true)}</div>
      </div>
    );
  }

  return (
    <div
      className="grid h-full gap-px bg-black"
      style={{
        gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
        gridTemplateRows: "0.7fr repeat(4, minmax(0, 1fr))",
      }}
    >
      {Array.from({ length: 8 }, (_, i) => pip(i))}
      <div className="col-span-6 row-span-4">{pip(8, true)}</div>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={`right-${i}`} className="col-span-2">
          {pip(9 + i)}
        </div>
      ))}
    </div>
  );
}