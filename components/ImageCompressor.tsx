"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { UploadIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon, DownloadIcon } from "@/components/icons";
import { compressImage, validateImageFile, formatSize } from "@/lib/compressor";
import type { CompressResult } from "@/lib/compressor";
import type { Preset } from "@/config/presets";
import { trackEvent, trackCompressionResult } from "@/lib/analytics";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OriginalInfo {
  name: string;
  bytes: number;
  width: number;
  height: number;
  objectUrl: string;
}

interface ResultInfo {
  bytes: number;
  width: number;
  height: number;
  objectUrl: string;
  qualityUsed?: number;
  filename: string;
}

type UIState =
  | { phase: "idle" }
  | { phase: "compressing" }
  | { phase: "done";          original: OriginalInfo; result: ResultInfo }
  | { phase: "already_small"; original: OriginalInfo; result: ResultInfo }
  | { phase: "error";         message: string }
  | { phase: "impossible";    message: string; smallestKB?: string };

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(0);
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ─── Animated progress bar ────────────────────────────────────────────────────
function CompressingState() {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    // Simulate binary-search progress: fast start, asymptotic approach to 92%
    const intervals = [
      { delay: 0,    value: 20 },
      { delay: 300,  value: 38 },
      { delay: 700,  value: 54 },
      { delay: 1200, value: 67 },
      { delay: 1800, value: 78 },
      { delay: 2500, value: 85 },
      { delay: 3500, value: 91 },
    ];
    const timers = intervals.map(({ delay, value }) =>
      setTimeout(() => setProgress(value), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="rounded-2xl border p-10 text-center"
      style={{ background: "#ffffff", borderColor: "#e4e4df" }}>
      {/* Circular spinner */}
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "#d1fae5" }}>
        <svg className="h-7 w-7 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="#d1fae5" strokeWidth="3" />
          <path d="M12 2a10 10 0 0110 10" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      <p className="font-semibold text-sm mb-1" style={{ color: "#18181b" }}>
        Compressing…
      </p>
      <p className="text-xs mb-5" style={{ color: "#a1a1aa" }}>
        Binary-search quality pass · nothing leaves your device
      </p>

      {/* Shimmer progress bar */}
      <div className="mx-auto w-full max-w-xs rounded-full overflow-hidden h-2"
        style={{ background: "#f4f4f5" }}>
        <div
          className="h-2 rounded-full shimmer-bar transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs tabular-nums" style={{ color: "#a1a1aa" }}>
        {progress}%
      </p>
    </div>
  );
}

// ─── Animated size display ────────────────────────────────────────────────────
function AnimatedKB({ bytes }: { bytes: number }) {
  const kb = bytes / 1024;
  const isMB = bytes >= 1024 * 1024;
  const target = isMB ? parseFloat((bytes / (1024 * 1024)).toFixed(2)) * 100 : Math.round(kb * 10);
  const animated = useCountUp(target, 550);
  const display = isMB
    ? `${(animated / 100).toFixed(2)} MB`
    : `${(animated / 10).toFixed(1)} KB`;
  return <span className="animate-count-pop tabular-nums">{display}</span>;
}

// ─── Download button with checkmark flash ────────────────────────────────────
function DownloadButton({
  href, filename, onDownload,
}: { href: string; filename: string; onDownload: () => void }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    onDownload();
    setClicked(true);
    setTimeout(() => setClicked(false), 2200);
  };

  return (
    <a
      href={href}
      download={filename}
      onClick={handleClick}
      className="btn-download flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
      style={{ background: clicked ? "#065f46" : "#059669" }}
    >
      {clicked ? (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline
              points="20 6 9 17 4 12"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: 0,
                animation: "check-draw 0.35s ease forwards",
              }}
            />
          </svg>
          Saved!
        </>
      ) : (
        <>
          <DownloadIcon size={16} aria-hidden="true" />
          DownloadIcon {filename}
        </>
      )}
    </a>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNaturalDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth,  height: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ width: 0, height: 0 }); };
    img.src = url;
  });
}

