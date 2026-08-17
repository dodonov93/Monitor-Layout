"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileDown, LogOut, Shield } from "lucide-react";
import { LayoutSidebar } from "@/components/layout-sidebar";
import { MonitorWall } from "@/components/monitor-wall";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import {
  emptyGallery,
  GALLERIES,
  normalizeMonitor,
  parseGalleryState,
  type GalleryId,
  type GalleryState,
  type LayoutId,
} from "@/lib/gallery";

type GalleryWorkspaceProps = {
  isAdmin: boolean;
  userEmail: string;
};

export function GalleryWorkspace({ isAdmin, userEmail }: GalleryWorkspaceProps) {
  const router = useRouter();
  const [galleryId, setGalleryId] = useState<GalleryId>("pcr-1");
  const [state, setState] = useState<GalleryState>(emptyGallery());
  const [selectedMonitor, setSelectedMonitor] = useState<number | null>(null);
  const [selectedPip, setSelectedPip] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const galleryLabel = useMemo(
    () => GALLERIES.find((gallery) => gallery.id === galleryId)?.label ?? galleryId,
    [galleryId],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch(`/api/layouts?gallery=${galleryId}`);
      if (!response.ok || cancelled) return;
      const data = parseGalleryState(JSON.stringify(await response.json()));
      if (!cancelled) {
        setState(data);
        setSelectedMonitor(null);
        setSelectedPip(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [galleryId]);

  async function persist(next: GalleryState) {
    setState(next);
    setSaving(true);
    await fetch("/api/layouts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ galleryId, monitors: next.monitors }),
    });
    setSaving(false);
  }

  function updateMonitor(index: number, updater: (monitor: GalleryState["monitors"][number]) => GalleryState["monitors"][number]) {
    const next = {
      monitors: state.monitors.map((monitor, monitorIndex) =>
        monitorIndex === index ? normalizeMonitor(updater(monitor)) : monitor,
      ),
    };
    void persist(next);
  }

  async function generatePdf() {
    const node = document.getElementById("gallery-export");
    if (!node) return;
    setPdfBusy(true);
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(node, {
      backgroundColor: "#09090b",
      scale: 2,
      useCORS: true,
    });
    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a3" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 28;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(`Monitor Layout — ${galleryLabel}`, margin, 32);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(userEmail, margin, 48);
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - 72;
    const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const width = canvas.width * ratio;
    const height = canvas.height * ratio;
    pdf.addImage(image, "PNG", (pageWidth - width) / 2, 60, width, height);
    pdf.save(`${galleryLabel.replaceAll(" ", "-").toLowerCase()}-layout.pdf`);
    setPdfBusy(false);
  }

  const selected = selectedMonitor === null ? null : state.monitors[selectedMonitor];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Monitor Layout</p>
          <h1 className="text-lg font-semibold">{galleryLabel}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{saving ? "Saving..." : userEmail}</span>
          <Button variant="secondary" onClick={() => void generatePdf()} disabled={pdfBusy}>
            <FileDown />
            {pdfBusy ? "Generating..." : "Generate PDF"}
          </Button>
          {isAdmin ? (
            <Button variant="outline" onClick={() => router.push("/admin")}>
              <Shield />
              Admin
            </Button>
          ) : null}
          <Button
            variant="ghost"
            onClick={async () => {
              await authClient.signOut();
              router.push("/login");
              router.refresh();
            }}
          >
            <LogOut />
            Sign out
          </Button>
        </div>
      </header>
      <div className="border-b border-border px-4 py-2">
        <Tabs value={galleryId} onValueChange={(value) => setGalleryId(value as GalleryId)}>
          <TabsList className="h-auto flex-wrap">
            {GALLERIES.map((gallery) => (
              <TabsTrigger key={gallery.id} value={gallery.id}>
                {gallery.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-auto p-3">
          <MonitorWall
            monitors={state.monitors}
            selectedMonitor={selectedMonitor}
            selectedPip={selectedPip}
            onSelectMonitor={(index) => {
              setSelectedMonitor(index);
              setSelectedPip(null);
            }}
            onSelectPip={setSelectedPip}
          />
        </div>
        {selected && selectedMonitor !== null ? (
          <LayoutSidebar
            monitorIndex={selectedMonitor}
            monitor={selected}
            selectedPip={selectedPip}
            onLayoutChange={(layout: LayoutId) => {
              updateMonitor(selectedMonitor, (monitor) => ({ ...monitor, layout }));
              setSelectedPip(null);
            }}
            onSelectPip={setSelectedPip}
            onSourceChange={(value) => {
              if (selectedPip === null) return;
              updateMonitor(selectedMonitor, (monitor) => {
                const sources = [...monitor.sources];
                sources[selectedPip] = value;
                return { ...monitor, sources };
              });
            }}
          />
        ) : (
          <aside className="hidden w-72 items-center justify-center border-l border-border p-6 text-sm text-muted-foreground md:flex">
            Select a monitor to choose its layout and name each pip source.
          </aside>
        )}
      </div>
    </div>
  );
}