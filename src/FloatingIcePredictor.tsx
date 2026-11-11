import React, { useEffect, useRef, useState } from 'react';
import { BetSpotId, RoundOutcomePlan } from '../data/wheelConfig';
import { TwinLeafIcon } from './IceWheelCanvas';
import { soundEngine } from '../utils/soundEngine';

const PREDICTOR_GIF_URL =
  'https://i.supaimg.com/7476596c-0dc0-4047-81db-54f6d0845ec5/4c1bad70-e23f-4e5b-9204-cb2103e5b85f.gif';

/**
 * Authentic Circular Fish Badge for the History Strip & Game History
 * (100% matches Original Game Screenshot 1: Red/Blue/Orange circular badge with white curved jumping fish silhouette inside!)
 */
export const HistoryFishBadge: React.FC<{
  type: BetSpotId;
  size?: number;
  isLatest?: boolean;
}> = ({ type, size = 23, isLatest = false }) => {
  const bgStyle =
    type === 'HUGE_REDS'
      ? 'linear-gradient(180deg, #ef4444 0%, #b91c1c 65%, #7f1d1d 100%)'
      : type === 'BIG_ORANGES'
      ? 'linear-gradient(180deg, #fbbf24 0%, #d97706 65%, #78350f 100%)'
      : 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 65%, #1e3a8a 100%)';

  const borderColor = isLatest
    ? '#ffffff'
    : type === 'HUGE_REDS'
    ? 'rgba(252, 165, 165, 0.85)'
    : type === 'BIG_ORANGES'
    ? 'rgba(253, 224, 71, 0.85)'
    : 'rgba(147, 197, 253, 0.85)';

  return (
    <div
      style={{
        width: size,
        height: size,
        background: bgStyle,
        borderColor,
        borderWidth: isLatest ? 2.2 : 1.4,
      }}
      className="rounded-full border flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.55)] shrink-0 relative overflow-hidden"
    >
      {/* Subtle top glossy arc */}
      <div
        className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
      {/* White Curved Jumping Fish Silhouette Icon (Matches Original Game History Fish Icon) */}
      <svg
        width={Math.round(size * 0.68)}
        height={Math.round(size * 0.68)}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
      >
        <path
          d="M4.2 8.2 C7.2 4.5, 13.5 5.2, 16.8 9.6 C18.4 11.7, 19.2 14.2, 19.3 16.5 L22.2 18.2 L20.1 19.6 L18.2 18.3 L16.2 20.6 L15.6 17.8 C13.5 16.4, 11.4 14.1, 9.8 12.2 L7.1 13.4 L8.1 10.6 C6.4 9.8, 5.1 9.1, 4.2 8.2 Z"
          fill="#FFFFFF"
        />
        {/* Dorsal Fin */}
        <path
          d="M11.2 6.2 C13.2 4.2, 15.8 4.6, 16.5 6.8 C14.8 6.5, 12.8 6.4, 11.2 6.2 Z"
          fill="#FFFFFF"
        />
        {/* Eye Cutout */}
        <circle
          cx="7.4"
          cy="8.3"
          r="0.95"
          fill={
            type === 'HUGE_REDS'
              ? '#991b1b'
              : type === 'BIG_ORANGES'
              ? '#92400e'
              : '#1e40af'
          }
        />
      </svg>
    </div>
  );
};

interface FloatingIcePredictorProps {
  upcomingPlan: RoundOutcomePlan;
  isVisible: boolean;
  onCloseExit: () => void;
  onScanRequest: () => void;
}

