import { useEffect, useRef, useState } from 'react';
import {
  ASSETS,
  HOTSPOTS,
  STATION_FEATURES,
} from '../data/mosslineData';
import {
  clamp,
  computeAcctWordStyle,
  computeCarbonNumber,
  computeHeroLayout,
  computeNearestCachedFrame,
  computeRockCrop,
  computeRockFlyState,
  computeSparklineOffset,
  computeVisionWordStyle,
  ease,
  seg,
} from '../utils/scrollMath';

const FPS = 24;
const VISION_LINES = [
  ['From', 'Data', 'Chaos', 'to'],
  ['Science-Backed,'],
  ['Actionable', 'Insights'],
];
const ACCT_WORDS =
  'Our ecosystem-level accounting translates complex field science into verifiable, compliance-ready metrics — so you can drive measurable results, not just reports.'.split(
    ' '
  );
const SPARKLINE_POINTS = '0,60 30,55 60,57 90,44 120,46 150,30 180,24 214,10';

const ROCK1_CROP = computeRockCrop({ x: 30, y: 200, w: 260, h: 295 });
const ROCK3_CROP = computeRockCrop({ x: 895, y: 240, w: 265, h: 270 });

export function ScrollStory() {
  const storyRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const camBackRef = useRef<HTMLDivElement | null>(null);
  const camFrontRef = useRef<HTMLDivElement | null>(null);
  const plateRef = useRef<HTMLImageElement | null>(null);
  const fogRef = useRef<HTMLDivElement | null>(null);

  const l0Ref = useRef<HTMLDivElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const heroH1Ref = useRef<HTMLHeadingElement | null>(null);
  const heroLineRef = useRef<HTMLSpanElement | null>(null);

  const l1Ref = useRef<HTMLDivElement | null>(null);
  const rk1Ref = useRef<HTMLDivElement | null>(null);
  const rk3Ref = useRef<HTMLDivElement | null>(null);

  const l2Ref = useRef<HTMLDivElement | null>(null);
  const visionChipRef = useRef<HTMLSpanElement | null>(null);
  const visionSubRef = useRef<HTMLParagraphElement | null>(null);
  const visionWordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const l3Ref = useRef<HTMLDivElement | null>(null);
  const acctWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hotspotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const l4Ref = useRef<HTMLDivElement | null>(null);
  const credRef = useRef<HTMLDivElement | null>(null);
  const carbonCardRef = useRef<HTMLDivElement | null>(null);
  const carbonNumRef = useRef<HTMLSpanElement | null>(null);
  const sparklineRef = useRef<SVGPolylineElement | null>(null);
  const featRowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const progInnerRef = useRef<HTMLDivElement | null>(null);

  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  // Layout Hero headline so island ferns overlap the lower half of the letters
  useEffect(() => {
    const layoutHero = () => {
      const heroCopy = heroCopyRef.current;
      const h1 = heroH1Ref.current;
      const line = heroLineRef.current;
      if (!heroCopy || !h1 || !line) return;

      const W = window.innerWidth;
      const H = window.innerHeight;
      if (W < 821) {
        heroCopy.style.top = '';
        h1.style.fontSize = '';
        return;
      }

      // Reset temporarily to measure natural line width at baseline size
      h1.style.fontSize = '72px';
      const measuredLineWidth = line.getBoundingClientRect().width;
      const blockHeight = heroCopy.getBoundingClientRect().height;

      const layout = computeHeroLayout(W, H, measuredLineWidth, blockHeight, 72);
      if (layout.useInline && layout.fontSizePx !== null && layout.topPx !== null) {
        h1.style.fontSize = `${layout.fontSizePx.toFixed(2)}px`;
        // Re-measure blockHeight after font-size update for exact baseline alignment
        const updatedHeight = heroCopy.getBoundingClientRect().height;
        const finalTop =
          layout.fernTopPx !== null
            ? layout.fernTopPx + 0.5 * layout.fontSizePx - updatedHeight
            : layout.topPx;
        heroCopy.style.top = `${finalTop.toFixed(2)}px`;
      }
    };

    layoutHero();
    window.addEventListener('resize', layoutHero);
    document.fonts?.ready?.then(layoutHero).catch(() => {});
    return () => window.removeEventListener('resize', layoutHero);
  }, []);

  // Video frame cache, canvas cover rendering, and single rAF scroll/pointer loop
  useEffect(() => {
    const story = storyRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!story || !canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let nf = 121;
    let frames: Array<Blob | null> = new Array(nf).fill(null);
    let cached = 0;
    let want = 0;
    let shown = -1;
    let busy = false;
    let destroyed = false;

    const grab = document.createElement('canvas');
    grab.width = 1600;
    grab.height = 900;
    const grabCtx = grab.getContext('2d');

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        shown = -1;
        drawWant();
      }
    };

    const drawWant = () => {
      if (destroyed || busy) return;
      const idx = computeNearestCachedFrame(frames, want);
      if (idx === -1 || idx === shown) return;
      const blob = frames[idx];
      if (!blob) return;

      busy = true;
      createImageBitmap(blob)
        .then((bmp) => {
          if (destroyed) {
            bmp.close();
            return;
          }
          const cw = canvas.width;
          const ch = canvas.height;
          const bw = bmp.width;
          const bh = bmp.height;
          const scale = Math.max(cw / bw, ch / bh);
          const dw = bw * scale;
          const dh = bh * scale;
          const dx = (cw - dw) / 2;
          const dy = (ch - dh) / 2;
          ctx.clearRect(0, 0, cw, ch);
          ctx.drawImage(bmp, dx, dy, dw, dh);
          bmp.close();
          shown = idx;
        })
        .catch(() => {})
        .finally(() => {
          busy = false;
          if (!destroyed) {
            const nextIdx = computeNearestCachedFrame(frames, want);
            if (nextIdx !== -1 && nextIdx !== shown) {
              drawWant();
            }
          }
        });
    };

    const captureFrame = (index: number, quality: number) => {
      if (!grabCtx || index < 0 || index >= nf || frames[index]) return;
      try {
        grabCtx.drawImage(video, 0, 0, grab.width, grab.height);
        grab.toBlob(
          (blob) => {
            if (destroyed || !blob || frames[index]) return;
            frames[index] = blob;
            cached++;
            if (index === want || shown === -1) {
              drawWant();
            }
          },
          'image/jpeg',
          quality
        );
      } catch {
        // Ignore transient decode errors
      }
    };

    let cachingStarted = false;
    const startCaching = () => {
      if (cachingStarted || destroyed) return;
      cachingStarted = true;

      const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 5.04;
      nf = Math.max(2, Math.round(dur * FPS));
      frames = new Array(nf).fill(null);

      // Grab frame 0 immediately
      captureFrame(0, 0.9);

      const vAny = video as HTMLVideoElement & {
        requestVideoFrameCallback?: (
          cb: (now: number, meta: { mediaTime: number }) => void
        ) => number;
      };

      if (typeof vAny.requestVideoFrameCallback === 'function') {
        const onFrame = (_now: number, meta: { mediaTime: number }) => {
          if (destroyed) return;
          const i = Math.min(nf - 1, Math.round(meta.mediaTime * FPS));
          if (i > 0 && !frames[i]) {
            captureFrame(i, 0.86);
          }
          if (!video.ended && cached < nf - 1) {
            vAny.requestVideoFrameCallback?.(onFrame);
          }
        };
        vAny.requestVideoFrameCallback(onFrame);
        video.play().catch(() => {
          // Fallback to seek-stepping if autoplay blocked
          runSeekFallback(1);
        });
      } else {
        runSeekFallback(1);
      }
    };

    const runSeekFallback = (startIdx: number) => {
      let i = startIdx;
      const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 5.04;
      const step = () => {
        if (destroyed || i >= nf) return;
        video.currentTime = Math.min(i / FPS, dur - 0.01);
      };
      const onSeeked = () => {
        if (destroyed) return;
        captureFrame(i, 0.86);
        i++;
        if (i < nf) {
          step();
        } else {
          video.removeEventListener('seeked', onSeeked);
        }
      };
      video.addEventListener('seeked', onSeeked);
      step();
    };

    if (video.readyState >= 2) {
      startCaching();
    } else {
      video.addEventListener('loadeddata', startCaching, { once: true });
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Expose verification hook (non-intrusive)
    (window as unknown as Record<string, unknown>).__hero = {
      ready: () => cached >= nf - 2,
      settled: () => !busy && computeNearestCachedFrame(frames, want) === shown,
    };

    // Sparkline total length
    const sparklineEl = sparklineRef.current;
    const sparkLen = sparklineEl ? sparklineEl.getTotalLength() : 230;
    if (sparklineEl) {
      sparklineEl.style.strokeDasharray = `${sparkLen}`;
      sparklineEl.style.strokeDashoffset = `${sparkLen}`;
    }

    // Pointer state
    let mx = 0;
    let my = 0;
    let sx = 0;
    let sy = 0;
    const onPointerMove = (e: PointerEvent) => {
      mx = e.clientX / Math.max(1, window.innerWidth) - 0.5;
      my = e.clientY / Math.max(1, window.innerHeight) - 0.5;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let sp = 0;
    let lastTime = performance.now();
    let rafId = 0;
    let lastShownNum = -1;

    const tick = (now: number) => {
      if (destroyed) return;
      const dt = Math.min(64, Math.max(0, now - lastTime));
      lastTime = now;

      const rect = story.getBoundingClientRect();
      const maxScroll = Math.max(1, story.offsetHeight - window.innerHeight);
      const rawP = clamp(-rect.top / maxScroll, 0, 1);

      const alpha = 1 - Math.pow(0.86, dt / 16.7);
      sp += (rawP - sp) * alpha;
      if (Math.abs(rawP - sp) < 0.0002) sp = rawP;

      sx += (mx - sx) * 0.06;
      sy += (my - sy) * 0.06;

      // Video target frame
      const vp = ease(seg(sp, 0.05, 0.7));
      want = Math.round(vp * (nf - 1));
      drawWant();

      // Camera box resting offset (.06H at rest settling into fly-in) + pointer parallax
      const H = window.innerHeight;
      const restLift = (1 - ease(seg(sp, 0.02, 0.14))) * 0.06 * H;
      const camTx = -sx * 16;
      const camTy = -sy * 10 + restLift;
      const camTransform = `translate3d(${camTx.toFixed(2)}px, ${camTy.toFixed(2)}px, 0)`;

      if (camBackRef.current) {
        camBackRef.current.style.transform = camTransform;
      }

      // Hero plate & front fern cutout hand-off (keep plate visible until canvas has painted at least 1 frame)
      const rawHandoff = 1 - seg(sp, 0.03, 0.07);
      const handoff = shown >= 0 ? rawHandoff : 1;
      if (plateRef.current) {
        plateRef.current.style.opacity = `${handoff.toFixed(3)}`;
        plateRef.current.style.visibility = handoff <= 0.01 ? 'hidden' : 'visible';
      }
      if (camFrontRef.current) {
        camFrontRef.current.style.transform = camTransform;
        camFrontRef.current.style.opacity = `${rawHandoff.toFixed(3)}`;
        camFrontRef.current.style.visibility = rawHandoff <= 0.01 ? 'hidden' : 'visible';
      }

      // L0 Hero copy fade & lift
      const heroOut = seg(sp, 0.02, 0.11);
      if (l0Ref.current) {
        l0Ref.current.style.opacity = `${(1 - heroOut).toFixed(3)}`;
        l0Ref.current.style.transform = `translate3d(0, ${(-heroOut * 48).toFixed(2)}px, 0)`;
        l0Ref.current.style.visibility = heroOut >= 0.99 ? 'hidden' : 'visible';
      }

      // L1 HUD, Caption, Scroll Hint
      const l1Out = seg(sp, 0.01, 0.09);
      if (l1Ref.current) {
        l1Ref.current.style.opacity = `${(1 - l1Out).toFixed(3)}`;
        l1Ref.current.style.visibility = l1Out >= 0.99 ? 'hidden' : 'visible';
      }

      // Floating Rock Sprites
      const rk1State = computeRockFlyState(sp, -0.3, -0.6, 1.3, sx, sy);
      if (rk1Ref.current) {
        if (!rk1State.visible) {
          rk1Ref.current.style.visibility = 'hidden';
        } else {
          rk1Ref.current.style.visibility = 'visible';
          rk1Ref.current.style.transform = `translate3d(${rk1State.translateXExpr}, ${rk1State.translateYExpr}, 0) scale(${rk1State.scale.toFixed(4)})`;
          rk1Ref.current.style.filter = `blur(${rk1State.blurPx.toFixed(2)}px)`;
        }
      }

      const rk3State = computeRockFlyState(sp, 1, 0.55, 1.8, sx, sy);
      if (rk3Ref.current) {
        if (!rk3State.visible) {
          rk3Ref.current.style.visibility = 'hidden';
        } else {
          rk3Ref.current.style.visibility = 'visible';
          rk3Ref.current.style.transform = `translate3d(${rk3State.translateXExpr}, ${rk3State.translateYExpr}, 0) scale(${rk3State.scale.toFixed(4)})`;
          rk3Ref.current.style.filter = `blur(${rk3State.blurPx.toFixed(2)}px)`;
        }
      }

      // L2 Vision
      const vIn = seg(sp, 0.16, 0.27);
      const vOut = seg(sp, 0.34, 0.42);
      const vVisible = vIn > 0.005 && vOut < 0.995;
      if (l2Ref.current) {
        l2Ref.current.style.visibility = vVisible ? 'visible' : 'hidden';
      }
      if (vVisible) {
        const subOp = clamp(vIn * 2 - 0.6, 0, 1) * (1 - vOut);
        const subY = -vOut * 50;
        if (visionChipRef.current) {
          visionChipRef.current.style.opacity = `${subOp.toFixed(3)}`;
          visionChipRef.current.style.transform = `translate3d(0, ${subY.toFixed(2)}px, 0)`;
        }
        if (visionSubRef.current) {
          visionSubRef.current.style.opacity = `${subOp.toFixed(3)}`;
          visionSubRef.current.style.transform = `translate3d(0, ${subY.toFixed(2)}px, 0)`;
        }
        visionWordRefs.current.forEach((el, idx) => {
          if (!el) return;
          const ws = computeVisionWordStyle(vIn, vOut, idx);
          el.style.opacity = `${ws.opacity.toFixed(3)}`;
          el.style.transform = `translate3d(0, ${ws.translateYPx.toFixed(2)}px, 0)`;
          el.style.filter = `blur(${ws.blurPx.toFixed(2)}px)`;
        });
      }

      // Fog bank
      const fgIn = ease(seg(sp, 0.38, 0.47));
      const fgFadeOut = 1 - ease(seg(sp, 0.92, 0.99));
      const fg = fgIn * fgFadeOut;
      if (fogRef.current) {
        fogRef.current.style.visibility = fg > 0.005 ? 'visible' : 'hidden';
        fogRef.current.style.opacity = `${fg.toFixed(3)}`;
        fogRef.current.style.transform = `translate3d(${((fgIn - 1) * 18 + sx * -10).toFixed(2)}vw, ${(sy * -6).toFixed(2)}px, 0)`;
      }

      // L3 Accounting & Hotspots
      const aIn = seg(sp, 0.45, 0.55);
      const aOut = seg(sp, 0.63, 0.68);
      const l3Visible = aIn > 0.005 && aOut < 0.995;
      if (l3Ref.current) {
        l3Ref.current.style.visibility = l3Visible ? 'visible' : 'hidden';
      }
      if (l3Visible) {
        acctWordRefs.current.forEach((el, idx) => {
          if (!el) return;
          const aw = computeAcctWordStyle(aIn, aOut, idx, ACCT_WORDS.length);
          el.style.opacity = `${aw.opacity.toFixed(3)}`;
          el.style.filter = `blur(${aw.blurPx.toFixed(2)}px)`;
        });
        hotspotRefs.current.forEach((el, idx) => {
          if (!el) return;
          const hk = seg(sp, 0.49 + idx * 0.02, 0.53 + idx * 0.02);
          const sc = hk * (1 - aOut);
          el.style.transform = `translate3d(${(sx * -30).toFixed(2)}px, ${(sy * -20).toFixed(2)}px, 0) scale(${sc.toFixed(4)})`;
          el.style.opacity = `${sc > 0.01 ? 1 : 0}`;
        });
      }

      // L4 Station
      const sIn = seg(sp, 0.72, 0.82);
      const l4Visible = sIn > 0.005;
      if (l4Ref.current) {
        l4Ref.current.style.visibility = l4Visible ? 'visible' : 'hidden';
      }
      if (l4Visible) {
        if (credRef.current) {
          credRef.current.style.opacity = `${sIn.toFixed(3)}`;
          credRef.current.style.transform = `translate3d(0, ${((1 - sIn) * 30).toFixed(2)}px, 0)`;
          credRef.current.style.filter = `blur(${((1 - sIn) * 8).toFixed(2)}px)`;
        }

        const cIn = ease(seg(sp, 0.74, 0.86));
        if (carbonCardRef.current) {
          carbonCardRef.current.style.opacity = `${cIn.toFixed(3)}`;
          carbonCardRef.current.style.transform = `perspective(900px) translate3d(${(sx * -14).toFixed(2)}px, ${((1 - cIn) * 60 + sy * -10).toFixed(2)}px, 0) rotateY(${(sx * 8).toFixed(2)}deg) rotateX(${(-sy * 8).toFixed(2)}deg)`;
        }

        const num = computeCarbonNumber(sp);
        if (carbonNumRef.current && num !== lastShownNum) {
          lastShownNum = num;
          carbonNumRef.current.textContent = String(num);
        }

        if (sparklineEl) {
          sparklineEl.style.strokeDashoffset = `${computeSparklineOffset(sp, sparkLen).toFixed(2)}`;
        }

        featRowRefs.current.forEach((el, idx) => {
          if (!el) return;
          const fk = ease(seg(sp, 0.76 + idx * 0.025, 0.82 + idx * 0.025));
          el.style.opacity = `${fk.toFixed(3)}`;
          el.style.transform = `translateX(${((1 - fk) * 40).toFixed(2)}px)`;
        });
      }

      // Progress bar
      if (progInnerRef.current) {
        progInnerRef.current.style.transform = `scaleX(${sp.toFixed(4)})`;
      }

      if (stageRef.current) {
        stageRef.current.dataset.progress = sp.toFixed(3);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  const scrollToBeat = (fraction: number) => {
    const story = storyRef.current;
    if (!story) return;
    const maxScroll = Math.max(1, story.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: story.offsetTop + maxScroll * fraction,
      behavior: 'smooth',
    });
  };

  let visionWordCounter = 0;

  return (
    <section id="story" ref={storyRef} data-testid="scroll-story" aria-label="Mossline ecosystem journey">
      <div className="ml-stage" ref={stageRef}>
        {/* 1. Back Camera Box */}
        <div className="cam" ref={camBackRef}>
          <canvas id="cv" ref={canvasRef} data-testid="flyin-canvas" />
          <img
            ref={plateRef}
            className="plate"
            src={ASSETS.heroStill}
            alt="Floating moss island suspended in a misty sky"
            referrerPolicy="no-referrer"
          />
          <div className="mist" aria-hidden="true" />
        </div>

        {/* 2. Hidden Video Source */}
        <video
          id="push"
          ref={videoRef}
          src={ASSETS.flyInVideo}
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          aria-hidden="true"
        />

        {/* 3. Fog Bank */}
        <div className="fog" ref={fogRef} style={{ visibility: 'hidden', opacity: 0 }} aria-hidden="true">
          <div className="f0" />
          <div className="f1" />
          <div className="f2" />
        </div>

        {/* 4. Layer L0: Hero Headline */}
        <div className="layer layer-l0" ref={l0Ref}>
          <div className="hero-copy" ref={heroCopyRef}>
            <span className="chip">Planet intelligence</span>
            <h1 ref={heroH1Ref}>
              <span className="hero-line-mask">
                <span className="hero-line-inner" ref={heroLineRef}>
                  Measure the Living Planet
                </span>
              </span>
            </h1>
          </div>
        </div>

        {/* 5. Front Fern Cut-Out */}
        <div className="cam camF" ref={camFrontRef}>
          <img
            src={ASSETS.heroCutout}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* 6. Two Floating Rock Sprites */}
        <div className="rock rk1" ref={rk1Ref} aria-hidden="true">
          <div className="bob">
            <img
              src={ASSETS.rockSpriteSheet}
              alt=""
              referrerPolicy="no-referrer"
              style={{
                width: ROCK1_CROP.widthPct,
                left: ROCK1_CROP.leftPct,
                top: ROCK1_CROP.topPct,
              }}
            />
          </div>
        </div>

        <div className="rock rk3" ref={rk3Ref} aria-hidden="true">
          <div className="bob">
            <img
              src={ASSETS.rockSpriteSheet}
              alt=""
              referrerPolicy="no-referrer"
              style={{
                width: ROCK3_CROP.widthPct,
                left: ROCK3_CROP.leftPct,
                top: ROCK3_CROP.topPct,
              }}
            />
          </div>
        </div>

        {/* 7a. Layer L1: Hero HUD, Caption, Scroll Hint */}
        <div className="layer layer-l1" ref={l1Ref}>
          <div className="hud">
            <span className="hud-crosshair" aria-hidden="true" />
            <span className="hud-frame" aria-hidden="true" />
            <span className="chip">Biodiversity</span>
            <pre>{`LAT  34.0922° N\nLON 116.2432° W\nELEV 842 M`}</pre>
          </div>

          <p className="hero-caption">
            Real-time ecosystem insights.
            <br />
            Powered by science, blockchain,
            <br />
            and transparent data.
          </p>

          <button
            type="button"
            className="scroll-hint"
            onClick={() => scrollToBeat(0.24)}
            aria-label="Scroll to explore story"
          >
            <span className="scroll-circle" aria-hidden="true">
              <span className="scroll-circle-chev" />
            </span>
            <span>SCROLL TO EXPLORE</span>
          </button>
        </div>

        {/* 7b. Layer L2: Vision */}
        <div className="layer layer-l2" ref={l2Ref} style={{ visibility: 'hidden' }}>
          <div className="vision-block">
            <span className="chip" ref={visionChipRef}>
              Our vision
            </span>
            <h2>
              {VISION_LINES.map((line, lineIdx) => (
                <span key={lineIdx} className="block">
                  {line.map((word) => {
                    const idx = visionWordCounter++;
                    return (
                      <span
                        key={`${lineIdx}-${word}`}
                        className="vision-word"
                        ref={(el) => {
                          visionWordRefs.current[idx] = el;
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </span>
              ))}
            </h2>
            <p className="vision-sub" ref={visionSubRef}>
              A breakthrough in environmental measurement,
              <br />
              built for commercial use.
            </p>
          </div>
        </div>

        {/* 7c. Layer L3: Accounting & Hotspots */}
        <div className="layer layer-l3" ref={l3Ref} style={{ visibility: 'hidden' }}>
          <p className="acct">
            {ACCT_WORDS.map((word, idx) => (
              <span
                key={`${idx}-${word}`}
                className="acct-word"
                ref={(el) => {
                  acctWordRefs.current[idx] = el;
                }}
              >
                {word}
              </span>
            ))}
          </p>

          {HOTSPOTS.map((hs, idx) => {
            const isOn = activeHotspot === hs.id;
            return (
              <button
                key={hs.id}
                type="button"
                ref={(el) => {
                  hotspotRefs.current[idx] = el;
                }}
                className={`hotspot ${isOn ? 'on' : ''}`}
                style={{ left: hs.left, top: hs.top }}
                aria-pressed={isOn}
                aria-label={`${hs.label}: ${hs.value}`}
                onClick={() => setActiveHotspot((prev) => (prev === hs.id ? null : hs.id))}
              >
                <span className="hotspot-dot" aria-hidden="true" />
                <span className="hotspot-label">
                  <span>{hs.label}</span>
                  <em>{hs.value}</em>
                </span>
              </button>
            );
          })}
        </div>

        {/* 7d. Layer L4: Station 07 */}
        <div className="layer layer-l4" ref={l4Ref} style={{ visibility: 'hidden' }}>
          <div className="cred" ref={credRef}>
            <span className="cred-tag">✕ Field station 07</span>
            <h2>Scientific credibility for corporate climate action</h2>
          </div>

          <div className="carbon-card" ref={carbonCardRef}>
            <h4>
              Accumulated carbon
              <br />
              balance
            </h4>
            <p className="carbon-note">Plot 07 · 12 months</p>
            <div className="carbon-val-row">
              <span className="carbon-num" ref={carbonNumRef}>
                0
              </span>
              <span className="carbon-unit">tCO₂e</span>
            </div>
            <span className="carbon-delta">+2.6 tCO₂e</span>
            <svg width="220" height="70" viewBox="0 0 220 70" className="mt-2 block" aria-hidden="true">
              <polyline
                ref={sparklineRef}
                points={SPARKLINE_POINTS}
                fill="none"
                stroke="#c6f35c"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="90" cy="44" r="2.4" fill="#ffffff" />
              <circle cx="150" cy="30" r="2.4" fill="#ffffff" />
              <circle cx="214" cy="10" r="3.4" fill="#c6f35c" />
            </svg>
            <p className="carbon-foot">Q1 · Q2 · Q3 · Q4</p>
          </div>

          <div className="feats" role="list" aria-label="Field station capabilities">
            {STATION_FEATURES.map((feat, idx) => {
              const isOn = activeFeature === idx;
              return (
                <button
                  key={feat.index}
                  type="button"
                  role="listitem"
                  ref={(el) => {
                    featRowRefs.current[idx] = el;
                  }}
                  className={`feat-row ${isOn ? 'on' : ''}`}
                  aria-pressed={isOn}
                  onClick={() => setActiveFeature((prev) => (prev === idx ? null : idx))}
                >
                  <span className="feat-idx">{feat.index}</span>
                  <span>
                    <span className="block">{feat.label}</span>
                    {isOn && (
                      <span className="block mt-1.5 font-sans normal-case tracking-normal text-[12px] leading-snug text-[#2c4434]">
                        {feat.detail}
                      </span>
                    )}
                  </span>
                  <span className="feat-arr" aria-hidden="true">
                    →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 8. Progress Bar */}
        <div className="prog" aria-hidden="true">
          <div className="prog-inner" ref={progInnerRef} style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  );
}
