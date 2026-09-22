/**
 * KB Precision Compressor — core compression engine
 *
 * Runs entirely in the browser via the Canvas API.
 * No data is sent to any server at any point.
 *
 * Algorithm:
 *   1. If a forced pixel dimension is specified, resize/crop the image to fit (cover
 *      or contain strategy).
 *   2. Run a binary search over JPEG quality (0.1 → 0.95) to find the highest quality
 *      whose encoded size is ≤ targetKB.
 *   3. If quality alone can't reach the target, progressively scale down the canvas
 *      dimensions and repeat the quality search at each scale step.
 *   4. If the uploaded file is already ≤ targetKB, return it untouched with a flag.
 *   5. If it's truly impossible (e.g. 1 KB target on a large photo), return a typed
 *      error — never loop infinitely or throw silently.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type CropMode = "cover" | "contain" | "free";

export interface CompressOptions {
  /** Hard ceiling: output must never exceed this. */
  maxSizeKB: number;
  /**
   * Ideal target. The engine aims for this value (slightly smaller than
   * maxSizeKB gives breathing room). Defaults to maxSizeKB.
   */
  targetSizeKB?: number;
  /** Force exact output width in px. */
  width?: number;
  /** Force exact output height in px. */
  height?: number;
  /**
   * How to fit the image into width×height.
   * "cover"   – crop to fill (like CSS background-size: cover)
   * "contain" – letterbox/pillarbox to fit without cropping
   * "free"    – stretch to exact dimensions (use only when aspect ratio is fixed)
   */
  cropMode?: CropMode;
  /**
   * Minimum acceptable JPEG quality before we start scaling dimensions instead.
   * Default 0.15.
   */
  qualityFloor?: number;
  /**
   * How many dimension-scale steps to try before giving up.
   * Each step multiplies the current dimensions by scaleFactor.
   * Default 12.
   */
  maxScaleSteps?: number;
  /**
   * Multiplier applied to canvas dimensions at each scale step (< 1).
   * Default 0.85.
   */
  scaleFactor?: number;
  /**
   * Binary search iterations per quality search pass.
   * More iterations = finer quality resolution. Default 10.
   */
  binarySearchIterations?: number;
}

export type CompressSuccess = {
  status: "success";
  blob: Blob;
  /** Final width of the output image in px */
  outputWidth: number;
  /** Final height of the output image in px */
  outputHeight: number;
  /** Final file size in bytes */
  outputBytes: number;
  /** JPEG quality used (0–1) */
  qualityUsed: number;
};

export type CompressAlreadySmall = {
  status: "already_small";
  /** The original File, unchanged */
  blob: Blob;
  outputWidth: number;
  outputHeight: number;
  outputBytes: number;
};

export type CompressImpossible = {
  status: "impossible";
  reason: string;
  /** Smallest blob we managed to produce (may still exceed target) */
  smallestBlob?: Blob;
  smallestBytes?: number;
};

export type CompressError = {
  status: "error";
  reason: string;
};

export type CompressResult =
  | CompressSuccess
  | CompressAlreadySmall
  | CompressImpossible
  | CompressError;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Load a File/Blob into an HTMLImageElement. */
function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode image. The file may be corrupt or in an unsupported format."));
    };
    img.src = url;
  });
}

/**
 * Draw `img` onto a canvas of size (canvasW × canvasH) using the given crop
 * mode, then encode to JPEG at `quality` and return a Blob.
 */
