import React from 'react';
import { BetSpotId, WHEEL_SEGMENTS } from '../data/wheelConfig';

export type RoundPhase =
  | 'BETTING'
  | 'BETS_CLOSED'
  | 'MULTIPLIER_SPIN'
  | 'SPINNING'
  | 'BONUS_FISHING'
  | 'RESULT_REVEAL';

interface IceWheelCanvasProps {
  rotationDeg: number;
  phase: RoundPhase;
  flapperAngle: number;
  spinSpeedRatio?: number;
  isLaunchingMultipliers?: boolean;
  segmentMultipliers: Record<number, number>;
  bonusCardMultipliers?: Partial<Record<BetSpotId, number>>;
  centerMultiplierPreview: number | null;
  winningSegmentIndex: number | null;
  lastWinAmount: number;
}

/**
 * Exact replica of the Evolution Ice Fishing Twin-Petal Leaf Emblem
 * (Two symmetrical curved petals meeting horizontally on the right and flaring left,
 * with a 3D left bevel border).
 */
export const TwinLeafIcon: React.FC<{
  variant: 'white' | 'blue' | 'gold';
  size?: number;
  className?: string;
}> = ({ variant, size = 48, className = '' }) => {
  const gradIdTop = `leaf-top-${variant}`;
  const gradIdBot = `leaf-bot-${variant}`;
  const bevelColor =
    variant === 'gold'
      ? '#6b4210'
      : variant === 'white'
      ? '#7c8b95'
      : '#3e586d';
  const strokeColor =
    variant === 'gold'
      ? '#5c3709'
      : variant === 'white'
      ? '#6e7f8b'
      : '#344c5e';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      <defs>
        {variant === 'gold' ? (
          <>
            <linearGradient id={gradIdTop} x1="12" y1="8" x2="54" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="55%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id={gradIdBot} x1="12" y1="56" x2="54" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </>
        ) : variant === 'white' ? (
          <>
            <linearGradient id={gradIdTop} x1="14" y1="8" x2="54" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#dbe4ec" />
            </linearGradient>
            <linearGradient id={gradIdBot} x1="14" y1="56" x2="54" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </>
        ) : (
          <>
            <linearGradient id={gradIdTop} x1="14" y1="8" x2="54" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7596af" />
              <stop offset="65%" stopColor="#587b95" />
              <stop offset="100%" stopColor="#43637b" />
            </linearGradient>
            <linearGradient id={gradIdBot} x1="14" y1="56" x2="54" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6a8ba4" />
              <stop offset="65%" stopColor="#4d6f89" />
              <stop offset="100%" stopColor="#3b5a72" />
            </linearGradient>
          </>
        )}
      </defs>

      {/* Left 3D shadow bevel for Top Petal */}
      <path
        d="M11 11 C28 6, 51 14, 54 30.5 L31 30.5 C21 27, 15 20, 11 11 Z"
        fill={bevelColor}
        transform="translate(-2.5, 0.5)"
      />
      {/* Top Petal */}
      <path
        d="M12 10.5 C29 6, 51 14, 54 30.5 L32 30.5 C22 27.5, 16 20, 12 10.5 Z"
        fill={`url(#${gradIdTop})`}
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Left 3D shadow bevel for Bottom Petal */}
      <path
        d="M11 53 C28 58, 51 50, 54 33.5 L31 33.5 C21 37, 15 44, 11 53 Z"
        fill={bevelColor}
        transform="translate(-2.5, -0.5)"
      />
      {/* Bottom Petal */}
      <path
        d="M12 53.5 C29 58, 51 50, 54 33.5 L32 33.5 C22 36.5, 16 44, 12 53.5 Z"
        fill={`url(#${gradIdBot})`}
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const IceWheelCanvas: React.FC<IceWheelCanvasProps> = ({
  rotationDeg,
  phase,
  flapperAngle,
  spinSpeedRatio = 0,
  isLaunchingMultipliers = false,
  segmentMultipliers,
  bonusCardMultipliers = {},
  centerMultiplierPreview,
  winningSegmentIndex,
  lastWinAmount,
}) => {
  const isZoomedOut = phase === 'BETTING';
  const winningSegment =
    winningSegmentIndex !== null ? WHEEL_SEGMENTS[winningSegmentIndex] : null;
  const winningMult =
    winningSegmentIndex !== null ? segmentMultipliers[winningSegmentIndex] : undefined;

  const numSegments = WHEEL_SEGMENTS.length;
  const sliceDeg = 360 / numSegments;

  // Rotational motion blur opacity smoothly fades in during fast spin and fades out during deceleration
  const motionBlurOpacity = Math.min(0.95, Math.max(0, (spinSpeedRatio - 0.1) * 1.45));

  // Golden Center Hub shows when centerMultiplierPreview is explicitly active OR as the back face of the 3D coin spin
  const showGoldenCenterHub = centerMultiplierPreview !== null;

  const renderBonusBadgeInIce = (type: BetSpotId) => {
    const label =
      type === 'LIL_BLUES'
        ? "LIL' BLUES"
        : type === 'BIG_ORANGES'
        ? 'BIG ORANGES'
        : 'HUGE REDS';
    const bgGrad =
      type === 'LIL_BLUES'
        ? 'from-[#2563eb] to-[#1d4ed8] border-[#93c5fd]'
        : type === 'BIG_ORANGES'
        ? 'from-[#f59e0b] to-[#b45309] border-[#fde68a]'
        : 'from-[#ef4444] to-[#991b1b] border-[#fca5a5]';
    return (
      <div
        className={`px-2.5 py-1 rounded-lg bg-gradient-to-b ${bgGrad} border shadow-md`}
      >
        <span className="font-display font-black text-[12px] text-white tracking-wider drop-shadow">
          {label}
        </span>
      </div>
    );
  };

  const boostedIndices = Object.keys(segmentMultipliers).map(Number);

  return (
    <div className="relative w-full h-full flex items-start justify-center overflow-hidden bg-[#375164] select-none">
      {/* Full-Bleed Real Video Stage Container (1080x1350):
          - STATE 1 (BETTING): NORMAL VIEW (scale-100 translate-y-0)
          - STATES 2-5 (BETS_CLOSED / MULTIPLIER_SPIN / SPINNING / RESULT_REVEAL): CLOSE-UP VIEW (scale-[1.235] -translate-y-[6px])
          Smoothly transitions with cubic-bezier(0.22, 1, 0.36, 1) */}
      <div
        style={{
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className={`relative w-full aspect-[1080/1350] origin-top transition-transform duration-700 ${
          isZoomedOut
            ? 'scale-100 translate-y-0'
            : 'scale-[1.235] -translate-y-[6px]'
        }`}
      >
        {/* 1. Stationary Full-Bleed Real Ice Stage, Snowdrifts, Steel Rim & Lower Snow Floor */}
        <img
          src="/assets/game/stage_ice_clean.png"
          alt="Ice Hole Stage"
          referrerPolicy="no-referrer"
          className="w-full h-full object-fill pointer-events-none block"
        />

        {/* 2. Rotating Real 54-Segment Wheel Disc (aligned to exact cx=540, cy=495, D=750 inside 1080x1350) */}
        <div
          style={{
            left: '15.28%',
            top: '8.89%',
            width: '69.44%',
            height: '55.56%',
            transform: `rotate(${rotationDeg}deg)`,
          }}
          className="absolute rounded-full overflow-hidden pointer-events-none will-change-transform"
        >
          {/* Base Sharp Wheel Disc */}
          <img
            src="/assets/game/wheel_disc_wedges.png"
            alt="Ice Fishing Wheel"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full block"
          />

          {/* Radial Rotational Motion Blur Layer (Fades in during fast rotation and fades out smoothly during deceleration, matching Original Video 00:13, 00:33, 00:53, 01:14) */}
          {motionBlurOpacity > 0.01 && (
            <img
              src="/assets/game/wheel_disc_motion_blur.png"
              alt="Wheel Motion Blur"
              referrerPolicy="no-referrer"
              style={{ opacity: motionBlurOpacity }}
              className="absolute inset-0 w-full h-full object-cover rounded-full pointer-events-none block"
            />
          )}

          {/* Dynamic Multipliers on Boosted Leaf Segments (and optional Icy 2x/3x/4x on Bonus Fish Wedges) */}
          {WHEEL_SEGMENTS.map((seg, idx) => {
            const leafMult = segmentMultipliers[idx];
            const fishMult =
              seg.type === 'LIL_BLUES' ||
              seg.type === 'BIG_ORANGES' ||
              seg.type === 'HUGE_REDS'
                ? bonusCardMultipliers[seg.type]
                : undefined;

            if (!leafMult && !fishMult) return null;

            const angle = idx * sliceDeg;
            const isLeaf = seg.type === 'WHITE_LEAF' || seg.type === 'BLUE_LEAF';
            // Non-winning golden leaf multipliers fade back to normal when RESULT_REVEAL highlights the winner
            const fadeOutNonWinner =
              phase === 'RESULT_REVEAL' && winningSegmentIndex !== idx;

            return (
              <div
                key={idx}
                style={{
                  transform: `rotate(${angle}deg)`,
                  opacity: fadeOutNonWinner
                    ? 0
                    : Math.max(0.25, 1 - motionBlurOpacity * 0.65),
                }}
                className="absolute inset-0 flex items-start justify-center pointer-events-none transition-opacity duration-300"
              >
                {isLeaf && leafMult ? (
                  <div className="mt-[1.5%] flex flex-col items-center">
                    <div className="-rotate-90">
                      <TwinLeafIcon variant="gold" size={13.5} />
                    </div>
                    <span
                      className="font-display font-black text-[8.5px] text-[#fde047] leading-none mt-[1px] -rotate-90"
                      style={{
                        textShadow:
                          '0 1px 0 #713f12, 0 -0.8px 0 #713f12, 0.8px 0 0 #713f12, -0.8px 0 0 #713f12',
                      }}
                    >
                      {leafMult}x
                    </span>
                  </div>
                ) : (
                  fishMult && (
                    /* Icy Frost 2x/3x/4x badge near the outer rim of boosted fish wedges */
                    <div className="mt-[2.2%] flex flex-col items-center">
                      <span
                        className="font-display font-black text-[9px] text-[#e0f2fe] leading-none -rotate-90"
                        style={{
                          WebkitTextStroke: '0.7px #0369a1',
                          textShadow:
                            '0 1px 2px rgba(12,74,110,0.95), 0 0 4px rgba(255,255,255,0.9)',
                        }}
                      >
                        {fishMult}x
                      </span>
                    </div>
                  )
                )}
              </div>
            );
          })}

          {/* 2b. Authentic Top-to-Bottom Winning Wedge Highlight Layer during RESULT_REVEAL */}
          {phase === 'RESULT_REVEAL' && winningSegmentIndex !== null && (
            <div
              style={{
                transform: `rotate(${winningSegmentIndex * sliceDeg}deg)`,
              }}
              className="absolute inset-0 pointer-events-none z-15"
            >
              <svg
                viewBox="0 0 1000 1000"
                className="w-full h-full animate-wedge-sweep"
              >
                <defs>
                  <linearGradient
                    id="winningWedgeGrad"
                    x1="500"
                    y1="0"
                    x2="500"
                    y2="400"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
                    <stop offset="45%" stopColor="#f8fafc" stopOpacity="0.62" />
                    <stop offset="85%" stopColor="#e0f2fe" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Exact 6.6667-degree wedge sector from outer rim (r=500) to center hub (r=120) */}
                <path
                  d="M 470.9 0.85 A 500 500 0 0 1 529.1 0.85 L 507.0 380.2 L 493.0 380.2 Z"
                  fill="url(#winningWedgeGrad)"
                  stroke="rgba(255, 255, 255, 0.92)"
                  strokeWidth="3.2"
                />
              </svg>
            </div>
          )}
        </div>

        {/* 3a. Stationary Grey Metallic V-Support Bracket at 12 O'Clock (NEVER shakes or moves!) */}
        <div
          style={{
            left: '43.6%',
            top: '0%',
            width: '12.8%',
            height: '6.4%',
          }}
          className="absolute pointer-events-none z-25 overflow-hidden"
        >
          <img
            src="/assets/game/top_pointer_clean.png"
            alt="Stationary Wheel Bracket"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain block"
          />
          {/* White downward light pulse inside the V-bracket right as the winning wedge is selected (matches 00:18.4 in Original Video) */}
          {phase === 'RESULT_REVEAL' && (
            <div
              style={{
                clipPath: 'polygon(14% 0%, 86% 0%, 53% 94%, 47% 94%)',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.45) 65%, rgba(255,255,255,0) 100%)',
              }}
              className="absolute inset-0 pointer-events-none mix-blend-screen animate-bracket-glow"
            />
          )}
        </div>

        {/* 3b. Authentic 3D Crimson-Red Pointer Flapper ("ऊपर वाला लाल दांती/डंडी")
            Driven at 60fps by continuous peg-contact physics so it lifts and snaps smoothly with every peg! */}
        <div
          style={{
            left: '49.26%',
            top: '4.45%',
            width: '1.48%',
            height: '2.82%',
            transformOrigin: '50% 10%',
            transform: `rotate(${flapperAngle}deg)`,
          }}
          className="absolute pointer-events-none z-22 will-change-transform"
        >
          <svg
            viewBox="0 0 24 46"
            className="w-full h-full overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]"
          >
            <defs>
              <linearGradient id="crimsonFlapperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="28%" stopColor="#ef4444" />
                <stop offset="65%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>
            {/* Dark metallic pivot collar inside V-bracket notch */}
            <ellipse cx="12" cy="5" rx="5.5" ry="3.5" fill="#27272a" />
            {/* 3D tapered crimson rubber/plastic pointer paddle */}
            <path
              d="M 6.5 4.5 L 17.5 4.5 L 15.8 39.5 C 15.5 43.2 8.5 43.2 8.2 39.5 Z"
              fill="url(#crimsonFlapperGrad)"
              stroke="#450a0a"
              strokeWidth="1.1"
            />
            {/* Specular highlight streak down the left side of the red paddle */}
            <path
              d="M 8.8 7 L 10.6 7 L 10.1 37.5 L 8.6 37.5 Z"
              fill="rgba(255, 255, 255, 0.38)"
            />
          </svg>
        </div>

        {/* 4a. White 3D Snowball Projectiles Shooting Outward from Center Hub to Boosted Wedges
            (Matches Original Video 00:11, 00:31, 00:51, 01:11 where snowballs shoot out from the spinning center coin!) */}
        {isLaunchingMultipliers &&
          boostedIndices.map((segIdx, i) => {
            const worldAngleDeg = (segIdx * sliceDeg + rotationDeg) % 360;
            const rad = ((worldAngleDeg - 90) * Math.PI) / 180;
            const targetDistPx = 112;
            const tx = Math.cos(rad) * targetDistPx;
            const ty = Math.sin(rad) * targetDistPx;
            return (
              <div
                key={`snowball-${segIdx}`}
                style={
                  {
                    left: '50%',
                    top: '36.67%',
                    '--tx': `${tx}px`,
                    '--ty': `${ty}px`,
                    animationDelay: `${i * 55}ms`,
                  } as React.CSSProperties
                }
                className="absolute -ml-[9px] -mt-[9px] w-[18px] h-[18px] rounded-full pointer-events-none z-24 animate-snowball-shoot"
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 35%, #ffffff 0%, #f1f5f9 55%, #bae6fd 85%, #7dd3fc 100%)',
                    boxShadow:
                      '0 0 10px rgba(255,255,255,0.95), 0 2px 5px rgba(0,0,0,0.35)',
                  }}
                />
              </div>
            );
          })}

        {/* 4b. Subtle Golden Ice Shockwave Ripple when Multiplier Triggers */}
        {phase === 'MULTIPLIER_SPIN' && (
          <div
            style={{
              left: '33%',
              top: '23%',
              width: '34%',
              height: '27%',
            }}
            className="absolute flex items-center justify-center pointer-events-none z-19"
          >
            <div
              className="w-full h-full rounded-full animate-ice-splash"
              style={{
                background:
                  'radial-gradient(circle, rgba(254,240,138,0.65) 0%, rgba(250,204,21,0.3) 45%, rgba(250,204,21,0) 75%)',
              }}
            />
          </div>
        )}

        {/* 5 & 6. Center Medallion Hub (cx=540, cy=495, D=192):
            Performs a true 3D vertical-axis coin spin (rotateY) showing its gleaming golden back face
            during MULTIPLIER_SPIN while snowballs shoot outward, then lands back on "ICE FISHING" before SPINNING! */}
        <div
          style={{
            left: '41.11%',
            top: '29.56%',
            width: '17.78%',
            height: '14.22%',
            perspective: '700px',
          }}
          className="absolute z-25 flex items-center justify-center pointer-events-none"
        >
          {isLaunchingMultipliers ? (
            /* 3D Two-Sided Coin Spin Container (Front = ICE FISHING, Back = Solid Gold Medallion) */
            <div
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full h-full rounded-full animate-coin-spin-3d"
            >
              {/* Front Face: ICE FISHING Logo */}
              <div
                style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 rounded-full overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              >
                <img
                  src="/assets/game/hub_ice_fishing.png"
                  alt="Ice Fishing Center Hub"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full block"
                />
              </div>

              {/* Back Face: Gleaming Solid Gold Medallion (with optional 2x preview) */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="absolute inset-0 rounded-full overflow-hidden shadow-[0_4px_14px_rgba(250,204,21,0.55)] flex items-center justify-center"
              >
                <img
                  src="/assets/game/hub_gold_base.png"
                  alt="Golden Multiplier Hub"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full block"
                />
                {centerMultiplierPreview && (
                  <span
                    className="absolute font-display font-black text-[22px] tracking-tight leading-none select-none"
                    style={{
                      color: '#facc15',
                      WebkitTextStroke: '1.2px #6b380a',
                      textShadow:
                        '0 1.5px 0 #5c2d06, 0 -1px 0 #5c2d06, 1px 0 0 #5c2d06, -1px 0 0 #5c2d06, 0 2px 3px rgba(0,0,0,0.35)',
                    }}
                  >
                    {centerMultiplierPreview}x
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              key={showGoldenCenterHub ? 'hub-gold' : 'hub-ice'}
              className="relative w-full h-full rounded-full overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center animate-hub-flip"
            >
              {showGoldenCenterHub ? (
                <>
                  <img
                    src="/assets/game/hub_gold_base.png"
                    alt="Golden Multiplier Hub"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full block"
                  />
                  <span
                    className="absolute font-display font-black text-[22px] tracking-tight leading-none select-none"
                    style={{
                      color: '#facc15',
                      WebkitTextStroke: '1.2px #6b380a',
                      textShadow:
                        '0 1.5px 0 #5c2d06, 0 -1px 0 #5c2d06, 1px 0 0 #5c2d06, -1px 0 0 #5c2d06, 0 2px 3px rgba(0,0,0,0.35)',
                    }}
                  >
                    {centerMultiplierPreview}x
                  </span>
                </>
              ) : (
                <img
                  src="/assets/game/hub_ice_fishing.png"
                  alt="Ice Fishing Center Hub"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full block"
                />
              )}
            </div>
          )}
        </div>

        {/* 7. Real 3D Translucent Ice Block Result Popup during RESULT_REVEAL (ONLY for 1:1 Leaf segments — never for Fish Bonus segments!) */}
        {phase === 'RESULT_REVEAL' &&
          winningSegment &&
          (winningSegment.type === 'WHITE_LEAF' ||
            winningSegment.type === 'BLUE_LEAF') && (
            <div
              style={{
                left: '35.93%',
                top: '26.67%',
                width: '28.15%',
                height: '18.52%',
              }}
              className="absolute z-30 flex items-center justify-center pointer-events-none animate-ice-block"
            >
              <img
                src="/assets/game/ice_block_base.png"
                alt="Result Ice Block"
                referrerPolicy="no-referrer"
                className="w-full h-full object-fill drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
                {lastWinAmount > 0 ? (
                  <div className="flex flex-col items-center justify-center -mt-1">
                    <div className="relative flex items-center justify-center">
                      <TwinLeafIcon
                        variant={
                          winningMult
                            ? 'gold'
                            : winningSegment.type === 'WHITE_LEAF'
                            ? 'white'
                            : 'blue'
                        }
                        size={32}
                      />

                      {winningMult && (
                        <span
                          className="absolute -right-7 -top-0.5 font-display font-black text-[16px] text-[#fbbf24] leading-none"
                          style={{
                            textShadow:
                              '0 1.5px 0 #78350f, 0 -1px 0 #78350f, 1px 0 0 #78350f, -1px 0 0 #78350f, 0 2px 4px rgba(0,0,0,0.45)',
                          }}
                        >
                          {winningMult}x
                        </span>
                      )}
                    </div>

                    <div className="font-sans font-semibold text-[10px] tracking-[0.06em] uppercase text-[#24435c] leading-none mt-1">
                      YOU WIN
                    </div>

                    <div
                      className="font-display font-black text-[20px] text-[#fbbf24] leading-none mt-0.5"
                      style={{
                        textShadow:
                          '0 1.5px 0 #6b3410, 0 -1px 0 #6b3410, 1px 0 0 #6b3410, -1px 0 0 #6b3410, 0 3px 5px rgba(0,0,0,0.4)',
                      }}
                    >
                      ₹{lastWinAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    <TwinLeafIcon
                      variant={
                        winningMult
                          ? 'gold'
                          : winningSegment.type === 'WHITE_LEAF'
                          ? 'white'
                          : 'blue'
                      }
                      size={40}
                    />

                    {winningMult && (
                      <span
                        className="absolute -right-7 top-0 font-display font-black text-[17px] text-[#fbbf24] leading-none"
                        style={{
                          textShadow:
                            '0 1.5px 0 #78350f, 0 -1px 0 #78350f, 1px 0 0 #78350f, -1px 0 0 #78350f, 0 2px 4px rgba(0,0,0,0.45)',
                        }}
                      >
                        {winningMult}x
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
