"use client";

import { useRef, useState, useCallback } from "react";
import { compressImage, validateImageFile, formatSize } from "@/lib/compressor";
import type { CompressResult } from "@/lib/compressor";
import type { Preset } from "@/config/presets";

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
  qualityUsed?: number; // undefined for already_small
  filename: string;
}

type UIState =
  | { phase: "idle" }
  | { phase: "compressing" }
  | { phase: "done"; original: OriginalInfo; result: ResultInfo }
  | { phase: "already_small"; original: OriginalInfo; result: ResultInfo }
  | { phase: "error"; message: string }
  | { phase: "impossible"; message: string; smallestKB?: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNaturalDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
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
  /**
   * If no preset is provided the user can type a manual KB target.
   * The manual target defaults to this value.
   */
  defaultManualKB?: number;
}

export default function ImageCompressor({ preset, defaultManualKB = 100 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ui, setUi] = useState<UIState>({ phase: "idle" });
  // Keep a ref to ui so processFile always reads current state without
  // needing ui in its dependency array (avoids stale-closure re-creation).
  const uiRef = useRef<UIState>(ui);
  uiRef.current = ui;

  const [manualKB, setManualKB] = useState<number>(defaultManualKB);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      // Clean up object URLs from any previous result.
      cleanupState(uiRef.current);

      // Validate
      const validationError = validateImageFile(file);
      if (validationError) {
        setUi({ phase: "error", message: validationError });
        return;
      }

      // Get original dimensions for the before-card
      const { width: origW, height: origH } = await getNaturalDimensions(file);
      const originalInfo: OriginalInfo = {
        name: file.name,
        bytes: file.size,
        width: origW,
        height: origH,
        objectUrl: URL.createObjectURL(file),
      };

      setUi({ phase: "compressing" });


      // Build options from preset or manual input
      const targetKB = preset?.targetSizeKB ?? preset?.maxSizeKB ?? manualKB;
      const maxKB = preset?.maxSizeKB ?? manualKB;

      let result: CompressResult;
      try {
        result = await compressImage(file, {
          maxSizeKB: maxKB,
          targetSizeKB: targetKB,
          width: preset?.width,
          height: preset?.height,
          cropMode: preset?.cropMode ?? "cover",
        });
      } catch (err: unknown) {
        URL.revokeObjectURL(originalInfo.objectUrl);
        setUi({
          phase: "error",
          message:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred during compression.",
        });
        return;
      }

      const outputFilename = `${preset?.filename ?? "compressed-image"}.jpg`;

      if (result.status === "error") {
        URL.revokeObjectURL(originalInfo.objectUrl);
        setUi({ phase: "error", message: result.reason });
        return;
      }

      if (result.status === "impossible") {
        URL.revokeObjectURL(originalInfo.objectUrl);
        setUi({
          phase: "impossible",
          message: result.reason,
          smallestKB: result.smallestBytes
            ? formatSize(result.smallestBytes)
            : undefined,
        });
        return;
      }

      const resultInfo: ResultInfo = {
        bytes: result.outputBytes,
        width: result.outputWidth,
        height: result.outputHeight,
        objectUrl: URL.createObjectURL(result.blob),
        qualityUsed:
          result.status === "success" ? result.qualityUsed : undefined,
        filename: outputFilename,
      };

      setUi({
        phase: result.status === "already_small" ? "already_small" : "done",
        original: originalInfo,
        result: resultInfo,
      });
    },
    [preset, manualKB]
  );

  // ── Event handlers ──────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so the same file can be re-selected after a reset.
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    cleanupState(uiRef.current);
    setUi({ phase: "idle" });
  };

  // ── Render helpers ──────────────────────────────────────────────────────

  const targetLabel = preset
    ? `Max ${preset.maxSizeKB} KB`
    : `Max ${manualKB} KB`;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Manual KB input (shown only when no preset) */}
      {!preset && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4">
          <label
            htmlFor="manual-kb"
            className="text-sm font-medium text-zinc-700 whitespace-nowrap"
          >
            Target size (KB)
          </label>
          <input
            id="manual-kb"
            type="number"
            min={1}
            max={10240}
            value={manualKB}
            onChange={(e) => setManualKB(Math.max(1, Number(e.target.value)))}
            className="w-28 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <span className="text-xs text-zinc-400">
            Output will never exceed this value
          </span>
        </div>
      )}

      {/* Drop zone / upload trigger */}
      {(ui.phase === "idle" || ui.phase === "error" || ui.phase === "impossible") && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-colors ${
            isDragging
              ? "border-emerald-400 bg-emerald-50"
              : "border-zinc-300 bg-zinc-50 hover:border-emerald-400 hover:bg-emerald-50"
          }`}
        >
          <svg
            className="h-10 w-10 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-700">
              Drop your image here, or{" "}
              <span className="text-emerald-600 underline underline-offset-2">
                browse
              </span>
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              JPG, PNG or WebP · {targetLabel}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Select image file"
          />
        </div>
      )}

      {/* Error state */}
      {ui.phase === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">⚠ Error</p>
          <p className="mt-1 text-sm text-red-600">{ui.message}</p>
          <button
            onClick={handleReset}
            className="mt-3 text-xs font-medium text-red-700 underline hover:no-underline"
          >
            Try another file
          </button>
        </div>
      )}

      {/* Impossible state */}
      {ui.phase === "impossible" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            ⚠ Target too small
          </p>
          <p className="mt-1 text-sm text-amber-700">{ui.message}</p>
          <button
            onClick={handleReset}
            className="mt-3 text-xs font-medium text-amber-800 underline hover:no-underline"
          >
            Try a different image or larger target
          </button>
        </div>
      )}

      {/* Compressing spinner */}
      {ui.phase === "compressing" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-10">
          <svg
            className="h-8 w-8 animate-spin text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-sm font-medium text-zinc-600">
            Compressing… this takes a few seconds
          </p>
          <p className="text-xs text-zinc-400">
            Everything runs in your browser — nothing is uploaded
          </p>
        </div>
      )}

      {/* Done / Already-small result */}
      {(ui.phase === "done" || ui.phase === "already_small") && (
        <div className="space-y-4">
          {/* Before / After cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Before */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Before
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ui.original.objectUrl}
                alt="Original image"
                className="w-full rounded-lg object-cover aspect-square bg-zinc-100"
              />
              <div className="space-y-0.5 text-xs text-zinc-600">
                <p className="font-semibold text-zinc-800 truncate">
                  {ui.original.name}
                </p>
                <p>{formatSize(ui.original.bytes)}</p>
                <p>
                  {ui.original.width}×{ui.original.height} px
                </p>
              </div>
            </div>

            {/* After */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                {ui.phase === "already_small" ? "Already fits ✓" : "After"}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ui.result.objectUrl}
                alt="Compressed image"
                className="w-full rounded-lg object-cover aspect-square bg-zinc-100"
              />
              <div className="space-y-0.5 text-xs text-zinc-600">
                <p className="font-semibold text-emerald-700">
                  {formatSize(ui.result.bytes)}
                  {ui.phase === "already_small" && (
                    <span className="ml-1 text-emerald-600">(unchanged)</span>
                  )}
                </p>
                <p>
                  {ui.result.width}×{ui.result.height} px
                </p>
                {ui.result.qualityUsed !== undefined && (
                  <p className="text-zinc-400">
                    Quality: {(ui.result.qualityUsed * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Savings banner */}
          {ui.phase === "done" && (
            <div className="rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
              Saved{" "}
              {formatSize(ui.original.bytes - ui.result.bytes)} (
              {Math.round(
                (1 - ui.result.bytes / ui.original.bytes) * 100
              )}
              % smaller) · Output:{" "}
              <span className="underline underline-offset-2">
                {formatSize(ui.result.bytes)}
              </span>
            </div>
          )}

          {ui.phase === "already_small" && (
            <div className="rounded-lg bg-sky-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
              ✓ Image already meets the{" "}
              {preset ? `${preset.maxSizeKB} KB` : `${manualKB} KB`} requirement
              — no quality loss applied
            </div>
          )}

          {/* Download button */}
          <a
            href={ui.result.objectUrl}
            download={ui.result.filename}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 3v12"
              />
            </svg>
            Download {ui.result.filename}
          </a>

          {/* Compress another */}
          <button
            onClick={handleReset}
            className="w-full rounded-xl border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Compress another image
          </button>
        </div>
      )}
    </div>
  );
}
