export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function seg(progress: number, start: number, end: number): number {
  if (end === start) return progress >= end ? 1 : 0;
  return clamp((progress - start) / (end - start), 0, 1);
}

export function ease(t: number): number {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export interface HeroLayoutResult {
  useInline: boolean;
  fontSizePx: number | null;
  topPx: number | null;
  fernTopPx: number | null;
}

export function computeHeroLayout(
  viewportWidth: number,
  viewportHeight: number,
  measuredLineWidth: number,
  blockHeight: number,
  baseFontSize: number
): HeroLayoutResult {
  if (viewportWidth < 821) {
    return {
      useInline: false,
      fontSizePx: null,
      topPx: null,
      fernTopPx: null,
    };
  }

  const bw = viewportWidth * 1.06;
  const bh = viewportHeight * 1.12;
  const k = Math.max(bw / 1600, bh / 900);
  const fernTop = -0.09 * viewportHeight + (bh - 900 * k) / 2 + 245 * k + 0.06 * viewportHeight;

  let fs = Math.min(104, 72 * k);
  const maxAllowedWidth = viewportWidth * 0.86;
  if (measuredLineWidth > maxAllowedWidth && baseFontSize > 0) {
    const projectedWidth = measuredLineWidth * (fs / baseFontSize);
    if (projectedWidth > maxAllowedWidth) {
      fs = fs * (maxAllowedWidth / projectedWidth);
    }
  }

  const topPx = fernTop + 0.5 * fs - blockHeight;
  return {
    useInline: true,
    fontSizePx: fs,
    topPx,
    fernTopPx: fernTop,
  };
}

export interface RockCropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RockCropStyle {
  widthPct: string;
  leftPct: string;
  topPct: string;
}

export function computeRockCrop(crop: RockCropRect, sheetWidth = 1200): RockCropStyle {
  return {
    widthPct: `${(sheetWidth / crop.w) * 100}%`,
    leftPct: `${(-crop.x / crop.w) * 100}%`,
    topPct: `${(-crop.y / crop.h) * 100}%`,
  };
}

export interface RockFlyState {
  visible: boolean;
  fp: number;
  translateXExpr: string;
  translateYExpr: string;
  scale: number;
  blurPx: number;
}

export function computeRockFlyState(
  sp: number,
  vx: number,
  vy: number,
  depth: number,
  sx: number,
  sy: number
): RockFlyState {
  const fp = seg(sp, 0.02, 0.2);
  if (fp >= 1) {
    return {
      visible: false,
      fp: 1,
      translateXExpr: '0px',
      translateYExpr: '0px',
      scale: 1,
      blurPx: 0,
    };
  }
  const fe = fp * fp;
  const xVw = vx * fp * 70;
  const yVh = vy * fp * 60;
  const pxX = sx * -24 * depth;
  const pxY = sy * -16 * depth;
  return {
    visible: true,
    fp,
    translateXExpr: `calc(${xVw.toFixed(3)}vw + ${pxX.toFixed(2)}px)`,
    translateYExpr: `calc(${yVh.toFixed(3)}vh + ${pxY.toFixed(2)}px)`,
    scale: 1 + fe * 1.6 * depth,
    blurPx: fe * 5 * depth,
  };
}

export function computeNearestCachedFrame(
  frames: ReadonlyArray<Blob | null | undefined>,
  want: number
): number {
  const len = frames.length;
  if (len === 0) return -1;
  const target = Math.max(0, Math.min(len - 1, Math.round(want)));
  if (frames[target]) return target;
  for (let k = 1; k < len; k++) {
    const right = target + k;
    if (right < len && frames[right]) return right;
    const left = target - k;
    if (left >= 0 && frames[left]) return left;
  }
  return -1;
}

export interface VisionWordStyle {
  opacity: number;
  translateYPx: number;
  blurPx: number;
}

export function computeVisionWordStyle(
  vIn: number,
  vOut: number,
  wordIndex: number
): VisionWordStyle {
  const k = clamp(vIn * 1.6 - wordIndex * 0.08, 0, 1);
  return {
    opacity: k * (1 - vOut),
    translateYPx: (1 - k) * 30 - vOut * 60,
    blurPx: (1 - k) * 12 + vOut * 14,
  };
}

export interface AcctWordStyle {
  opacity: number;
  blurPx: number;
}

export function computeAcctWordStyle(
  aIn: number,
  aOut: number,
  wordIndex: number,
  totalWords: number
): AcctWordStyle {
  const ratio = totalWords > 0 ? wordIndex / totalWords : 0;
  const k = clamp(aIn * 2.2 - ratio * 1.2, 0, 1);
  return {
    opacity: (0.15 + 0.85 * k) * (1 - aOut),
    blurPx: (1 - k) * 6 + aOut * 10,
  };
}

export function computeCarbonNumber(sp: number): number {
  return Math.round(24 * seg(sp, 0.76, 0.9));
}

export function computeSparklineOffset(sp: number, totalLength: number): number {
  const drawProgress = seg(sp, 0.77, 0.92);
  return totalLength * (1 - drawProgress);
}

export function computeCardTilt(
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
  maxDeg = 7
): { rotateX: number; rotateY: number } {
  if (width <= 0 || height <= 0) return { rotateX: 0, rotateY: 0 };
  const nx = clamp(offsetX / width, 0, 1) - 0.5;
  const ny = clamp(offsetY / height, 0, 1) - 0.5;
  return {
    rotateX: -ny * maxDeg * 2 || 0,
    rotateY: nx * maxDeg * 2 || 0,
  };
}