function cleanupState(state: UIState) {
  if (state.phase === "done" || state.phase === "already_small") {
    URL.revokeObjectURL(state.original.objectUrl);
    URL.revokeObjectURL(state.result.objectUrl);
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  preset?: Preset;
  defaultManualKB?: number;
}

export default function ImageCompressor({ preset, defaultManualKB = 100 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ui, setUi]       = useState<UIState>({ phase: "idle" });
  const uiRef             = useRef<UIState>(ui);
  uiRef.current = ui;
  const [manualKB, setManualKB] = useState<number>(defaultManualKB);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (file: File) => {
    cleanupState(uiRef.current);

    const validationError = validateImageFile(file);
    if (validationError) { setUi({ phase: "error", message: validationError }); return; }

    const { width: origW, height: origH } = await getNaturalDimensions(file);
    const originalInfo: OriginalInfo = {
      name: file.name, bytes: file.size,
      width: origW, height: origH,
      objectUrl: URL.createObjectURL(file),
    };

    setUi({ phase: "compressing" });

    const presetId = preset?.id ?? "manual";
    const targetKB = preset?.targetSizeKB ?? preset?.maxSizeKB ?? manualKB;
    const maxKB    = preset?.maxSizeKB    ?? manualKB;
    trackEvent("compress_start", { preset: presetId, target_kb: targetKB });

    let result: CompressResult;
    try {
      result = await compressImage(file, {
        maxSizeKB: maxKB, targetSizeKB: targetKB,
        width: preset?.width, height: preset?.height,
        cropMode: preset?.cropMode ?? "cover",
      });
    } catch (err: unknown) {
      URL.revokeObjectURL(originalInfo.objectUrl);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during compression.";
      trackCompressionResult(presetId, targetKB, "error", { reason: msg.slice(0, 100) });
      setUi({ phase: "error", message: msg });
      return;
    }

    const outputFilename = `${preset?.filename ?? "compressed-image"}.jpg`;

    if (result.status === "error") {
      URL.revokeObjectURL(originalInfo.objectUrl);
      trackCompressionResult(presetId, targetKB, "error", { reason: result.reason.slice(0, 100) });
      setUi({ phase: "error", message: result.reason });
      return;
    }

    if (result.status === "impossible") {
      URL.revokeObjectURL(originalInfo.objectUrl);
      trackCompressionResult(presetId, targetKB, "impossible");
      setUi({ phase: "impossible", message: result.reason,
        smallestKB: result.smallestBytes ? formatSize(result.smallestBytes) : undefined });
      return;
    }

    const outputKB = Math.round(result.outputBytes / 1024);
    if (result.status === "already_small") {
      trackCompressionResult(presetId, targetKB, "already_small", { output_kb: outputKB });
    } else {
      trackCompressionResult(presetId, targetKB, "success", {
        output_kb: outputKB,
        quality_pct: result.status === "success" ? Math.round(result.qualityUsed * 100) : undefined,
      });
    }

    const resultInfo: ResultInfo = {
      bytes: result.outputBytes, width: result.outputWidth, height: result.outputHeight,
      objectUrl: URL.createObjectURL(result.blob),
      qualityUsed: result.status === "success" ? result.qualityUsed : undefined,
      filename: outputFilename,
    };

    setUi({
      phase: result.status === "already_small" ? "already_small" : "done",
      original: originalInfo, result: resultInfo,
    });
  }, [preset, manualKB]);

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };
  const handleReset = () => { cleanupState(uiRef.current); setUi({ phase: "idle" }); };

  const targetLabel = preset ? `Max ${preset.maxSizeKB} KB` : `Max ${manualKB} KB`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">

      {/* Manual KB input */}
      {!preset && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border p-4"
          style={{ background: "#ffffff", borderColor: "#e4e4df" }}>
          <label htmlFor="manual-kb" className="text-sm font-semibold whitespace-nowrap"
            style={{ color: "#18181b" }}>
            Target size (KB)
          </label>
          <input
            id="manual-kb" type="number" min={1} max={10240} value={manualKB}
            onChange={(e) => setManualKB(Math.max(1, Number(e.target.value)))}
            className="w-28 rounded-lg border px-3 py-1.5 text-sm font-medium tabular-nums"
            style={{ borderColor: "#d4d4d8", color: "#18181b",
              outline: "none", background: "#fafaf8" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#059669";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.15)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "#d4d4d8";
              e.currentTarget.style.boxShadow = "none"; }}
          />
          <span className="text-xs" style={{ color: "#a1a1aa" }}>
            Output will never exceed this value
          </span>
        </div>
      )}

      {/* Drop zone */}
      {(ui.phase === "idle" || ui.phase === "error" || ui.phase === "impossible") && (
        <div
          role="button" tabIndex={0} aria-label="Upload image"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            isDragging ? "dropzone-drag" : "dropzone-idle"
          }`}
        >
          {/* Floating upload icon */}
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            isDragging ? "" : "animate-float"
          }`}
            style={{ background: isDragging ? "#d1fae5" : "#f0fdf4" }}>
          <UploadIcon size={26} color={isDragging ? "#059669" : "#6ee7b7"} strokeWidth={1.8} />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: "#18181b" }}>
              Drop your image here, or{" "}
              <span style={{ color: "#059669", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                browse
              </span>
            </p>
            <p className="mt-1 text-xs" style={{ color: "#a1a1aa" }}>
              JPG, PNG or WebP · {targetLabel}
            </p>
          </div>

          <input ref={fileInputRef} type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="sr-only" onChange={handleFileChange} aria-label="Select image file" />
        </div>
      )}

      {/* Error */}
      {ui.phase === "error" && (
        <div className="rounded-xl border p-4 flex gap-3"
          style={{ background: "#fff1f2", borderColor: "#fecdd3" }}>
          <XCircleIcon size={18} color="#e11d48" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#be123c" }}>Error</p>
            <p className="mt-0.5 text-sm" style={{ color: "#e11d48" }}>{ui.message}</p>
            <button onClick={handleReset}
              className="mt-2 text-xs font-medium underline underline-offset-2"
              style={{ color: "#be123c" }}>
              Try another file
            </button>
          </div>
        </div>
      )}

      {/* Impossible */}
      {ui.phase === "impossible" && (
        <div className="rounded-xl border p-4 flex gap-3"
          style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
          <AlertTriangleIcon size={18} color="#d97706" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#92400e" }}>Target too small</p>
            <p className="mt-0.5 text-sm" style={{ color: "#b45309" }}>{ui.message}</p>
            <button onClick={handleReset}
              className="mt-2 text-xs font-medium underline underline-offset-2"
              style={{ color: "#92400e" }}>
              Try a different image or larger target
            </button>
          </div>
        </div>
      )}

      {/* Compressing — animated progress */}
      {ui.phase === "compressing" && <CompressingState />}

      {/* Done / Already-small */}
      {(ui.phase === "done" || ui.phase === "already_small") && (
        <div className="space-y-4 animate-fade-up">

          {/* Before / After */}
          <div className="grid grid-cols-2 gap-4">
            {/* Before */}
            <div className="rounded-2xl border p-4 space-y-3"
              style={{ background: "#ffffff", borderColor: "#e4e4df" }}>
              <p className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#a1a1aa" }}>Before</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ui.original.objectUrl} alt="Original image"
                className="w-full rounded-xl object-cover aspect-square"
                style={{ background: "#f4f4f5" }} />
              <div className="space-y-0.5 text-xs" style={{ color: "#52525b" }}>
                <p className="font-semibold truncate" style={{ color: "#18181b" }}>
                  {ui.original.name}
                </p>
                <p className="tabular-nums font-medium">
                  <AnimatedKB bytes={ui.original.bytes} />
                </p>
                <p style={{ color: "#a1a1aa" }}>
                  {ui.original.width}×{ui.original.height} px
                </p>
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border p-4 space-y-3"
              style={{ background: "#f0fdf4", borderColor: "#6ee7b7" }}>
              <p className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#059669" }}>
                {ui.phase === "already_small" ? "Already fits ✓" : "After"}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ui.result.objectUrl} alt="Compressed image"
                className="w-full rounded-xl object-cover aspect-square"
                style={{ background: "#d1fae5" }} />
              <div className="space-y-0.5 text-xs" style={{ color: "#52525b" }}>
                <p className="font-bold tabular-nums" style={{ color: "#059669" }}>
                  <AnimatedKB bytes={ui.result.bytes} />
                  {ui.phase === "already_small" && (
                    <span className="ml-1 font-normal text-xs" style={{ color: "#34d399" }}>
                      (unchanged)
                    </span>
                  )}
                </p>
                <p style={{ color: "#a1a1aa" }}>
                  {ui.result.width}×{ui.result.height} px
                </p>
                {ui.result.qualityUsed !== undefined && (
                  <p style={{ color: "#a1a1aa" }}>
                    Quality: {(ui.result.qualityUsed * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Savings banner */}
          {ui.phase === "done" && (
            <div className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #059669, #0891b2)" }}>
              <CheckCircleIcon size={16} aria-hidden="true" />
              Saved {formatSize(ui.original.bytes - ui.result.bytes)} (
              {Math.round((1 - ui.result.bytes / ui.original.bytes) * 100)}% smaller) · Output:{" "}
              <span className="underline underline-offset-2">
                {formatSize(ui.result.bytes)}
              </span>
            </div>
          )}

          {ui.phase === "already_small" && (
            <div className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0284c7, #0891b2)" }}>
              <CheckCircleIcon size={16} aria-hidden="true" />
              Image already meets the{" "}
              {preset ? `${preset.maxSizeKB} KB` : `${manualKB} KB`}{" "}
              requirement — no quality loss applied
            </div>
          )}

          {/* Download */}
          <DownloadButton
            href={ui.result.objectUrl}
            filename={ui.result.filename}
            onDownload={() =>
              trackEvent("download", {
                preset: preset?.id ?? "manual",
                output_kb: Math.round(ui.result.bytes / 1024),
              })
            }
          />

          {/* Reset */}
          <button onClick={handleReset}
            className="w-full rounded-xl border px-6 py-2.5 text-sm font-medium transition-colors"
            style={{ background: "#ffffff", borderColor: "#e4e4df", color: "#52525b" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fafaf8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
          >
            Compress another image
          </button>
        </div>
      )}
    </div>
  );
}