function drawAndEncode(
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  cropMode: CropMode,
  quality: number
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;

  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;

  if (cropMode === "cover") {
    // Scale so the image covers the entire canvas, then center-crop.
    const scale = Math.max(canvasW / srcW, canvasH / srcH);
    const scaledW = srcW * scale;
    const scaledH = srcH * scale;
    const offsetX = (canvasW - scaledW) / 2;
    const offsetY = (canvasH - scaledH) / 2;
    ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
  } else if (cropMode === "contain") {
    // Scale so the entire image fits within the canvas; letterbox with white.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasW, canvasH);
    const scale = Math.min(canvasW / srcW, canvasH / srcH);
    const scaledW = srcW * scale;
    const scaledH = srcH * scale;
    const offsetX = (canvasW - scaledW) / 2;
    const offsetY = (canvasH - scaledH) / 2;
    ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
  } else {
    // "free" — stretch to exact dimensions.
    ctx.drawImage(img, 0, 0, canvasW, canvasH);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

/**
 * Binary-search over JPEG quality [qualityFloor, 0.95] to find the highest
 * quality whose encoded size is ≤ targetBytes.
 *
 * Returns { blob, quality } of the best found, or null if even qualityFloor
 * exceeds targetBytes (meaning this canvas size is too large for the target).
 */
async function binarySearchQuality(
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  cropMode: CropMode,
  targetBytes: number,
  iterations: number,
  qualityFloor: number
): Promise<{ blob: Blob; quality: number } | null> {
  let lo = qualityFloor;
  let hi = 0.95;
  let bestBlob: Blob | null = null;
  let bestQuality = -1;

  // First check the floor explicitly — if even the lowest quality exceeds
  // the target we can bail immediately without running all iterations.
  const floorBlob = await drawAndEncode(img, canvasW, canvasH, cropMode, qualityFloor);
  if (!floorBlob || floorBlob.size > targetBytes) {
    // This canvas size can't fit in targetBytes even at minimum quality.
    return null;
  }
  // Floor fits — record it as the current best and search upward.
  bestBlob = floorBlob;
  bestQuality = qualityFloor;
  lo = qualityFloor;

  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    const blob = await drawAndEncode(img, canvasW, canvasH, cropMode, mid);
    if (!blob) continue;

    if (blob.size <= targetBytes) {
      bestBlob = blob;
      bestQuality = mid;
      lo = mid; // fits — try higher quality
    } else {
      hi = mid; // too big — try lower quality
    }
  }

  return bestBlob ? { blob: bestBlob, quality: bestQuality } : null;
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Compress `file` to fit within `options.maxSizeKB`.
 *
 * Must be called in a browser context (Canvas API required).
 */
export async function compressImage(
  file: File | Blob,
  options: CompressOptions
): Promise<CompressResult> {
  const {
    maxSizeKB,
    targetSizeKB,
    width: forcedWidth,
    height: forcedHeight,
    cropMode = "cover",
    qualityFloor = 0.15,
    maxScaleSteps = 12,
    scaleFactor = 0.85,
    binarySearchIterations = 12,
  } = options;

  // The engine always aims for targetSizeKB ≤ maxSizeKB.
  const effectiveTargetKB = Math.min(targetSizeKB ?? maxSizeKB, maxSizeKB);
  const targetBytes = effectiveTargetKB * 1024;
  const maxBytes = maxSizeKB * 1024;

  // ── 1. Validate input type ─────────────────────────────────────────────
  const mimeType = (file as File).type ?? "";
  if (mimeType && !mimeType.startsWith("image/")) {
    return {
      status: "error",
      reason: `Unsupported file type: "${mimeType}". Please upload a JPG or PNG image.`,
    };
  }

  // ── 2. Check if already small enough ─────────────────────────────────
  // Only skip compression if there are NO forced dimensions (we still need to
  // resize even if file is small when dimensions are specified).
  const hasForceResize = forcedWidth !== undefined && forcedHeight !== undefined;
  if (!hasForceResize && file.size <= maxBytes) {
    // Load to get natural dimensions for the result metadata.
    let img: HTMLImageElement;
    try {
      img = await loadImage(file);
    } catch (e: unknown) {
      return {
        status: "error",
        reason: e instanceof Error ? e.message : "Failed to decode image.",
      };
    }
    return {
      status: "already_small",
      blob: file,
      outputWidth: img.naturalWidth,
      outputHeight: img.naturalHeight,
      outputBytes: file.size,
    };
  }

  // ── 3. Load image ──────────────────────────────────────────────────────
  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch (e: unknown) {
    return {
      status: "error",
      reason: e instanceof Error ? e.message : "Failed to decode image.",
    };
  }

  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;

  if (naturalW === 0 || naturalH === 0) {
    return { status: "error", reason: "Image has zero dimensions — it may be corrupt." };
  }

  // ── 4. Determine initial canvas dimensions ─────────────────────────────
  let canvasW = forcedWidth ?? naturalW;
  let canvasH = forcedHeight ?? naturalH;

  // ── 5. Quality binary search loop — scale down dimensions until we fit ──
  //
  // binarySearchQuality() checks the floor first; if even floor quality
  // doesn't fit it returns null immediately (cheap early exit). Only when
  // null do we shrink dimensions and retry.
  //
  // We track the smallest blob produced at any scale for the impossible-case
  // error message. Because the floor check inside binarySearchQuality always
  // encodes once at qualityFloor, we can retrieve that as our "worst case"
  // estimate by encoding once here before the search.
  let smallestBlobSeen: Blob | null = null;

  for (let step = 0; step <= maxScaleSteps; step++) {
    const w = Math.max(1, Math.round(canvasW));
    const h = Math.max(1, Math.round(canvasH));

    // Capture the floor-quality blob for progress tracking regardless of fit.
    const floorBlob = await drawAndEncode(img, w, h, cropMode, qualityFloor);
    if (floorBlob && (!smallestBlobSeen || floorBlob.size < smallestBlobSeen.size)) {
      smallestBlobSeen = floorBlob;
    }

    const result = await binarySearchQuality(
      img,
      w,
      h,
      cropMode,
      targetBytes,
      binarySearchIterations,
      qualityFloor
    );

    if (result && result.blob.size <= maxBytes) {
      return {
        status: "success",
        blob: result.blob,
        outputWidth: w,
        outputHeight: h,
        outputBytes: result.blob.size,
        qualityUsed: result.quality,
      };
    }

    // Didn't fit — scale dimensions down for the next iteration.
    if (step < maxScaleSteps) {
      canvasW *= scaleFactor;
      canvasH *= scaleFactor;

      // Don't go below 10 px on either axis — any smaller is unrecognisable.
      if (canvasW < 10 || canvasH < 10) {
        break;
      }
    }
  }

  // ── 7. Nothing worked — report impossible ──────────────────────────────
  const smallestKB = smallestBlobSeen
    ? (smallestBlobSeen.size / 1024).toFixed(1)
    : "unknown";

  return {
    status: "impossible",
    reason:
      `Cannot compress this image to ${effectiveTargetKB} KB without making it unrecognisable. ` +
      `The smallest achievable size is approximately ${smallestKB} KB. ` +
      `Try a higher target size.`,
    smallestBlob: smallestBlobSeen ?? undefined,
    smallestBytes: smallestBlobSeen?.size,
  };
}

// ─── Utility helpers (used by UI layer) ──────────────────────────────────────

/** Format bytes as a human-readable KB string, e.g. "47.2 KB" */
export function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/** Format bytes as a human-readable string (KB or MB). */
export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Validate that a File is a supported image type.
 * Returns an error string, or null if valid.
 */
export function validateImageFile(file: File): string | null {
  const supported = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!supported.includes(file.type)) {
    return `Unsupported file type "${file.type || "unknown"}". Please upload a JPG, PNG, or WebP image.`;
  }
  if (file.size === 0) {
    return "The selected file is empty.";
  }
  return null;
}
