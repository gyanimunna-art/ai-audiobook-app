import React, { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { BetSpotId, BonusSizeTier, WinnerEntry } from '../data/wheelConfig';
import { CasinoChip } from './CasinoChip';
import { soundEngine } from '../utils/soundEngine';

interface BonusFishingModalProps {
  bonusType: BetSpotId;
  sizeTier: BonusSizeTier;
  wheelMultiplier: number;
  finalBonusMultiplier: number;
  stakedAmount: number;
  winAmount: number;
  winnerFeed: {
    totalPlayers: number;
    totalWon: number;
    winners: WinnerEntry[];
  };
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
  onOpenMenu: () => void;
}

type BonusStage = 'ICE_WALL' | 'FISH_SCHOOL' | 'FISHING_LAKE' | 'REWARD_TROPHY';

export const BonusFishingModal: React.FC<BonusFishingModalProps> = ({
  bonusType,
  sizeTier,
  wheelMultiplier,
  finalBonusMultiplier,
  stakedAmount,
  winAmount,
  winnerFeed,
  isAutoPlay,
  onToggleAutoPlay,
  onOpenMenu,
}) => {
  const [stage, setStage] = useState<BonusStage>('ICE_WALL');
  const [reelMult, setReelMult] = useState<number>(1);

  const schoolVideoRef = useRef<HTMLVideoElement | null>(null);
  const fishingVideoRef = useRef<HTMLVideoElement | null>(null);

  // Select the authentic underwater school video for each bonus type
  const schoolVideoSrc =
    bonusType === 'BIG_ORANGES'
      ? '/assets/game/bonus_orange_school.mp4'
      : bonusType === 'HUGE_REDS'
      ? '/assets/game/bonus_red_school.mp4'
      : '/assets/game/bonus_fish_school_clip.mp4';

  // Select the authentic fishing catch video matching BOTH bonusType AND sizeTier (Small Rod vs Large Crane/Chopper vs Colossal Chopper/Robot!)
  const fishingVideoSrc = (() => {
    if (bonusType === 'BIG_ORANGES') {
      if (sizeTier === 'SMALL') return '/assets/game/bonus_orange_rod.mp4';
      if (sizeTier === 'LARGE') return '/assets/game/bonus_orange_crane.mp4';
      return '/assets/game/bonus_orange_chopper.mp4';
    }
    if (bonusType === 'HUGE_REDS') {
      if (sizeTier === 'SMALL') return '/assets/game/bonus_red_rod.mp4';
      if (sizeTier === 'LARGE') return '/assets/game/bonus_red_chopper.mp4';
      return '/assets/game/bonus_red_robot.mp4';
    }
    return '/assets/game/bonus_fishing_clip.mp4';
  })();

  // Select the authentic Trophy Slab reward image for each bonus type
  const rewardImageSrc =
    bonusType === 'BIG_ORANGES'
      ? '/assets/game/bonus_reward_orange.png'
      : bonusType === 'HUGE_REDS'
      ? '/assets/game/bonus_reward_red.png'
      : '/assets/game/bonus_reward_clean.png';

  // Stage progression timeline (Total: 25.0s)
  // 0.0s - 3.0s: Stage 1 (ICE_WALL + Floating 3D Bonus Cube)
  // 3.0s - 9.2s: Stage 2 (FISH_SCHOOL crystal-clear underwater multiplier fish video)
  // 9.2s - 20.4s: Stage 3 (FISHING_LAKE matched to SMALL / LARGE / COLOSSAL fish catch + Single Golden-Framed Icy Multiplier Reel)
  // 20.4s - 25.0s: Stage 4 (REWARD_TROPHY icy fish slab + flying multiplier badge + payout & scrolling top-left winners list)
  useEffect(() => {
    soundEngine.playMultiplierSplash();

    const t1 = window.setTimeout(() => {
      setStage('FISH_SCHOOL');
      soundEngine.playSpinLoop();
    }, 3000);

    const t2 = window.setTimeout(() => {
      setStage('FISHING_LAKE');
    }, 9200);

    const t3 = window.setTimeout(() => {
      setStage('REWARD_TROPHY');
      soundEngine.playResultChime(true);
    }, 20400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  // Adjust video playback rate so each clip fits its stage window smoothly
  useEffect(() => {
    if (stage === 'FISH_SCHOOL' && schoolVideoRef.current) {
      schoolVideoRef.current.currentTime = 0;
      schoolVideoRef.current.playbackRate =
        bonusType === 'LIL_BLUES'
          ? 1.85
          : bonusType === 'BIG_ORANGES'
          ? 1.8
          : 0.85;
      schoolVideoRef.current.play().catch(() => {});
    }
    if (stage === 'FISHING_LAKE' && fishingVideoRef.current) {
      fishingVideoRef.current.currentTime = 0;
      const rate =
        bonusType === 'LIL_BLUES'
          ? sizeTier === 'SMALL'
            ? 1.15
            : 1.55
          : sizeTier === 'SMALL'
          ? 1.75
          : sizeTier === 'LARGE'
          ? 2.85
          : 3.35;
      fishingVideoRef.current.playbackRate = rate;
      fishingVideoRef.current.play().catch(() => {});
    }
  }, [stage, bonusType, sizeTier]);

  // Animate the Single Golden-Framed Icy Multiplier Reel Box continuously from 1x up to the exact random finalBonusMultiplier!
  useEffect(() => {
    if (stage !== 'FISHING_LAKE') return;

    const totalDurationMs = 10400;
    const startTime = performance.now();
    let lastVal = 1;
    setReelMult(1);

    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const p = Math.min(1, elapsed / totalDurationMs);
      const curved = Math.pow(p, sizeTier === 'COLOSSAL' ? 1.85 : 1.35);
      const currentVal = Math.max(
        1,
        Math.min(
          finalBonusMultiplier,
          Math.round(1 + (finalBonusMultiplier - 1) * curved)
        )
      );
      if (currentVal !== lastVal) {
        lastVal = currentVal;
        setReelMult(currentVal);
        soundEngine.playWheelPegTick(0.55);
      }
      if (p >= 1) {
        setReelMult(finalBonusMultiplier);
        window.clearInterval(intervalId);
      }
    }, 110);

    return () => window.clearInterval(intervalId);
  }, [stage, finalBonusMultiplier, sizeTier]);

  const cardImage =
    bonusType === 'LIL_BLUES'
      ? '/assets/game/card_lil_blues.png'
      : bonusType === 'BIG_ORANGES'
      ? '/assets/game/card_big_oranges.png'
      : '/assets/game/card_huge_reds.png';

  const cardAlt =
    bonusType === 'LIL_BLUES'
      ? "Lil' Blues Bonus"
      : bonusType === 'BIG_ORANGES'
      ? 'Big Oranges Bonus'
      : 'Huge Reds Bonus';

  const pillBadgeStyle =
    bonusType === 'BIG_ORANGES'
      ? 'from-[#d97706] via-[#b45309] to-[#78350f] border-[#fcd34d]'
      : bonusType === 'HUGE_REDS'
      ? 'from-[#dc2626] via-[#b91c1c] to-[#7f1d1d] border-[#fca5a5]'
      : 'from-[#0284c7] via-[#0369a1] to-[#0c4a6e] border-[#7dd3fc]';

  // Exact vertical position of the single built-in golden multiplier frame in each fishing video clip so our box covers it 100% with zero double-box artifact
  const goldenFrameTopPct =
    bonusType === 'LIL_BLUES'
      ? '83.1%'
      : bonusType === 'BIG_ORANGES'
      ? '85.2%'
      : '79.1%';

  return (
    <div className="absolute inset-0 z-25 flex flex-col justify-between overflow-hidden select-none bg-[#2c4659]">
      {/* FULL-BLEED BONUS STAGE CONTAINER */}
      <div className="relative inset-0 w-full h-full overflow-hidden">
        {/* STAGE 1 (0.0s - 3.0s): Cracked Frosted "ICE FISHING" Wall + Floating 3D Bonus Cube */}
        {stage === 'ICE_WALL' && (
          <div className="relative w-full h-full">
            <img
              src="/assets/game/bonus_ice_wall.png"
              alt="Ice Fishing Bonus Wall"
              referrerPolicy="no-referrer"
              className="w-full h-full object-fill block"
            />

            {/* Floating 3D Bonus Cube rising from the bottom card into the center over ICE FISHING */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[132px] h-[132px] rounded-2xl overflow-hidden border-2 border-white/85 shadow-[0_18px_40px_rgba(0,0,0,0.75),0_0_28px_rgba(186,230,253,0.85)] animate-bonus-cube-float">
                <img
                  src={cardImage}
                  alt={cardAlt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-fill block"
                />
                {/* Glossy 3D Ice Cube Specular Edge Highlight */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 40%, rgba(0,0,0,0.25) 100%)',
                    boxShadow: 'inset 0 0 14px rgba(255,255,255,0.8)',
                  }}
                />
                {wheelMultiplier > 1 && (
                  <span
                    className="absolute top-1.5 right-2 font-display font-black text-[20px] text-[#fbbf24] leading-none"
                    style={{
                      textShadow:
                        '0 2px 0 #78350f, 0 -1px 0 #78350f, 1px 0 0 #78350f, -1px 0 0 #78350f',
                    }}
                  >
                    {wheelMultiplier}x
                  </span>
                )}
                {stakedAmount > 0 && (
                  <div className="absolute bottom-1.5 right-1.5">
                    <CasinoChip value={stakedAmount} size={28} showRupeePrefix />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2 (3.0s - 9.2s): Crystal-Clear Authentic Underwater Fish-School Video (Matches Image 3 with multipliers printed directly on the swimming fish bodies) */}
        {stage === 'FISH_SCHOOL' && (
          <div className="relative w-full h-full bg-[#06182c]">
            <video
              ref={schoolVideoRef}
              src={schoolVideoSrc}
              muted
              playsInline
              autoPlay
              loop
              className="w-full h-full object-fill block"
            />
          </div>
        )}

        {/* STAGE 3 (9.2s - 20.4s): Authentic Arctic Frozen Lake Catch + Single Golden-Bordered Light-Icy-Blue Multiplier Frame (100% Match to Image 4) */}
        {stage === 'FISHING_LAKE' && (
          <div className="relative w-full h-full bg-[#1e3547]">
            <video
              ref={fishingVideoRef}
              src={fishingVideoSrc}
              muted
              playsInline
              autoPlay
              className="w-full h-full object-fill block"
            />

            {/* Single Golden-Bordered Light-Icy-Blue Multiplier Frame positioned directly over the video's frame (Matches Image 4) */}
            <div
              style={{
                left: '50%',
                top: goldenFrameTopPct,
                width: '17.4%',
                height: '6.8%',
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
            >
              {/* Outer 3D Golden Metallic Frame */}
              <div
                className="w-full h-full p-[3.5px] rounded-[7px] shadow-[0_4px_12px_rgba(0,0,0,0.45)] flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(180deg, #fde047 0%, #f59e0b 50%, #b45309 100%)',
                }}
              >
                {/* Inner Light Icy-Blue/White Rectangle (Exact match to Original Game Image 4) */}
                <div
                  className="w-full h-full rounded-[4px] flex items-center justify-center shadow-inner"
                  style={{
                    background:
                      'linear-gradient(180deg, #c7e2f5 0%, #eaf4fc 55%, #d4e9f7 100%)',
                  }}
                >
                  <span
                    key={reelMult}
                    className="font-display font-black text-[20px] leading-none select-none"
                    style={{
                      color: '#f59e0b',
                      WebkitTextStroke: '1px #78350f',
                      textShadow:
                        '0 1.5px 0 #5c2d06, 0 -0.8px 0 #5c2d06, 0.8px 0 0 #5c2d06, -0.8px 0 0 #5c2d06, 0 2px 3px rgba(0,0,0,0.25)',
                    }}
                  >
                    {reelMult}x
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4 (20.4s - 25.0s): Icy Fish Trophy Slab (Blue, Orange, or Red Fish) + Flying Multiplier Pill Badge + Scrolling Top-Left Winners List */}
        {stage === 'REWARD_TROPHY' && (
          <div className="relative w-full h-full">
            <img
              src={rewardImageSrc}
              alt="Bonus Reward Trophy Slab"
              referrerPolicy="no-referrer"
              className="w-full h-full object-fill block"
            />

            {/* Top-Left Continuously Upward-Scrolling Bonus Winners Feed */}
            <div className="absolute top-[98px] left-2.5 z-20 w-[185px] pointer-events-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]">
              {/* Pinned Top Summary Line */}
              <div className="font-bold text-[11px] flex items-center gap-1 mb-0.5 bg-black/15 px-1 py-0.5 rounded">
                <span className="text-white/95">
                  {winnerFeed.totalPlayers}
                </span>
                <span className="text-white/90 text-[9.5px]">👤</span>
                <span className="text-[#fbbf24]">
                  WON ₹{winnerFeed.totalWon.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Vertically Scrolling Marquee Window where old entries move up & disappear and fresh entries enter from bottom */}
              <div
                className="relative h-[86px] overflow-hidden"
                style={{
                  maskImage:
                    'linear-gradient(to bottom, transparent 0%, black 14%, black 82%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 0%, black 14%, black 82%, transparent 100%)',
                }}
              >
                <div className="animate-winner-scroll-up space-y-0.5 text-[11px]">
                  {[...winnerFeed.winners, ...winnerFeed.winners].map(
                    (w, idx) => (
                      <div
                        key={`${w.id}-${idx}`}
                        className={`font-semibold leading-tight flex items-center gap-1 truncate ${
                          w.isCurrentUser
                            ? 'bg-[#fbbf24]/25 px-1 rounded border border-[#fbbf24]/50'
                            : ''
                        }`}
                      >
                        <span className="text-[#fbbf24] font-bold">
                          ₹{w.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[#fde047] font-extrabold">
                          {finalBonusMultiplier}x
                        </span>
                        <span
                          className={
                            w.isCurrentUser
                              ? 'text-white font-bold'
                              : 'text-white/90'
                          }
                        >
                          {w.username}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* 3D Pill Badge Above the Caught Fish (Covers the underlying badge in all 3 reward images and displays the exact dynamic {finalBonusMultiplier}x!) */}
            <div
              style={{
                left: '52.8%',
                top: '45.2%',
                width: '25.5%',
                height: '6.8%',
              }}
              className="absolute flex items-center justify-center pointer-events-none z-20 animate-mult-fly"
            >
              <div
                className={`w-full h-full rounded-xl bg-gradient-to-b ${pillBadgeStyle} border-2 shadow-[0_4px_12px_rgba(0,0,0,0.65)] flex items-center justify-center px-2`}
              >
                <span
                  className="font-display font-black text-[22px] text-[#fde047] leading-none"
                  style={{
                    WebkitTextStroke: '1.1px #713f12',
                    textShadow:
                      '0 2px 0 #451a03, 0 -1px 0 #451a03, 1px 0 0 #451a03, -1px 0 0 #451a03, 0 2px 4px rgba(0,0,0,0.65)',
                  }}
                >
                  {finalBonusMultiplier}x
                </span>
              </div>
            </div>

            {/* Translucent Sculpted Ice Trophy Slab Text Area Below the Fish (left: 25.9%, top: 66.4%, width: 48.2%, height: 14.3%) */}
            <div
              style={{
                left: '25.9%',
                top: '66.4%',
                width: '48.2%',
                height: '14.3%',
              }}
              className="absolute flex flex-col items-center justify-center text-center px-2 pointer-events-none z-20 animate-ice-block"
            >
              {winAmount > 0 ? (
                <>
                  <div className="font-sans font-bold text-[12px] tracking-[0.06em] uppercase text-[#1e3a52] leading-tight">
                    YOU WIN
                  </div>
                  <div
                    className="font-display font-black text-[25px] text-[#fbbf24] leading-tight mt-0.5"
                    style={{
                      WebkitTextStroke: '1.1px #713f12',
                      textShadow:
                        '0 2px 0 #5c2d06, 0 -1px 0 #5c2d06, 1px 0 0 #5c2d06, -1px 0 0 #5c2d06, 0 3px 6px rgba(0,0,0,0.45)',
                    }}
                  >
                    ₹{winAmount.toLocaleString('en-IN')}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="font-sans font-bold text-[13.5px] tracking-wide text-white flex items-center justify-center gap-1 leading-tight"
                    style={{
                      textShadow: '0 1.5px 3px rgba(15,41,66,0.9)',
                    }}
                  >
                    <span>{winnerFeed.totalPlayers}</span>
                    <span className="text-[11.5px]">👤</span>
                    <span>WON</span>
                  </div>
                  <div
                    className="font-display font-black text-[21px] text-[#fde047] leading-tight mt-0.5"
                    style={{
                      WebkitTextStroke: '1px #713f12',
                      textShadow:
                        '0 2px 0 #5c2d06, 0 -1px 0 #5c2d06, 1px 0 0 #5c2d06, -1px 0 0 #5c2d06, 0 2px 5px rgba(0,0,0,0.5)',
                    }}
                  >
                    ₹{winnerFeed.totalWon.toLocaleString('en-IN')}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BONUS DOCK (Single centered winning Bonus Card flanked by Autoplay and Menu — NO "NEXT GAME SOON" text, matching Image 3 & Image 4!) */}
      <div className="absolute inset-x-0 bottom-0 z-30 px-2 pb-1.5 flex flex-col items-center pointer-events-none">
        <div className="w-full flex items-end justify-between px-0.5 pointer-events-auto">
          {/* Left Circular Autoplay Button */}
          <button
            type="button"
            onClick={onToggleAutoPlay}
            className={`w-[38px] h-[38px] rounded-full border border-white/25 flex items-center justify-center shrink-0 mb-0.5 cursor-pointer ${
              isAutoPlay
                ? 'bg-emerald-600/80 text-white'
                : 'bg-[#2a3c4b]/90 text-white/90'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4.5 10.5C5.2 6.8 8.5 4 12.5 4C16.2 4 19.3 6.4 20.3 9.8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <polyline
                points="21 6.5 20.5 10.2 17 9.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.5 13.5C18.8 17.2 15.5 20 11.5 20C7.8 20 4.7 17.6 3.7 14.2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <polyline
                points="3 17.5 3.5 13.8 7 14.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon points="10.2,8.8 15.2,12 10.2,15.2" fill="currentColor" />
            </svg>
          </button>

          {/* Single Centered Winning Bonus Card */}
          <div className="relative w-[84px] h-[68px] rounded-[7px] overflow-hidden border border-white/45 shadow-[0_4px_14px_rgba(0,0,0,0.65)]">
            <img
              src={cardImage}
              alt={cardAlt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-fill block"
            />
            {wheelMultiplier > 1 && (
              <span
                className="absolute top-1 right-1.5 z-20 font-display font-black text-[14px] text-[#fbbf24] leading-none"
                style={{
                  textShadow:
                    '0 1.5px 0 #78350f, 0 -1px 0 #78350f, 1px 0 0 #78350f, -1px 0 0 #78350f',
                }}
              >
                {wheelMultiplier}x
              </span>
            )}
            {stakedAmount > 0 && (
              <div className="absolute bottom-1 right-1 z-20">
                <CasinoChip value={stakedAmount} size={24} showRupeePrefix />
              </div>
            )}
          </div>

          {/* Right Circular Menu Button */}
          <button
            type="button"
            onClick={onOpenMenu}
            className="w-[38px] h-[38px] rounded-full bg-[#2a3c4b]/90 border border-white/25 flex items-center justify-center text-white shrink-0 mb-0.5 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
