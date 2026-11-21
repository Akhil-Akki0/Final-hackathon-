import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  seg,
  ease,
  computeHeroLayout,
  computeRockCrop,
  computeRockFlyState,
  computeNearestCachedFrame,
  computeVisionWordStyle,
  computeAcctWordStyle,
  computeCarbonNumber,
  computeSparklineOffset,
  computeCardTilt,
} from './scrollMath';

test('clamp constrains values between min and max', () => {
  assert.equal(clamp(-0.5), 0);
  assert.equal(clamp(0.42), 0.42);
  assert.equal(clamp(1.8), 1);
  assert.equal(clamp(15, 10, 20), 15);
});

test('seg normalizes scroll progress segments', () => {
  assert.equal(seg(0.05, 0.05, 0.7), 0);
  assert.equal(seg(0.7, 0.05, 0.7), 1);
  assert.ok(Math.abs(seg(0.375, 0.05, 0.7) - 0.5) < 1e-6);
  assert.equal(seg(0.01, 0.05, 0.7), 0);
});

test('ease applies cubic in-out curve symmetrically', () => {
  assert.equal(ease(0), 0);
  assert.equal(ease(0.5), 0.5);
  assert.equal(ease(1), 1);
  assert.ok(ease(0.25) < 0.25);
  assert.ok(ease(0.75) > 0.75);
});

test('computeHeroLayout computes exact desktop positioning and mobile fallback', () => {
  const mobile = computeHeroLayout(390, 844, 300, 120, 48);
  assert.equal(mobile.useInline, false);
  assert.equal(mobile.topPx, null);

  const desktop = computeHeroLayout(1440, 900, 800, 140, 80);
  assert.equal(desktop.useInline, true);
  assert.ok(desktop.fontSizePx !== null && desktop.fontSizePx <= 104);
  assert.ok(desktop.topPx !== null && desktop.fernTopPx !== null);
});

test('computeRockCrop matches exact 1200x678 sprite sheet math', () => {
  const crop1 = computeRockCrop({ x: 30, y: 200, w: 260, h: 295 });
  assert.equal(crop1.widthPct, `${(1200 / 260) * 100}%`);
  assert.equal(crop1.leftPct, `${(-30 / 260) * 100}%`);
  assert.equal(crop1.topPct, `${(-200 / 295) * 100}%`);
});

test('computeRockFlyState hides sprite when fp reaches 1', () => {
  const active = computeRockFlyState(0.11, -0.3, -0.6, 1.3, 0, 0);
  assert.equal(active.visible, true);
  assert.ok(active.scale > 1);

  const done = computeRockFlyState(0.21, -0.3, -0.6, 1.3, 0, 0);
  assert.equal(done.visible, false);
});

test('computeNearestCachedFrame finds exact or nearest outward cached frame', () => {
  const fakeBlob = new Blob(['x']);
  const frames = [fakeBlob, null, null, fakeBlob, null];
  assert.equal(computeNearestCachedFrame(frames, 0), 0);
  assert.equal(computeNearestCachedFrame(frames, 2), 3);
  assert.equal(computeNearestCachedFrame(frames, 1), 0);
  assert.equal(computeNearestCachedFrame([null, null], 0), -1);
});

test('computeVisionWordStyle & computeAcctWordStyle respect reveal windows', () => {
  const hiddenWord = computeVisionWordStyle(0, 0, 0);
  assert.equal(hiddenWord.opacity, 0);
  assert.equal(hiddenWord.blurPx, 12);

  const visibleWord = computeVisionWordStyle(1, 0, 0);
  assert.equal(visibleWord.opacity, 1);
  assert.equal(visibleWord.blurPx, 0);

  const acctStart = computeAcctWordStyle(0, 0, 0, 20);
  assert.ok(Math.abs(acctStart.opacity - 0.15) < 1e-6);
  const acctEnd = computeAcctWordStyle(1, 0, 19, 20);
  assert.equal(acctEnd.opacity, 1);
});

test('computeCarbonNumber and computeSparklineOffset track station progress', () => {
  assert.equal(computeCarbonNumber(0.75), 0);
  assert.equal(computeCarbonNumber(0.83), 12);
  assert.equal(computeCarbonNumber(0.91), 24);

  assert.equal(computeSparklineOffset(0.76, 228), 228);
  assert.equal(computeSparklineOffset(0.93, 228), 0);
});

test('computeCardTilt computes centered pointer tilt angles', () => {
  const center = computeCardTilt(150, 100, 300, 200, 7);
  assert.equal(center.rotateX, 0);
  assert.equal(center.rotateY, 0);

  const topRight = computeCardTilt(300, 0, 300, 200, 7);
  assert.equal(topRight.rotateX, 7);
  assert.equal(topRight.rotateY, 7);
});