export const FloatingIcePredictor: React.FC<FloatingIcePredictorProps> = ({
  upcomingPlan,
  isVisible,
  onCloseExit,
  onScanRequest,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [revealedRound, setRevealedRound] = useState<number | null>(null);
  const [gifError, setGifError] = useState<boolean>(false);

  // Separate drag positions for the Floating Widget and the Minimized Bubble
  const [boxPos, setBoxPos] = useState<{ x: number; y: number } | null>(null);
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(
    null
  );

  const scanTimerRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    target: 'box' | 'bubble' | null;
    startX: number;
    startY: number;
    initLeft: number;
    initTop: number;
    moved: boolean;
  }>({
    target: null,
    startX: 0,
    startY: 0,
    initLeft: 0,
    initTop: 0,
    moved: false,
  });

  const boxRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        window.clearTimeout(scanTimerRef.current);
      }
    };
  }, []);

  // Global mouse/touch move & up handlers for smooth dragging anywhere on screen
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number, e?: Event) => {
      const st = dragStateRef.current;
      if (!st.target) return;
      const dx = clientX - st.startX;
      const dy = clientY - st.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        st.moved = true;
        if (e && e.cancelable) e.preventDefault();
        const nextX = Math.max(
          4,
          Math.min(window.innerWidth - 70, st.initLeft + dx)
        );
        const nextY = Math.max(
          4,
          Math.min(window.innerHeight - 70, st.initTop + dy)
        );
        if (st.target === 'box') {
          setBoxPos({ x: nextX, y: nextY });
        } else {
          setBubblePos({ x: nextX, y: nextY });
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY, e);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY, e);
      }
    };
    const onEnd = () => {
      dragStateRef.current.target = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  if (!isVisible) return null;

  const startDrag = (
    target: 'box' | 'bubble',
    clientX: number,
    clientY: number,
    targetEl: HTMLElement | null
  ) => {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    dragStateRef.current = {
      target,
      startX: clientX,
      startY: clientY,
      initLeft: rect.left,
      initTop: rect.top,
      moved: false,
    };
  };

  const handleGetResult = () => {
    if (isScanning) return;
    soundEngine.playMultiplierSplash();
    onScanRequest();
    setIsScanning(true);

    if (scanTimerRef.current) {
      window.clearTimeout(scanTimerRef.current);
    }

    scanTimerRef.current = window.setTimeout(() => {
      setIsScanning(false);
      setRevealedRound(upcomingPlan.roundNumber);
      soundEngine.playResultChime(true);
    }, 1650);
  };

  const isCurrentRoundRevealed = revealedRound === upcomingPlan.roundNumber;
  const winnerType = upcomingPlan.winnerType;
  const isFishBonus =
    winnerType === 'LIL_BLUES' ||
    winnerType === 'BIG_ORANGES' ||
    winnerType === 'HUGE_REDS';

  const resultLabelText = !isCurrentRoundRevealed
    ? 'SAFE CASH OUT'
    : winnerType === 'WHITE_LEAF'
    ? 'WHITE LEAF (1:1)'
    : winnerType === 'BLUE_LEAF'
    ? 'BLUE LEAF (1:1)'
    : winnerType === 'LIL_BLUES'
    ? "LIL' BLUES BONUS"
    : winnerType === 'BIG_ORANGES'
    ? 'BIG ORANGES BONUS'
    : 'HUGE REDS BONUS';

  const fishCardSrc =
    winnerType === 'LIL_BLUES'
      ? '/assets/game/card_lil_blues.png'
      : winnerType === 'BIG_ORANGES'
      ? '/assets/game/card_big_oranges.png'
      : '/assets/game/card_huge_reds.png';

  const displayMult = isFishBonus
    ? upcomingPlan.finalBonusMult
    : upcomingPlan.appliedMult > 1
    ? upcomingPlan.appliedMult
    : undefined;

  return (
    <>
      {/* 7PX MULTI-COLOR PULSING GRID + RED LASER SCANNER OVERLAY */}
      {isScanning && (
        <div
          id="transparent-scanner"
          className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
        >
          <div className="absolute inset-0 predictor-scanner-grid" />
          <div className="absolute left-0 w-full predictor-laser-beam" />
        </div>
      )}

      {/* MINIMIZED FLOATING BUBBLE */}
      {isMinimized ? (
        <div
          ref={bubbleRef}
          id="minimized-bubble"
          onMouseDown={(e) =>
            startDrag('bubble', e.clientX, e.clientY, bubbleRef.current)
          }
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              startDrag(
                'bubble',
                e.touches[0].clientX,
                e.touches[0].clientY,
                bubbleRef.current
              );
            }
          }}
          onClick={() => {
            if (dragStateRef.current.moved) {
              dragStateRef.current.moved = false;
              return;
            }
            setIsMinimized(false);
          }}
          style={
            bubblePos
              ? {
                  left: `${bubblePos.x}px`,
                  top: `${bubblePos.y}px`,
                  right: 'auto',
                  background:
                    'conic-gradient(#00E5FF, #FFFFFF, #FF9F1C, #00E5FF)',
                }
              : {
                  top: '90px',
                  right: '20px',
                  background:
                    'conic-gradient(#00E5FF, #FFFFFF, #FF9F1C, #00E5FF)',
                }
          }
          className="fixed w-[62px] h-[62px] rounded-full p-[4px] shadow-[0_4px_14px_rgba(0,229,255,0.8)] z-[9000] touch-none cursor-pointer select-none"
        >
          <div className="w-full h-full rounded-full bg-[#040D1A] border-2 border-white overflow-hidden flex items-center justify-center">
            {!gifError ? (
              <img
                src={PREDICTOR_GIF_URL}
                alt="Ice Predictor Bubble"
                onError={() => setGifError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <HistoryFishBadge type="LIL_BLUES" size={44} />
            )}
          </div>
        </div>
      ) : (
        /* FLOATING ICE PREDICTOR WIDGET */
        <div
          ref={boxRef}
          id="floating-predictor"
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).tagName === 'BUTTON') return;
            startDrag('box', e.clientX, e.clientY, boxRef.current);
          }}
          onTouchStart={(e) => {
            if ((e.target as HTMLElement).tagName === 'BUTTON') return;
            if (e.touches.length > 0) {
              startDrag(
                'box',
                e.touches[0].clientX,
                e.touches[0].clientY,
                boxRef.current
              );
            }
          }}
          style={
            boxPos
              ? {
                  left: `${boxPos.x}px`,
                  top: `${boxPos.y}px`,
                  transform: 'none',
                }
              : {
                  top: '86px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }
          }
          className="fixed w-[225px] bg-[#040D1A] rounded-[16px] border-[3px] border-[#00E5FF] shadow-[0_10px_28px_rgba(0,0,0,0.85),0_0_18px_rgba(0,229,255,0.35)] overflow-hidden z-[9000] touch-none font-poppins select-none"
        >
          {/* HEADER */}
          <div
            style={{
              background: 'linear-gradient(90deg, #1E62A8 0%, #0A192F 100%)',
            }}
            className="text-white px-[12px] py-[8px] border-b-[3px] border-[#00E5FF] flex justify-between items-center cursor-move"
          >
            <div className="font-black text-[11px] flex items-center gap-[6px] tracking-wide">
              <div className="w-[24px] h-[24px] rounded-full border-2 border-white bg-[#040D1A] overflow-hidden flex items-center justify-center shrink-0">
                {!gifError ? (
                  <img
                    src={PREDICTOR_GIF_URL}
                    alt="Ice Logo"
                    onError={() => setGifError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HistoryFishBadge type="LIL_BLUES" size={20} />
                )}
              </div>
              <span>ICE PREDICTOR</span>
            </div>
            <div className="bg-[#FF9F1C] text-[#040D1A] text-[9px] font-black px-[6px] py-[2px] rounded-[4px] border border-white">
              INDIA
            </div>
          </div>

          {/* BODY */}
          <div
            style={{
              background: 'radial-gradient(circle, #112A46 0%, #040D1A 100%)',
            }}
            className="p-[12px] text-center"
          >
            <div className="bg-[#020813] border-2 border-[#00E5FF] rounded-[10px] px-[8px] py-[10px] mb-[10px] shadow-[inset_0_0_12px_rgba(0,229,255,0.25)]">
              {/* Top Animated Circular Emblem */}
              <div className="w-[48px] h-[48px] mx-auto mb-[4px] rounded-full border-2 border-white overflow-hidden bg-[#0A192F] flex items-center justify-center">
                {!gifError ? (
                  <img
                    src={PREDICTOR_GIF_URL}
                    alt="Anim"
                    onError={() => setGifError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HistoryFishBadge type="LIL_BLUES" size={42} />
                )}
              </div>

              {/* Dynamic Status / Target Label */}
              <div
                className={`text-[9.5px] font-extrabold tracking-[0.8px] uppercase mb-[6px] ${
                  isCurrentRoundRevealed ? 'text-[#fde047]' : 'text-[#8ECAE6]'
                }`}
              >
                {resultLabelText}
              </div>

              {/* Result Box (76x76): Shows "---" until scanned, then pops in the exact Next Round Winner Logo! */}
              <div className="relative w-[78px] h-[78px] mx-auto rounded-[12px] border-2 border-[#00E5FF]/60 bg-[#0A192F]/90 flex justify-center items-center overflow-hidden shadow-[0_0_14px_rgba(0,229,255,0.35)]">
                {!isCurrentRoundRevealed || isScanning ? (
                  <span
                    id="result-placeholder"
                    className="text-[22px] font-black text-white"
                    style={{ textShadow: '0 0 10px #00E5FF' }}
                  >
                    ---
                  </span>
                ) : isFishBonus ? (
                  /* Exact Fish Bonus Logo Card + Fish Badge & Multiplier */
                  <div
                    key={`pred-fish-${upcomingPlan.roundNumber}`}
                    className="relative w-full h-full p-[3px] flex items-center justify-center animate-predictor-pop"
                  >
                    <img
                      src={fishCardSrc}
                      alt={resultLabelText}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-fill rounded-[9px] border border-white/60"
                    />
                    <div className="absolute top-1 left-1">
                      <HistoryFishBadge type={winnerType} size={20} isLatest />
                    </div>
                    {displayMult && (
                      <span
                        className="absolute bottom-1 right-1.5 font-display font-black text-[13px] text-[#fde047] leading-none px-1 py-0.5 rounded bg-black/65 border border-[#fde047]/60"
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.95)',
                        }}
                      >
                        {displayMult}x
                      </span>
                    )}
                  </div>
                ) : (
                  /* Exact White Leaf or Blue Leaf Logo Tile + TwinLeafIcon & Multiplier */
                  <div
                    key={`pred-leaf-${upcomingPlan.roundNumber}`}
                    className={`relative w-[68px] h-[68px] rounded-[10px] border-2 flex flex-col items-center justify-center animate-predictor-pop shadow-inner ${
                      winnerType === 'WHITE_LEAF'
                        ? 'bg-gradient-to-b from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] border-white'
                        : 'bg-gradient-to-b from-[#8da9be] via-[#6e8ea6] to-[#52718a] border-[#bae6fd]'
                    }`}
                  >
                    <TwinLeafIcon
                      variant={
                        displayMult
                          ? 'gold'
                          : winnerType === 'WHITE_LEAF'
                          ? 'white'
                          : 'blue'
                      }
                      size={36}
                    />
                    <span
                      className={`font-poppins font-black text-[9px] tracking-wider uppercase mt-0.5 ${
                        winnerType === 'WHITE_LEAF'
                          ? 'text-[#1e293b]'
                          : 'text-white'
                      }`}
                    >
                      {winnerType === 'WHITE_LEAF' ? 'WHITE 1:1' : 'BLUE 1:1'}
                    </span>

                    {displayMult && (
                      <span
                        className="absolute top-0.5 right-1 font-display font-black text-[12px] text-[#fbbf24] leading-none"
                        style={{
                          textShadow:
                            '0 1.5px 0 #78350f, 0 -1px 0 #78350f, 1px 0 0 #78350f, -1px 0 0 #78350f',
                        }}
                      >
                        {displayMult}x
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* GET RESULT BUTTON */}
            <button
              type="button"
              id="getResultBtn"
              disabled={isScanning}
              onClick={handleGetResult}
              style={{
                background: 'linear-gradient(180deg, #00E5FF 0%, #1E62A8 100%)',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
              }}
              className="w-full text-white border-2 border-white py-[9px] px-[10px] rounded-[8px] text-[13px] font-black flex justify-center items-center gap-[6px] mb-[8px] cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.5)] active:scale-[0.98] transition disabled:opacity-80"
            >
              {isScanning && (
                <div className="w-[17px] h-[17px] border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{isScanning ? 'SCANNING...' : 'GET RESULT'}</span>
            </button>

            {/* HIDE & EXIT SUB BUTTONS */}
            <div className="flex gap-[8px]">
              <button
                type="button"
                id="hidePredictorBtn"
                onClick={() => setIsMinimized(true)}
                className="flex-1 py-[6px] rounded-[7px] text-[11px] font-black border-2 border-white bg-[#0A192F] text-white cursor-pointer active:scale-95 transition"
              >
                HIDE
              </button>
              <button
                type="button"
                id="exitPredictorBtn"
                onClick={onCloseExit}
                className="flex-1 py-[6px] rounded-[7px] text-[11px] font-black border-2 border-white bg-[#E63946] text-white cursor-pointer active:scale-95 transition"
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
