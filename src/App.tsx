import React, { useEffect, useRef, useState } from 'react';
import { Menu, RotateCcw, RotateCw, X } from 'lucide-react';
import {
  BetSpotId,
  BonusSizeTier,
  CHIP_OPTIONS,
  generateDynamicWinnerFeed,
  generateRoundOutcomePlan,
  generateFreshInitialBalance,
  generateFreshHistory,
  generateNextLiveChatMessage,
  HistoryItem,
  INITIAL_HISTORY,
  RoundOutcomePlan,
  WHEEL_SEGMENTS,
  WinnerEntry,
} from './data/wheelConfig';
import { CasinoChip } from './components/CasinoChip';
import { IceWheelCanvas, RoundPhase, TwinLeafIcon } from './components/IceWheelCanvas';
import { LiveHostPip } from './components/LiveHostPip';
import { BonusFishingModal } from './components/BonusFishingModal';
import { MenuSheet } from './components/MenuSheet';
import { FloatingIcePredictor, HistoryFishBadge } from './components/FloatingIcePredictor';
import { soundEngine } from './utils/soundEngine';

interface BetAction {
  spots: { spot: BetSpotId; amount: number }[];
}

interface FlyingChip {
  id: string;
  value: number;
  targetSpot: BetSpotId;
}

export default function App() {
  // Fresh randomized balance between ₹10,000 and ₹99,990 on every app enter/refresh (as requested by user)
  const [balance, setBalance] = useState<number>(() => generateFreshInitialBalance());

  // Game round state + Pre-computed upcoming round plan (used by both the Wheel Spin and the Floating Ice Predictor!)
  const [phase, setPhase] = useState<RoundPhase>('BETTING');
  const [timeLeft, setTimeLeft] = useState<number>(7);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [upcomingPlan, setUpcomingPlan] = useState<RoundOutcomePlan>(() =>
    generateRoundOutcomePlan(1, INITIAL_HISTORY)
  );
  const [isPredictorVisible, setIsPredictorVisible] = useState<boolean>(true);

  // Selected chip & radial chip selector menu
  const [selectedChip, setSelectedChip] = useState<number>(50);
  const [isChipTrayOpen, setIsChipTrayOpen] = useState<boolean>(false);

  // Bets on table
  const [bets, setBets] = useState<Record<BetSpotId, number>>({
    WHITE_LEAF: 0,
    BLUE_LEAF: 0,
    LIL_BLUES: 0,
    BIG_ORANGES: 0,
    HUGE_REDS: 0,
  });
  const [betStack, setBetStack] = useState<BetAction[]>([]);
  const [lastRoundBets, setLastRoundBets] = useState<Record<BetSpotId, number> | null>(null);
  const [flyingChips, setFlyingChips] = useState<FlyingChip[]>([]);

  // Autoplay
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);

  // Wheel rotation & animation
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [flapperAngle, setFlapperAngle] = useState<number>(0);
  const [spinSpeedRatio, setSpinSpeedRatio] = useState<number>(0);
  const [isLaunchingMultipliers, setIsLaunchingMultipliers] = useState<boolean>(false);
  const [segmentMultipliers, setSegmentMultipliers] = useState<Record<number, number>>({});
  const [bonusCardMultipliers, setBonusCardMultipliers] = useState<
    Partial<Record<BetSpotId, number>>
  >({});
  const [centerMultiplierPreview, setCenterMultiplierPreview] = useState<number | null>(null);
  const [winningSegmentIndex, setWinningSegmentIndex] = useState<number | null>(null);
  const [activeBonusModal, setActiveBonusModal] = useState<{
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
  } | null>(null);

  // Win & Status
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [showLastWinLabel, setShowLastWinLabel] = useState<boolean>(false);
  const [showBetsClosedToast, setShowBetsClosedToast] = useState<boolean>(false);
  const [rejectedBetError, setRejectedBetError] = useState<boolean>(false);

  // History, Scrolling Winner Feed, Chat, Clock & Menu
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [activeRoundWinnerFeed, setActiveRoundWinnerFeed] = useState(() =>
    generateDynamicWinnerFeed(1, 4, 0)
  );
  const [liveChatMsg, setLiveChatMsg] = useState<{ user: string; text: string }>(() =>
    generateNextLiveChatMessage('BETTING')
  );
  const [customChatMsg, setCustomChatMsg] = useState<{ user: string; text: string } | null>(
    null
  );
  const [clockStr, setClockStr] = useState<string>('13:29:04');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const rotationRef = useRef<number>(0);
  const betsRef = useRef(bets);
  betsRef.current = bets;
  const balanceRef = useRef(balance);
  balanceRef.current = balance;
  const upcomingPlanRef = useRef(upcomingPlan);
  upcomingPlanRef.current = upcomingPlan;
  const spinSequenceActiveRef = useRef<boolean>(false);
  const roundTimersRef = useRef<number[]>([]);
  const rafIdRef = useRef<number | null>(null);

  const clearAllRoundTimers = () => {
    roundTimersRef.current.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    roundTimersRef.current = [];
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAllRoundTimers();
  }, []);

  const totalBet =
    bets.WHITE_LEAF +
    bets.BLUE_LEAF +
    bets.LIL_BLUES +
    bets.BIG_ORANGES +
    bets.HUGE_REDS;

  // Live clock ticker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setClockStr(`${hh}:${mm}:${ss}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic Live chat ticker with natural randomized intervals (2.2s - 3.6s) and continuously unique messages
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;
    const scheduleNextMsg = () => {
      const delay = 2200 + Math.floor(Math.random() * 1400);
      timerId = setTimeout(() => {
        setCustomChatMsg(null);
        setLiveChatMsg(generateNextLiveChatMessage(phase));
        scheduleNextMsg();
      }, delay);
    };
    scheduleNextMsg();
    return () => clearTimeout(timerId);
  }, [phase]);

  // Spawn flying chip visual
  const triggerFlyingChip = (targetSpot: BetSpotId, value: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFlyingChips((prev) => [...prev, { id, value, targetSpot }]);
    setTimeout(() => {
      setFlyingChips((prev) => prev.filter((c) => c.id !== id));
    }, 360);
  };

  // Place bet on a single spot
  const handlePlaceBet = (spot: BetSpotId) => {
    if (phase !== 'BETTING') {
      setRejectedBetError(true);
      setTimeout(() => setRejectedBetError(false), 2000);
      return;
    }

    if (isChipTrayOpen) {
      setIsChipTrayOpen(false);
    }

    if (balance < selectedChip) {
      return;
    }

    // Give user extra time if they are actively tapping bets near the end of countdown
    setTimeLeft((prev) => (prev > 0 && prev < 3 ? 3 : prev));

    soundEngine.playChipPlace();
    setShowLastWinLabel(false);
    setBalance((prev) => prev - selectedChip);
    setBets((prev) => ({
      ...prev,
      [spot]: prev[spot] + selectedChip,
    }));
    setBetStack((prev) => [...prev, { spots: [{ spot, amount: selectedChip }] }]);
    triggerFlyingChip(spot, selectedChip);
  };

  // Place bet on ALL BONUSES simultaneously (matches 00:47 & 01:09 in video)
  const handleAllBonuses = () => {
    if (phase !== 'BETTING') {
      setRejectedBetError(true);
      setTimeout(() => setRejectedBetError(false), 2000);
      return;
    }

    if (isChipTrayOpen) {
      setIsChipTrayOpen(false);
    }

    const bonusSpots: BetSpotId[] = ['LIL_BLUES', 'BIG_ORANGES', 'HUGE_REDS'];
    const totalCost = selectedChip * 3;
    if (balance < totalCost) return;

    setTimeLeft((prev) => (prev > 0 && prev < 3 ? 3 : prev));

    soundEngine.playChipPlace();
    setShowLastWinLabel(false);
    setBalance((prev) => prev - totalCost);
    setBets((prev) => ({
      ...prev,
      LIL_BLUES: prev.LIL_BLUES + selectedChip,
      BIG_ORANGES: prev.BIG_ORANGES + selectedChip,
      HUGE_REDS: prev.HUGE_REDS + selectedChip,
    }));
    setBetStack((prev) => [
      ...prev,
      {
        spots: bonusSpots.map((spot) => ({ spot, amount: selectedChip })),
      },
    ]);
    bonusSpots.forEach((spot) => triggerFlyingChip(spot, selectedChip));
  };

  // Undo last bet action
  const handleUndo = () => {
    if (phase !== 'BETTING' || betStack.length === 0) return;
    const lastAction = betStack[betStack.length - 1];
    let refund = 0;
    const updatedBets = { ...bets };
    lastAction.spots.forEach(({ spot, amount }) => {
      updatedBets[spot] = Math.max(0, updatedBets[spot] - amount);
      refund += amount;
    });
    soundEngine.playChipPlace();
    setBets(updatedBets);
    setBalance((prev) => prev + refund);
    setBetStack((prev) => prev.slice(0, -1));
  };

  // Repeat previous round bets or Double current bets
  const handleRepeatOrDouble = () => {
    if (phase !== 'BETTING') return;

    setTimeLeft((prev) => (prev > 0 && prev < 3 ? 3 : prev));

    if (totalBet === 0 && lastRoundBets) {
      const needed =
        lastRoundBets.WHITE_LEAF +
        lastRoundBets.BLUE_LEAF +
        lastRoundBets.LIL_BLUES +
        lastRoundBets.BIG_ORANGES +
        lastRoundBets.HUGE_REDS;
      if (needed <= 0 || balance < needed) return;

      soundEngine.playChipPlace();
      setShowLastWinLabel(false);
      setBalance((prev) => prev - needed);
      setBets({ ...lastRoundBets });
      const actions: { spot: BetSpotId; amount: number }[] = [];
      (Object.keys(lastRoundBets) as BetSpotId[]).forEach((spot) => {
        if (lastRoundBets[spot] > 0) {
          actions.push({ spot, amount: lastRoundBets[spot] });
        }
      });
      setBetStack([{ spots: actions }]);
    } else if (totalBet > 0) {
      // Double all current bets
      if (balance < totalBet) return;
      soundEngine.playChipPlace();
      setBalance((prev) => prev - totalBet);
      const actions: { spot: BetSpotId; amount: number }[] = [];
      const doubled: Record<BetSpotId, number> = { ...bets };
      (Object.keys(bets) as BetSpotId[]).forEach((spot) => {
        if (bets[spot] > 0) {
          doubled[spot] = bets[spot] * 2;
          actions.push({ spot, amount: bets[spot] });
        }
      });
      setBets(doubled);
      setBetStack((prev) => [...prev, { spots: actions }]);
    }
  };

  // Continuous physical peg-to-flapper contact calculation:
  // As each of the 54 pegs on the steel rim passes 12 o'clock (clockwise),
  // it physically pushes the red flapper to the right (up to -45 deg) and releases it with a crisp snap!
  const computePegFlapperAngle = (deg: number, speedRatio: number): number => {
    const sliceDeg = 360 / WHEEL_SEGMENTS.length;
    const phaseInSlice = ((deg % sliceDeg) + sliceDeg) % sliceDeg;
    const u = phaseInSlice / sliceDeg; // 0..1 within current 6.667° slice

    // During high-speed spin, flapper rides across the tops of the pegs and flutters rapidly between -24° and -50°
    if (speedRatio > 0.38) {
      const flutter = Math.sin(u * Math.PI * 2);
      return -34 - 15 * flutter * speedRatio;
    }

    // During slow idle rotation or final spin deceleration, each peg physically lifts the flapper (u in 0.26..0.72)
    // and then releases it with a damped spring snap (u in 0.72..0.96)
    let slowAngle = 0;
    if (u >= 0.26 && u < 0.72) {
      const pushProgress = (u - 0.26) / 0.46;
      slowAngle = -45 * Math.pow(pushProgress, 1.12);
    } else if (u >= 0.72 && u < 0.96) {
      const releaseProgress = (u - 0.72) / 0.24;
      slowAngle =
        -45 *
        Math.cos(releaseProgress * Math.PI * 1.35) *
        Math.pow(1 - releaseProgress, 1.65);
    }

    if (speedRatio > 0.05) {
      const blend = (speedRatio - 0.05) / 0.33;
      const fastFlutter = -32 - 12 * Math.sin(u * Math.PI * 2);
      return slowAngle * (1 - blend) + fastFlutter * blend;
    }

    return slowAngle;
  };

  // Slow continuous wheel rotation during BETTING, BETS_CLOSED, and MULTIPLIER_SPIN
  // ("जब टाइमर चलता है तो बिल हल्का-हल्का घूमता रहता है")
  useEffect(() => {
    if (
      phase !== 'BETTING' &&
      phase !== 'BETS_CLOSED' &&
      phase !== 'MULTIPLIER_SPIN'
    ) {
      return;
    }

    const idleSpinInterval = window.setInterval(() => {
      const nextDeg = rotationRef.current + 0.12;
      rotationRef.current = nextDeg;
      setRotationDeg(nextDeg);
      setFlapperAngle(computePegFlapperAngle(nextDeg, 0));
    }, 16);

    return () => window.clearInterval(idleSpinInterval);
  }, [phase]);

  // Main BETTING Countdown Loop
  useEffect(() => {
    if (phase !== 'BETTING') return;

    spinSequenceActiveRef.current = false;
    setWinningSegmentIndex(null);
    setSpinSpeedRatio(0);
    setIsLaunchingMultipliers(false);
    setSegmentMultipliers({});
    setBonusCardMultipliers({});
    setCenterMultiplierPreview(null);
    setTimeLeft(9);

    if (upcomingPlanRef.current.roundNumber !== roundNumber) {
      const freshPlan = generateRoundOutcomePlan(roundNumber, history);
      upcomingPlanRef.current = freshPlan;
      setUpcomingPlan(freshPlan);
    }

    // If Autoplay is active and we have lastRoundBets, automatically repeat them
    if (isAutoPlay && lastRoundBets) {
      const needed =
        lastRoundBets.WHITE_LEAF +
        lastRoundBets.BLUE_LEAF +
        lastRoundBets.LIL_BLUES +
        lastRoundBets.BIG_ORANGES +
        lastRoundBets.HUGE_REDS;
      if (needed > 0 && balanceRef.current >= needed && totalBet === 0) {
        setBalance((prev) => prev - needed);
        setBets({ ...lastRoundBets });
      }
    }

    const countdownInterval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(countdownInterval);
          setPhase('BETS_CLOSED');
          return 0;
        }
        soundEngine.playTimerBeep(prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(countdownInterval);
  }, [phase, roundNumber]);

  // Handle BETS_CLOSED -> MULTIPLIER_SPIN -> SPINNING -> RESULT_REVEAL -> BETTING
  // IMPORTANT: Uses spinSequenceActiveRef so intermediate setPhase calls do NOT cancel timers!
  useEffect(() => {
    if (phase !== 'BETS_CLOSED' || spinSequenceActiveRef.current) return;
    spinSequenceActiveRef.current = true;
    clearAllRoundTimers();

    setIsChipTrayOpen(false);
    setShowBetsClosedToast(true);
    const hideToastTimer = window.setTimeout(() => {
      setShowBetsClosedToast(false);
    }, 1600);
    roundTimersRef.current.push(hideToastTimer);

    // Save current round bets if any were placed
    const currentBets = { ...betsRef.current };
    const sumBets =
      currentBets.WHITE_LEAF +
      currentBets.BLUE_LEAF +
      currentBets.LIL_BLUES +
      currentBets.BIG_ORANGES +
      currentBets.HUGE_REDS;
    if (sumBets > 0) {
      setLastRoundBets({ ...currentBets });
    }

    // Use the exact pre-computed RoundOutcomePlan for this round so the Floating Ice Predictor
    // is 100% accurate and fish bonus multipliers follow the 90% <= 20x / 10% > 20x distribution!
    const plan =
      upcomingPlanRef.current.roundNumber === roundNumber
        ? upcomingPlanRef.current
        : generateRoundOutcomePlan(roundNumber);

    const chosenWinnerIndex = plan.winnerIndex;
    const chosenWinnerSeg = WHEEL_SEGMENTS[chosenWinnerIndex];
    const generatedMultipliers = plan.segmentMultipliers;
    const generatedCardMults = plan.bonusCardMultipliers;

    const finalizeResult = (
      winnerType: BetSpotId,
      multUsed: number | undefined,
      winReturn: number,
      skipWheelRevealPopup = false
    ) => {
      setLastWinAmount(winReturn);

      // Generate a fresh scrolling winner feed for this round (including the user's own win if winReturn > 0!)
      setActiveRoundWinnerFeed(
        generateDynamicWinnerFeed(roundNumber + 1, multUsed, winReturn)
      );

      if (winReturn > 0) {
        setShowLastWinLabel(true);
        setBalance((prev) => prev + winReturn);
      }

      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setHistory((prev) => [
        {
          id: `h-${Date.now()}`,
          winner: winnerType,
          multiplier: multUsed,
          payoutAmount: winReturn,
          timestamp: ts,
        },
        ...prev.slice(0, 19),
      ]);

      // Pre-compute the NEXT round's outcome right away so the Predictor is ready!
      const nextRoundNum = roundNumber + 1;
      const nextPlan = generateRoundOutcomePlan(nextRoundNum, [
        {
          id: `h-${Date.now()}`,
          winner: winnerType,
          multiplier: multUsed,
          payoutAmount: winReturn,
          timestamp: ts,
        },
        ...history,
      ]);
      upcomingPlanRef.current = nextPlan;
      setUpcomingPlan(nextPlan);

      // After a Fish Bonus (LIL_BLUES, BIG_ORANGES, HUGE_REDS) finishes its Trophy Slab reward screen,
      // return directly to BETTING without showing a center ice-block popup on the wheel (Matches Image 2 feedback)!
      if (skipWheelRevealPopup) {
        setBets({
          WHITE_LEAF: 0,
          BLUE_LEAF: 0,
          LIL_BLUES: 0,
          BIG_ORANGES: 0,
          HUGE_REDS: 0,
        });
        setBetStack([]);
        setRoundNumber(nextRoundNum);
        spinSequenceActiveRef.current = false;
        setPhase('BETTING');
        return;
      }

      setPhase('RESULT_REVEAL');
      soundEngine.playResultChime(winReturn > 0);

      const nextRoundTimer = window.setTimeout(() => {
        setBets({
          WHITE_LEAF: 0,
          BLUE_LEAF: 0,
          LIL_BLUES: 0,
          BIG_ORANGES: 0,
          HUGE_REDS: 0,
        });
        setBetStack([]);
        setRoundNumber(nextRoundNum);
        spinSequenceActiveRef.current = false;
        setPhase('BETTING');
      }, 2600);
      roundTimersRef.current.push(nextRoundTimer);
    };

    // Step 1 (0.75s): 3D Center Coin Spin + White Snowball Multiplier Launch (Matches 00:11, 00:31, 00:51, 01:11 of Original Video)
    const multSpinTimer = window.setTimeout(() => {
      setPhase('MULTIPLIER_SPIN');
      setIsLaunchingMultipliers(true);
      soundEngine.playMultiplierSplash();

      if (roundNumber % 3 === 0) {
        setCenterMultiplierPreview(2);
      }

      setSegmentMultipliers(generatedMultipliers);
      setBonusCardMultipliers(generatedCardMults);
    }, 750);
    roundTimersRef.current.push(multSpinTimer);

    // Finish 3D coin flip so center hub rests cleanly on "ICE FISHING" before main spin starts
    const finishCoinFlipTimer = window.setTimeout(() => {
      setIsLaunchingMultipliers(false);
      setCenterMultiplierPreview(null);
    }, 2050);
    roundTimersRef.current.push(finishCoinFlipTimer);

    // Step 2 (2.25s): Transition to 60fps SPINNING with smooth S-curve acceleration, rotational motion blur, and quartic deceleration
    const startSpinTimer = window.setTimeout(() => {
      setIsLaunchingMultipliers(false);
      setCenterMultiplierPreview(null);
      setPhase('SPINNING');
      soundEngine.playSpinLoop();

      const numSegments = WHEEL_SEGMENTS.length;
      const sliceDeg = 360 / numSegments;
      const targetMod = (360 - chosenWinnerIndex * sliceDeg) % 360;
      const startRot = rotationRef.current;
      const currentMod = ((startRot % 360) + 360) % 360;
      let delta = targetMod - currentMod;
      if (delta < 0) delta += 360;

      // Land DEAD-CENTER of the chosen wedge directly under the 12 o'clock crimson flapper pointer
      const totalSpinDelta = 360 * 5 + delta;

      const durationMs = 4800;
      const startTime = performance.now();
      let lastPegIdx = Math.floor(startRot / sliceDeg);

      const animateWheel = (nowTime: number) => {
        const elapsed = nowTime - startTime;
        const progress = Math.min(1, Math.max(0, elapsed / durationMs));

        let eased = 0;
        let speedRatio = 0;
        if (progress < 0.12) {
          const pAcc = progress / 0.12;
          eased = 0.08 * Math.pow(pAcc, 2);
          speedRatio = pAcc;
        } else {
          const pDec = (progress - 0.12) / 0.88;
          eased = 0.08 + 0.92 * (1 - Math.pow(1 - pDec, 3.6));
          speedRatio = Math.pow(1 - pDec, 2.35);
        }

        const currentDeg = startRot + totalSpinDelta * eased;

        rotationRef.current = currentDeg;
        setRotationDeg(currentDeg);
        setSpinSpeedRatio(speedRatio);
        setFlapperAngle(computePegFlapperAngle(currentDeg, speedRatio));

        const currentPegIdx = Math.floor(currentDeg / sliceDeg);
        if (currentPegIdx !== lastPegIdx) {
          lastPegIdx = currentPegIdx;
          soundEngine.playWheelPegTick(speedRatio);
        }

        if (progress < 1) {
          rafIdRef.current = window.requestAnimationFrame(animateWheel);
        } else {
          rafIdRef.current = null;
          // Finalize at exact mathematical center of the winning wedge directly under the flapper
          const exactFinalDeg = startRot + totalSpinDelta;
          rotationRef.current = exactFinalDeg;
          setRotationDeg(exactFinalDeg);
          setSpinSpeedRatio(0);
          setFlapperAngle(0);
          setWinningSegmentIndex(chosenWinnerIndex);

          const appliedMult = plan.appliedMult;
          const isBonusSeg =
            chosenWinnerSeg.type === 'LIL_BLUES' ||
            chosenWinnerSeg.type === 'BIG_ORANGES' ||
            chosenWinnerSeg.type === 'HUGE_REDS';

          if (isBonusSeg) {
            const sizeTier = plan.sizeTier;
            const finalBonusMult = plan.finalBonusMult;
            const stakedOnBonus = currentBets[chosenWinnerSeg.type];
            const bonusWin =
              stakedOnBonus > 0 ? stakedOnBonus * finalBonusMult : 0;
            const bonusWinnerFeed = generateDynamicWinnerFeed(
              roundNumber + 1,
              finalBonusMult,
              bonusWin
            );

            // Brief 1.1s pause showing the winning bonus wedge under the pointer before opening the full-stage Bonus Fishing sequence!
            const enterBonusTimer = window.setTimeout(() => {
              setPhase('BONUS_FISHING');
              setActiveBonusModal({
                bonusType: chosenWinnerSeg.type,
                sizeTier,
                wheelMultiplier: appliedMult,
                finalBonusMultiplier: finalBonusMult,
                stakedAmount: stakedOnBonus,
                winAmount: bonusWin,
                winnerFeed: bonusWinnerFeed,
              });

              const bonusTimer = window.setTimeout(() => {
                setActiveBonusModal(null);
                finalizeResult(
                  chosenWinnerSeg.type,
                  finalBonusMult,
                  bonusWin,
                  true
                );
              }, 25000);
              roundTimersRef.current.push(bonusTimer);
            }, 1100);
            roundTimersRef.current.push(enterBonusTimer);
          } else {
            const stakedOnWinner = currentBets[chosenWinnerSeg.type];
            const totalReturn =
              stakedOnWinner > 0
                ? appliedMult > 1
                  ? stakedOnWinner * appliedMult
                  : stakedOnWinner * 2
                : 0;

            finalizeResult(
              chosenWinnerSeg.type,
              appliedMult > 1 ? appliedMult : undefined,
              totalReturn
            );
          }
        }
      };

      rafIdRef.current = window.requestAnimationFrame(animateWheel);
    }, 2250);
    roundTimersRef.current.push(startSpinTimer);
  }, [phase]);

  const activeChat = customChatMsg || liveChatMsg;
  const isBettingPhase = phase === 'BETTING';

  // Radial positions for the 6 chips when the chip selector is opened
  const radialChipAngles = [-152, -121, -90, -59, -28, 3];

  return (
    <div className="w-full h-dvh bg-[#05080c] flex items-center justify-center overflow-hidden select-none">
      {/* Mobile Portrait Game Frame (100% matching 9:20 mobile viewport) */}
      <div className="relative w-full max-w-[430px] h-dvh bg-[#3c576b] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.95)]">
        {/* 1. Top Solid Black Bar with Orange Scorecard Icon Badge (Tap to toggle Ice Predictor if closed) */}
        <div className="h-[34px] bg-black px-2.5 flex items-center justify-between shrink-0 z-30">
          <button
            type="button"
            title="Toggle Ice Predictor"
            onClick={() => setIsPredictorVisible(true)}
            className="w-[26px] h-[26px] rounded-full bg-gradient-to-b from-[#fbbf24] via-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="6.5" cy="6.5" r="2.6" stroke="white" strokeWidth="1.8" />
              <line x1="11.5" y1="4.8" x2="16.5" y2="4.8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="11.5" y1="8.2" x2="16.5" y2="8.2" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="6.5" cy="13.5" r="2.6" stroke="white" strokeWidth="1.8" />
              <circle cx="13.8" cy="13.5" r="2.6" stroke="white" strokeWidth="1.8" />
            </svg>
          </button>
        </div>

        {/* 2. Main Interactive Ice Wheel + Overlays Area */}
        <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
          {/* Wheel Canvas Background Layer */}
          <div className="absolute inset-0 z-0">
            <IceWheelCanvas
              rotationDeg={rotationDeg}
              phase={phase}
              flapperAngle={flapperAngle}
              spinSpeedRatio={spinSpeedRatio}
              isLaunchingMultipliers={isLaunchingMultipliers}
              segmentMultipliers={segmentMultipliers}
              bonusCardMultipliers={bonusCardMultipliers}
              centerMultiplierPreview={centerMultiplierPreview}
              winningSegmentIndex={winningSegmentIndex}
              lastWinAmount={lastWinAmount}
            />
          </div>

          {/* Top Overlay Row: Live Host PIP (Left, hidden during full-screen BONUS_FISHING) + Countdown Timer (Right) */}
          {phase !== 'BONUS_FISHING' && (
            <div className="relative z-20 flex items-start justify-between px-2.5 pt-2 pointer-events-none">
              <div className="pointer-events-auto">
                <LiveHostPip roundNumber={roundNumber} />
              </div>

            {/* Authentic Dark-Slate Translucent Timer with Neon-Green Outer Progress Ring (Matches Screenshot 09-09-21-91.jpg) */}
            {isBettingPhase && (
              <button
                type="button"
                title="Tap to spin immediately"
                onClick={() => setPhase('BETS_CLOSED')}
                className="relative w-[46px] h-[46px] flex items-center justify-center pointer-events-auto cursor-pointer active:scale-95 transition-transform"
              >
                {/* Soft dark outer halo behind timer */}
                <div className="absolute inset-[-4px] rounded-full bg-black/35 blur-[5px] pointer-events-none" />

                <svg className="relative w-full h-full -rotate-90" viewBox="0 0 48 48">
                  {/* Dark translucent slate inner disc */}
                  <circle
                    cx="24"
                    cy="24"
                    r="19.5"
                    fill="rgba(66, 78, 88, 0.86)"
                  />
                  {/* Subtle background ring track */}
                  <circle
                    cx="24"
                    cy="24"
                    r="19.5"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.16)"
                    strokeWidth="3.6"
                  />
                  {/* Neon-green / amber / red progress stroke */}
                  <circle
                    cx="24"
                    cy="24"
                    r="19.5"
                    fill="none"
                    stroke={
                      timeLeft >= 4
                        ? '#22c55e'
                        : timeLeft >= 2
                        ? '#f59e0b'
                        : '#ef4444'
                    }
                    strokeWidth="3.6"
                    strokeDasharray={122.5}
                    strokeDashoffset={122.5 * (1 - timeLeft / 9)}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-linear"
                  />
                </svg>
                <span className="absolute font-sans font-semibold text-[19px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {timeLeft}
                </span>
              </button>
            )}
            </div>
          )}

          {/* Rejected Bet Toast ("Sorry, we couldn't process your bet") */}
          {rejectedBetError && (
            <div className="absolute top-2.5 inset-x-3 z-40 bg-[#1e242b]/95 text-white px-4 py-2.5 rounded-xl flex items-center justify-between shadow-lg border border-white/10">
              <span className="text-xs font-medium">
                Sorry, we couldn&apos;t process your bet
              </span>
              <button
                type="button"
                onClick={() => setRejectedBetError(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Left Continuously Upward-Scrolling Winner History Feed during RESULT_REVEAL and BETTING
              (Matches the red-marked area in the user's screenshot & 01:49 - 01:57 of Big Oranges / 02:00 - 02:06 of Huge Reds:
              old winner entries scroll up and fade out at the top while fresh winner entries continuously enter from below!) */}
          {(phase === 'RESULT_REVEAL' || (isBettingPhase && timeLeft >= 2)) && (
            <div className="absolute top-[74px] left-2.5 z-20 w-[180px] pointer-events-none animate-winner-list drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]">
              {/* Top Summary Line: Total Players + Total Won */}
              <div className="font-bold text-[10.5px] flex items-center gap-1 mb-0.5">
                <span className="text-white/95">
                  {activeRoundWinnerFeed.totalPlayers}
                </span>
                <span className="text-white/90 text-[9px]">👤</span>
                <span className="text-[#fbbf24]">
                  WON ₹{activeRoundWinnerFeed.totalWon.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Continuously Upward-Scrolling Winner Ticker Window */}
              <div
                className="relative h-[84px] overflow-hidden"
                style={{
                  maskImage:
                    'linear-gradient(to bottom, transparent 0%, black 14%, black 82%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 0%, black 14%, black 82%, transparent 100%)',
                }}
              >
                <div
                  key={`feed-${roundNumber}-${activeRoundWinnerFeed.totalWon}`}
                  className="animate-winner-scroll-up space-y-0.5 text-[10.5px]"
                >
                  {[
                    ...activeRoundWinnerFeed.winners,
                    ...activeRoundWinnerFeed.winners,
                  ].map((w, idx) => (
                    <div
                      key={`${w.id}-${idx}`}
                      className={`font-medium leading-tight flex items-center gap-1 truncate ${
                        w.isCurrentUser
                          ? 'bg-[#fbbf24]/25 px-1 rounded border border-[#fbbf24]/50'
                          : ''
                      }`}
                    >
                      <span className="text-[#fbbf24] font-semibold">
                        ₹{w.amount.toLocaleString('en-IN')}
                      </span>
                      {w.multiplier && w.multiplier > 1 && (
                        <span className="text-[#fde047] font-extrabold">
                          {w.multiplier}x
                        </span>
                      )}
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
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Center Status Text ("PLACE YOUR BETS" during betting countdown, or "NEXT GAME SOON") */}
          <div className="relative z-10 flex flex-col items-center justify-end flex-1 pb-2.5 pointer-events-none">
            {isBettingPhase ? (
              <div
                className="font-sans font-medium text-[15px] tracking-[0.04em] text-white uppercase"
                style={{
                  textShadow: '0 1.5px 4px rgba(0,0,0,0.95)',
                }}
              >
                PLACE YOUR BETS
              </div>
            ) : (
              totalBet === 0 &&
              phase !== 'RESULT_REVEAL' &&
              phase !== 'BONUS_FISHING' &&
              !centerMultiplierPreview && (
                <div
                  className="font-sans font-medium text-[13px] tracking-[0.04em] text-white uppercase mb-1.5"
                  style={{
                    textShadow: '0 1.5px 4px rgba(0,0,0,0.95)',
                  }}
                >
                  NEXT GAME SOON
                </div>
              )
            )}
          </div>

          {/* Bottom Interactive Betting Area (Hidden during full-screen BONUS_FISHING so BonusFishingModal shows the single centered winning Bonus Card dock) */}
          {phase !== 'BONUS_FISHING' && (
            <div className="relative z-20 px-2 pb-1 flex flex-col gap-[5px] bg-transparent pt-0.5">
            {/* "Bets are closed" Dark Toast (matches 01:10 & 01:34) */}
            {showBetsClosedToast && (
              <div className="absolute -top-8 left-2.5 z-30 bg-[#262b30]/95 text-white text-[12px] font-medium px-3.5 py-1.5 rounded-lg shadow-lg border border-white/10">
                Bets are closed
              </div>
            )}

            {/* 11 Recent Results History Strip (100% Match to Original Screenshot 1:
                Fish Bonuses show Circular Red/Blue/Orange Fish Logo Badges with white jumping fish silhouette inside,
                while Leaves show 11px White/Blue circles!) */}
            {isBettingPhase && (
              <div className="w-[88%] max-w-[332px] mx-auto flex items-center justify-between py-0.5 mb-0.5">
                {history.slice(0, 11).map((h, idx) => {
                  const isWhite = h.winner === 'WHITE_LEAF';
                  const isFish =
                    h.winner === 'LIL_BLUES' ||
                    h.winner === 'BIG_ORANGES' ||
                    h.winner === 'HUGE_REDS';
                  const dotColorClass = isWhite
                    ? 'bg-[#f8fafc] border-white/90'
                    : 'bg-[#5c8bb0] border-[#8fb2ce]/85';

                  return (
                    <div
                      key={h.id}
                      className="relative flex items-center justify-center"
                      style={{ opacity: idx === 10 ? 0.55 : 1 }}
                    >
                      {h.multiplier && (
                        <span
                          className={`absolute ${
                            isFish ? '-top-3' : '-top-3.5'
                          } z-20 font-display font-black text-[10.5px] text-[#fbbf24] leading-none`}
                          style={{
                            WebkitTextStroke: '0.7px #78350f',
                            textShadow:
                              '0 1px 0 #451a03, 0 1.5px 2px rgba(0,0,0,0.95)',
                          }}
                        >
                          {h.multiplier}x
                        </span>
                      )}

                      {isFish ? (
                        <HistoryFishBadge
                          type={h.winner}
                          size={idx === 0 ? 24 : 22}
                          isLatest={idx === 0}
                        />
                      ) : idx === 0 ? (
                        /* Leftmost latest Leaf result: white target ring around inner dot */
                        <div className="w-[21px] h-[21px] rounded-full border-[2px] border-white flex items-center justify-center shadow-sm bg-black/20">
                          <div
                            className={`w-[11px] h-[11px] rounded-full ${
                              isWhite ? 'bg-[#f1f5f9]' : 'bg-[#5c8bb0]'
                            }`}
                          />
                        </div>
                      ) : (
                        /* Remaining Leaf history dots: crisp 11px circles */
                        <div
                          className={`w-[11px] h-[11px] rounded-full border shadow-sm ${dotColorClass}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Row 1: Two 1:1 Leaf Betting Spots (Centered w-[76%] with side margins matching Original screenshot) */}
            <div
              className={`grid grid-cols-2 gap-1.5 mx-auto transition-all duration-300 ${
                isBettingPhase
                  ? 'w-[76%] max-w-[282px]'
                  : 'w-[68%] max-w-[254px]'
              }`}
            >
              {/* Left 1:1 White Leaf Button */}
              {(() => {
                const isWhiteWinner =
                  phase === 'RESULT_REVEAL' &&
                  winningSegmentIndex !== null &&
                  WHEEL_SEGMENTS[winningSegmentIndex]?.type === 'WHITE_LEAF';
                const whiteWinMult =
                  isWhiteWinner && winningSegmentIndex !== null
                    ? segmentMultipliers[winningSegmentIndex]
                    : undefined;
                const displayWhiteChip =
                  isWhiteWinner && lastWinAmount > 0 && bets.WHITE_LEAF > 0
                    ? lastWinAmount
                    : bets.WHITE_LEAF;

                return (
                  <button
                    type="button"
                    onClick={() => handlePlaceBet('WHITE_LEAF')}
                    className={`relative rounded-[4px] bg-gradient-to-b from-[#e4e9ed] to-[#c4cdd5] border ${
                      isWhiteWinner
                        ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.85)]'
                        : 'border-white/80 shadow-[0_2px_5px_rgba(0,0,0,0.3)]'
                    } flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer ${
                      isBettingPhase ? 'h-[33px]' : 'h-[28px]'
                    }`}
                  >
                    <TwinLeafIcon
                      variant={whiteWinMult ? 'gold' : 'white'}
                      size={isBettingPhase ? 19 : 16}
                    />

                    {isBettingPhase && (
                      <span className="absolute right-2.5 font-sans font-semibold text-[10px] text-[#52697a]">
                        1:1
                      </span>
                    )}

                    {whiteWinMult && (
                      <span
                        className="absolute -top-2 right-1.5 z-20 font-display font-black text-[13px] text-[#fbbf24] leading-none"
                        style={{
                          textShadow:
                            '0 1.5px 0 #78350f, 0 -1px 0 #78350f, 1px 0 0 #78350f, -1px 0 0 #78350f',
                        }}
                      >
                        {whiteWinMult}x
                      </span>
                    )}

                    {displayWhiteChip > 0 && (
                      <div
                        className={`absolute inset-y-0 flex items-center z-10 ${
                          isWhiteWinner && lastWinAmount > 0
                            ? 'left-1.5'
                            : 'inset-x-0 justify-center'
                        }`}
                      >
                        <CasinoChip
                          value={displayWhiteChip}
                          size={isBettingPhase ? 28 : 24}
                          showRupeePrefix={!(isWhiteWinner && lastWinAmount > 0)}
                        />
                      </div>
                    )}
                  </button>
                );
              })()}

              {/* Right 1:1 Blue Leaf Button */}
              {(() => {
                const isBlueWinner =
                  phase === 'RESULT_REVEAL' &&
                  winningSegmentIndex !== null &&
                  WHEEL_SEGMENTS[winningSegmentIndex]?.type === 'BLUE_LEAF';
                const blueWinMult =
                  isBlueWinner && winningSegmentIndex !== null
                    ? segmentMultipliers[winningSegmentIndex]
                    : undefined;
                const displayBlueChip =
                  isBlueWinner && lastWinAmount > 0 && bets.BLUE_LEAF > 0
                    ? lastWinAmount
                    : bets.BLUE_LEAF;

                return (
                  <button
                    type="button"
                    onClick={() => handlePlaceBet('BLUE_LEAF')}
                    className={`relative rounded-[4px] bg-gradient-to-b from-[#9bb4c7] to-[#7c99b0] border ${
                      isBlueWinner
                        ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.85)]'
                        : 'border-[#b8d0e3]/80 shadow-[0_2px_5px_rgba(0,0,0,0.3)]'
                    } flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer ${
                      isBettingPhase ? 'h-[33px]' : 'h-[28px]'
                    }`}
                  >
                    <TwinLeafIcon
                      variant={blueWinMult ? 'gold' : 'blue'}
                      size={isBettingPhase ? 19 : 16}
                    />

                    {isBettingPhase && (
                      <span className="absolute right-2.5 font-sans font-semibold text-[10px] text-[#284358]">
                        1:1
                      </span>
                    )}

                    {blueWinMult && (
                      <span
                        className="absolute -top-2 right-1.5 z-20 font-display font-black text-[13px] text-[#fbbf24] leading-none"
                        style={{
                          textShadow:
                            '0 1.5px 0 #78350f, 0 -1px 0 #78350f, 1px 0 0 #78350f, -1px 0 0 #78350f',
                        }}
                      >
                        {blueWinMult}x
                      </span>
                    )}

                    {displayBlueChip > 0 && (
                      <div
                        className={`absolute inset-y-0 flex items-center z-10 ${
                          isBlueWinner && lastWinAmount > 0
                            ? 'left-1.5'
                            : 'inset-x-0 justify-center'
                        }`}
                      >
                        <CasinoChip
                          value={displayBlueChip}
                          size={isBettingPhase ? 28 : 24}
                          showRupeePrefix={!(isBlueWinner && lastWinAmount > 0)}
                        />
                      </div>
                    )}
                  </button>
                );
              })()}
            </div>

            {/* Row 2: Three Fish Bonus Cards (Compact w-[76%] during BETTING so fish and BONUS text are never oversized or cropped!) */}
            <div className="relative flex items-end justify-between gap-1.5">
              {/* When NOT in BETTING phase, left circular Autoplay button sits next to the compact cards */}
              {!isBettingPhase && (
                <button
                  type="button"
                  onClick={() => setIsAutoPlay((prev) => !prev)}
                  className={`w-[38px] h-[38px] rounded-full border border-white/25 flex items-center justify-center shrink-0 mb-0.5 cursor-pointer ${
                    isAutoPlay ? 'bg-emerald-600/80 text-white' : 'bg-[#2a3c4b]/90 text-white/90'
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
              )}

              <div
                className={`grid grid-cols-3 gap-1.5 mx-auto transition-all duration-300 ${
                  isBettingPhase
                    ? 'w-[76%] max-w-[282px]'
                    : 'w-[68%] max-w-[254px]'
                }`}
              >
                {(
                  [
                    {
                      id: 'LIL_BLUES' as BetSpotId,
                      img: '/assets/game/card_lil_blues.png',
                      alt: "Lil' Blues Bonus",
                    },
                    {
                      id: 'BIG_ORANGES' as BetSpotId,
                      img: '/assets/game/card_big_oranges.png',
                      alt: 'Big Oranges Bonus',
                    },
                    {
                      id: 'HUGE_REDS' as BetSpotId,
                      img: '/assets/game/card_huge_reds.png',
                      alt: 'Huge Reds Bonus',
                    },
                  ] as const
                ).map((card) => {
                  const staked = bets[card.id];
                  const cardMult = bonusCardMultipliers[card.id];
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handlePlaceBet(card.id)}
                      className={`relative rounded-[7px] overflow-hidden shadow-[0_3px_8px_rgba(0,0,0,0.45)] transition-all active:scale-[0.97] cursor-pointer ${
                        isBettingPhase ? 'h-[74px]' : 'h-[66px]'
                      } ${
                        cardMult
                          ? 'ring-2 ring-white shadow-[0_0_15px_rgba(186,230,253,0.9)]'
                          : 'border border-white/25'
                      }`}
                    >
                      <img
                        src={card.img}
                        alt={card.alt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-fill block"
                      />

                      {/* Frost ice sheen + 3D multiplier on bonus card */}
                      {cardMult && (
                        <>
                          <div
                            className="absolute inset-0 pointer-events-none z-10 rounded-[7px]"
                            style={{
                              boxShadow:
                                'inset 0 0 12px rgba(255,255,255,0.9), inset 0 0 4px rgba(186,230,253,0.95)',
                              background:
                                'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.55) 0%, rgba(186,230,253,0.18) 45%, transparent 75%)',
                            }}
                          />
                          <span
                            className="absolute top-1 right-1.5 z-20 font-display font-black text-[14px] text-[#fbbf24] leading-none"
                            style={{
                              textShadow:
                                '0 1.5px 0 #78350f, 0 -1px 0 #78350f, 1px 0 0 #78350f, -1px 0 0 #78350f, 0 2px 4px rgba(0,0,0,0.5)',
                            }}
                          >
                            {cardMult}x
                          </span>
                        </>
                      )}

                      {/* Placed Chip on Bonus Card (bottom-right corner) */}
                      {staked > 0 && (
                        <div className="absolute bottom-1 right-1 z-20">
                          <CasinoChip
                            value={staked}
                            size={isBettingPhase ? 28 : 24}
                            showRupeePrefix
                          />
                        </div>
                      )}

                      {/* Flying chip arrival pulse */}
                      {flyingChips.some((fc) => fc.targetSpot === card.id) && (
                        <div className="absolute inset-0 bg-white/25 animate-ping pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* When NOT in BETTING phase, right circular Menu button sits next to the compact cards */}
              {!isBettingPhase && (
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  className="w-[38px] h-[38px] rounded-full bg-[#2a3c4b]/90 border border-white/25 flex items-center justify-center text-white shrink-0 mb-0.5 cursor-pointer"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Row 3: ALL BONUSES Button (Compact centered w-[58%] with blue-amber-red frost gradient + chip speed-lines icon matching Original screenshot) */}
            {isBettingPhase && (
              <button
                type="button"
                onClick={handleAllBonuses}
                style={{
                  background:
                    'linear-gradient(90deg, rgba(84,126,158,0.92) 0%, rgba(168,125,70,0.95) 45%, rgba(196,88,62,0.92) 85%, rgba(153,65,55,0.92) 100%)',
                }}
                className="relative w-[58%] max-w-[216px] mx-auto h-[28px] rounded-[5px] border border-white/45 shadow-[0_2px_6px_rgba(0,0,0,0.4)] flex items-center justify-center gap-1.5 active:scale-[0.99] transition cursor-pointer overflow-hidden"
              >
                {/* Subtle glossy top highlight */}
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                {/* White Casino Chip with "+" and speed lines on the right (exact match to Original screenshot) */}
                <svg width="20" height="14" viewBox="0 0 24 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="6" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" strokeDasharray="2.2 1.5" />
                  <circle cx="8" cy="8" r="3.8" fill="white" />
                  <path d="M8 6.2V9.8M6.2 8H9.8" stroke="#854d0e" strokeWidth="1.3" strokeLinecap="round" />
                  <line x1="16" y1="6" x2="20" y2="6" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
                  <line x1="16" y1="10" x2="19" y2="10" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
                </svg>

                <span className="font-sans font-bold text-[10.5px] tracking-wider text-white uppercase drop-shadow">
                  ALL BONUSES
                </span>
              </button>
            )}

            {/* Row 4: Bottom Action Bar during BETTING (Autoplay | UNDO | Selected Chip | DOUBLE/REPEAT | Menu) */}
            {isBettingPhase && (
              <div className="relative flex items-center justify-between pt-0.5 px-1">
                {/* Radial Fan-Out Chip Selector Overlay */}
                {isChipTrayOpen && (
                  <div className="absolute left-1/2 bottom-[24px] -translate-x-1/2 z-40 pointer-events-none w-0 h-0 flex items-center justify-center">
                    {CHIP_OPTIONS.map((chip, idx) => {
                      const angleDeg = radialChipAngles[idx];
                      const rad = (angleDeg * Math.PI) / 180;
                      const radius = 86;
                      const tx = Math.cos(rad) * radius;
                      const ty = Math.sin(rad) * radius;
                      return (
                        <div
                          key={chip.value}
                          style={{
                            transform: `translate(${tx}px, ${ty}px)`,
                          }}
                          className="absolute pointer-events-auto transition-transform duration-200"
                        >
                          <CasinoChip
                            value={chip.value}
                            size={40}
                            selected={selectedChip === chip.value}
                            onClick={() => {
                              soundEngine.playChipPlace();
                              setSelectedChip(chip.value);
                              setIsChipTrayOpen(false);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Left Group: Circular Loop-Play Autoplay Button + UNDO */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAutoPlay((prev) => !prev)}
                    className={`w-[36px] h-[36px] rounded-full border border-white/30 flex items-center justify-center transition cursor-pointer shadow ${
                      isAutoPlay
                        ? 'bg-emerald-600/85 text-white'
                        : 'bg-[#253645]/90 text-white/90'
                    }`}
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
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

                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={betStack.length === 0}
                    className={`flex items-center gap-1.5 transition cursor-pointer ${
                      betStack.length > 0 ? 'opacity-100' : 'opacity-45'
                    }`}
                  >
                    <span className="text-[9.5px] font-semibold tracking-wider text-white/85 uppercase">
                      UNDO
                    </span>
                    <div className="w-[33px] h-[33px] rounded-full bg-[#2a3c4b]/90 border border-white/25 flex items-center justify-center text-white">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>

                {/* Center Active Selected Chip */}
                <div className="relative z-40 flex items-center justify-center">
                  <CasinoChip
                    value={selectedChip}
                    size={44}
                    selected
                    onClick={() => setIsChipTrayOpen((prev) => !prev)}
                  />
                </div>

                {/* Right Group: DOUBLE / REPEAT + Menu */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRepeatOrDouble}
                    disabled={totalBet === 0 && !lastRoundBets}
                    className={`flex items-center gap-1.5 transition cursor-pointer ${
                      totalBet > 0 || lastRoundBets ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <div className="w-[33px] h-[33px] rounded-full bg-[#8ea2b2]/85 border border-white/40 flex items-center justify-center text-white font-display font-bold text-[11px] shadow-inner">
                      {totalBet > 0 ? 'x2' : <RotateCw className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[9.5px] font-semibold tracking-wider text-white uppercase">
                      {totalBet > 0 ? 'DOUBLE' : 'REPEAT'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    className="w-[36px] h-[36px] rounded-full bg-[#253645]/90 border border-white/30 flex items-center justify-center text-white cursor-pointer shadow"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            </div>
          )}

          {/* Full-Stage 4-Phase Bonus Fishing Sequence when landing on Lil' Blues / Big Oranges / Huge Reds */}
          {phase === 'BONUS_FISHING' && activeBonusModal && (
            <BonusFishingModal
              bonusType={activeBonusModal.bonusType}
              sizeTier={activeBonusModal.sizeTier}
              wheelMultiplier={activeBonusModal.wheelMultiplier}
              finalBonusMultiplier={activeBonusModal.finalBonusMultiplier}
              stakedAmount={activeBonusModal.stakedAmount}
              winAmount={activeBonusModal.winAmount}
              winnerFeed={activeBonusModal.winnerFeed}
              isAutoPlay={isAutoPlay}
              onToggleAutoPlay={() => setIsAutoPlay((prev) => !prev)}
              onOpenMenu={() => setIsMenuOpen(true)}
            />
          )}

          {/* Sliding Hamburger Menu Sheet */}
          <MenuSheet
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            isMuted={isMuted}
            onToggleMute={() => {
              const next = !isMuted;
              setIsMuted(next);
              soundEngine.setMuted(next);
            }}
            history={history}
            balance={balance}
            onResetBalance={(amount) => setBalance(amount)}
            onSendChatMessage={(msg) =>
              setCustomChatMsg({ user: 'You', text: msg })
            }
          />

          {/* Floating Ice Predictor Widget (Predicts the exact upcoming round outcome!) */}
          <FloatingIcePredictor
            upcomingPlan={upcomingPlan}
            isVisible={isPredictorVisible}
            onCloseExit={() => setIsPredictorVisible(false)}
            onScanRequest={() => {
              // Give the player extra betting countdown time when scanning so they can comfortably place their bet after the laser scan finishes!
              if (phase === 'BETTING') {
                setTimeLeft((prev) => Math.max(prev, 6));
              }
            }}
          />
        </div>

        {/* 3. Bottom 3-Line Status & Live Chat Ticker Footer (Exact match to video) */}
        <div className="bg-[#1b2833] px-2.5 pt-1 pb-2 text-[12px] leading-[1.35] border-t border-white/10 shrink-0 z-30">
          {/* Line 1: Live Chat Ticker */}
          <div className="truncate text-white/90">
            <span className="text-white/65">{activeChat.user}: </span>
            <span className="font-semibold text-white">{activeChat.text}</span>
          </div>

          {/* Line 2: Total Bet / Last Win + Timestamp */}
          <div className="flex items-center justify-between">
            <div>
              {phase === 'BONUS_FISHING' && activeBonusModal ? (
                <>
                  <span className="text-white font-medium">Bonus bet </span>
                  <span className="text-[#fbbf24] font-bold font-mono-num">
                    ₹{activeBonusModal.stakedAmount.toLocaleString('en-IN')}
                  </span>
                </>
              ) : showLastWinLabel && lastWinAmount > 0 ? (
                <>
                  <span className="text-white font-medium">Last Win </span>
                  <span className="text-[#fbbf24] font-bold font-mono-num">
                    ₹{lastWinAmount.toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-white font-medium">Total Bet </span>
                  <span className="text-[#fbbf24] font-bold font-mono-num">
                    ₹{totalBet.toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>
            <div className="text-white/75 text-[11px] font-mono-num">
              # {clockStr}
            </div>
          </div>

          {/* Line 3: Balance + Game Title & Limits */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">Balance </span>
              <span className="text-[#fbbf24] font-bold font-mono-num">
                ₹{balance.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-white/85 text-[11.5px] font-medium">
              Ice Fishing ₹10–1,000,000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
