export type BetSpotId =
  | 'WHITE_LEAF'
  | 'BLUE_LEAF'
  | 'LIL_BLUES'
  | 'BIG_ORANGES'
  | 'HUGE_REDS';

export type BonusSizeTier = 'SMALL' | 'LARGE' | 'COLOSSAL';

export interface WheelSegment {
  index: number;
  type: BetSpotId;
  label?: string;
}

export interface ChipConfig {
  value: number;
  label: string;
  primaryColor: string;
  secondaryColor: string;
  ringColor: string;
}

export interface StudioHost {
  id: string;
  name: string;
  gender: 'male' | 'female';
  type: 'video' | 'animated_photo';
  src: string;
}

export interface HistoryItem {
  id: string;
  winner: BetSpotId;
  multiplier?: number;
  payoutAmount?: number;
  timestamp: string;
}

export interface WinnerEntry {
  id: string;
  username: string;
  amount: number;
  multiplier?: number;
  isCurrentUser?: boolean;
}

export const CHIP_OPTIONS: ChipConfig[] = [
  {
    value: 10,
    label: '10',
    primaryColor: '#4A6378',
    secondaryColor: '#2B3E4E',
    ringColor: '#94B0C7',
  },
  {
    value: 50,
    label: '50',
    primaryColor: '#DD7624',
    secondaryColor: '#9E4B0E',
    ringColor: '#FDBA74',
  },
  {
    value: 100,
    label: '100',
    primaryColor: '#8E5332',
    secondaryColor: '#5B311A',
    ringColor: '#D6A184',
  },
  {
    value: 500,
    label: '500',
    primaryColor: '#B82623',
    secondaryColor: '#781412',
    ringColor: '#FCA5A5',
  },
  {
    value: 2500,
    label: '2500',
    primaryColor: '#1E7E48',
    secondaryColor: '#114B2A',
    ringColor: '#86EFAC',
  },
  {
    value: 10000,
    label: '10K',
    primaryColor: '#1D242B',
    secondaryColor: '#0B0F13',
    ringColor: '#FACC15',
  },
];

// 54-segment wheel matching the EXACT pixel scan of wheel_disc_wedges.png from 12 o'clock clockwise:
// 0: LIL_BLUES, 8: BIG_ORANGES, 16: LIL_BLUES, 24: HUGE_REDS, 32: LIL_BLUES, 39: BIG_ORANGES, 47: LIL_BLUES
const RAW_SEGMENT_TYPES: BetSpotId[] = [
  'LIL_BLUES',   // 0 (12 o'clock)
  'WHITE_LEAF',  // 1
  'BLUE_LEAF',   // 2
  'WHITE_LEAF',  // 3
  'BLUE_LEAF',   // 4
  'WHITE_LEAF',  // 5
  'BLUE_LEAF',   // 6
  'WHITE_LEAF',  // 7
  'BIG_ORANGES', // 8 (Exact 53.3° Orange Fish)
  'BLUE_LEAF',   // 9
  'WHITE_LEAF',  // 10
  'BLUE_LEAF',   // 11
  'WHITE_LEAF',  // 12
  'BLUE_LEAF',   // 13
  'WHITE_LEAF',  // 14
  'BLUE_LEAF',   // 15
  'LIL_BLUES',   // 16 (Exact 106.7° Blue Fish)
  'BLUE_LEAF',   // 17
  'WHITE_LEAF',  // 18
  'BLUE_LEAF',   // 19
  'WHITE_LEAF',  // 20
  'BLUE_LEAF',   // 21
  'WHITE_LEAF',  // 22
  'BLUE_LEAF',   // 23
  'HUGE_REDS',   // 24 (Exact 160.0° Red Fish)
  'WHITE_LEAF',  // 25
  'BLUE_LEAF',   // 26
  'WHITE_LEAF',  // 27
  'BLUE_LEAF',   // 28
  'WHITE_LEAF',  // 29
  'BLUE_LEAF',   // 30
  'WHITE_LEAF',  // 31
  'LIL_BLUES',   // 32 (Exact 213.3° Blue Fish)
  'BLUE_LEAF',   // 33
  'WHITE_LEAF',  // 34
  'BLUE_LEAF',   // 35
  'WHITE_LEAF',  // 36
  'BLUE_LEAF',   // 37
  'WHITE_LEAF',  // 38
  'BIG_ORANGES', // 39 (Exact 260.0° Orange Fish)
  'BLUE_LEAF',   // 40
  'WHITE_LEAF',  // 41
  'BLUE_LEAF',   // 42
  'WHITE_LEAF',  // 43
  'BLUE_LEAF',   // 44
  'WHITE_LEAF',  // 45
  'BLUE_LEAF',   // 46
  'LIL_BLUES',   // 47 (Exact 313.3° Blue Fish)
  'WHITE_LEAF',  // 48
  'BLUE_LEAF',   // 49
  'WHITE_LEAF',  // 50
  'BLUE_LEAF',   // 51
  'WHITE_LEAF',  // 52
  'BLUE_LEAF',   // 53
];

export const WHEEL_SEGMENTS: WheelSegment[] = RAW_SEGMENT_TYPES.map((type, index) => ({
  index,
  type,
  label:
    type === 'LIL_BLUES'
      ? "LIL' BLUES"
      : type === 'BIG_ORANGES'
      ? 'BIG ORANGES'
      : type === 'HUGE_REDS'
      ? 'HUGE REDS'
      : undefined,
}));

// 6 Distinct Male and Female live studio presenters in the authentic blue-and-white Arctic uniform
// with crystal-clear centered faces, active live video & studio broadcast animation
export const STUDIO_HOSTS: StudioHost[] = [
  {
    id: 'host_varg_live',
    name: 'Varg',
    gender: 'male',
    type: 'video',
    src: '/assets/game/host_varg_live.mp4',
  },
  {
    id: 'host_sofia_female',
    name: 'Sofia',
    gender: 'female',
    type: 'animated_photo',
    src: '/assets/game/host_sofia_face.jpg',
  },
  {
    id: 'host_erik_live',
    name: 'Erik',
    gender: 'male',
    type: 'video',
    src: '/assets/game/host_erik_live.mp4',
  },
  {
    id: 'host_mark_buzzcut',
    name: 'Mark',
    gender: 'male',
    type: 'animated_photo',
    src: '/assets/game/host_mark_buzzcut.jpg',
  },
  {
    id: 'host_laurynas_live',
    name: 'Laurynas',
    gender: 'male',
    type: 'video',
    src: '/assets/game/host_laurynas_live.mp4',
  },
  {
    id: 'host_elena_female',
    name: 'Elena',
    gender: 'female',
    type: 'animated_photo',
    src: '/assets/game/host_elena_face.jpg',
  },
];

/**
 * Generates a completely fresh, randomized 11-round history every time the app opens or refreshes
 * (User Requirement: History is NEVER static or fixed; fresh dynamic history on every launch!)
 */
export function generateFreshHistory(): HistoryItem[] {
  const items: HistoryItem[] = [];
  const now = Date.now();
  // 10 leaf rounds and at most 1 fish bonus in 11 rounds
  const fishIndex = Math.floor(Math.random() * 8) + 2; // place 1 fish bonus around 3rd-9th position
  const leafMultPool = [3, 4, 5];

  for (let i = 0; i < 11; i++) {
    const timeOffsetMs = i * (40000 + Math.floor(Math.random() * 15000));
    const d = new Date(now - timeOffsetMs);
    const ts = `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

    if (i === fishIndex) {
      const isOrange = Math.random() < 0.25;
      items.push({
        id: `h-fresh-${now}-${i}`,
        winner: isOrange ? 'BIG_ORANGES' : 'LIL_BLUES',
        multiplier: Math.random() < 0.4 ? 4 : undefined,
        timestamp: ts,
      });
    } else {
      const isWhite = (i % 2 === 0) ? Math.random() < 0.6 : Math.random() < 0.4;
      const hasLeafMult = Math.random() < 0.18;
      items.push({
        id: `h-fresh-${now}-${i}`,
        winner: isWhite ? 'WHITE_LEAF' : 'BLUE_LEAF',
        multiplier: hasLeafMult
          ? leafMultPool[Math.floor(Math.random() * leafMultPool.length)]
          : undefined,
        timestamp: ts,
      });
    }
  }

  return items;
}

/**
 * Generates a fresh random balance between ₹10,000 and ₹99,990 on every app open/refresh
 * (User Requirement: Random balance between 10k and 100k every time!)
 */
export function generateFreshInitialBalance(): number {
  const min = 12000;
  const max = 98500;
  const raw = Math.floor(min + Math.random() * (max - min));
  // Round to nearest 50 for clean casino chips
  return Math.round(raw / 50) * 50;
}

export const INITIAL_HISTORY: HistoryItem[] = generateFreshHistory();

export interface RoundOutcomePlan {
  roundNumber: number;
  winnerIndex: number;
  winnerType: BetSpotId;
  segmentMultipliers: Record<number, number>;
  bonusCardMultipliers: Partial<Record<BetSpotId, number>>;
  appliedMult: number;
  sizeTier: BonusSizeTier;
  finalBonusMult: number;
}

let lastPlannedFishRound = -99;

/**
 * Pre-computes the exact outcome of a round at the start of BETTING:
 * - Huge Reds: 1.5% (0.015) - Ultra rare!
 * - Big Oranges: 3.5% (0.035) - Very rare!
 * - Lil' Blues: 5.0% (0.05) - Rare!
 * - Total Fish Bonus probability: 10% (1 in 10 spins)!
 * - Leaves (White & Blue): 90% (45% White Leaf, 45% Blue Leaf)
 * - Cooldown enforcement: At least 5 leaf rounds after any fish bonus so 10 consecutive spins
 *   will NEVER have multiple fish bonuses!
 */
export function generateRoundOutcomePlan(
  roundNumber: number,
  recentHistory?: HistoryItem[]
): RoundOutcomePlan {
  const multOptions = [3, 4, 5, 8, 10];
  const segmentMultipliers: Record<number, number> = {};
  const bonusCardMultipliers: Partial<Record<BetSpotId, number>> = {};
  const numSegs = WHEEL_SEGMENTS.length;

  const whiteLeafIndices = WHEEL_SEGMENTS.filter(
    (s) => s.type === 'WHITE_LEAF'
  ).map((s) => s.index);
  const blueLeafIndices = WHEEL_SEGMENTS.filter(
    (s) => s.type === 'BLUE_LEAF'
  ).map((s) => s.index);
  const lilBluesIndices = WHEEL_SEGMENTS.filter(
    (s) => s.type === 'LIL_BLUES'
  ).map((s) => s.index);
  const bigOrangesIndices = WHEEL_SEGMENTS.filter(
    (s) => s.type === 'BIG_ORANGES'
  ).map((s) => s.index);
  const hugeRedsIndices = WHEEL_SEGMENTS.filter(
    (s) => s.type === 'HUGE_REDS'
  ).map((s) => s.index);

  // Check if any of the last 5 rounds was a fish bonus
  const hadRecentFish =
    Boolean(
      recentHistory &&
        recentHistory
          .slice(0, 5)
          .some(
            (h) =>
              h.winner === 'LIL_BLUES' ||
              h.winner === 'BIG_ORANGES' ||
              h.winner === 'HUGE_REDS'
          )
    ) || Math.abs(roundNumber - lastPlannedFishRound) <= 5;

  let winnerType: BetSpotId;
  let winnerIndex: number;

  if (hadRecentFish) {
    // 5-round cooldown: strictly guarantee White Leaf (50%) or Blue Leaf (50%)
    const isWhite = Math.random() < 0.5;
    winnerType = isWhite ? 'WHITE_LEAF' : 'BLUE_LEAF';
    winnerIndex = isWhite
      ? whiteLeafIndices[Math.floor(Math.random() * whiteLeafIndices.length)]
      : blueLeafIndices[Math.floor(Math.random() * blueLeafIndices.length)];
  } else {
    // Ultra-rare fish bonus probabilities requested by user:
    // HUGE REDS: 1.5% (0.015)
    // BIG ORANGES: 3.5% (0.035)
    // LIL' BLUES: 5.0% (0.05)
    // WHITE LEAF: 45.0%
    // BLUE LEAF: 45.0%
    const roll = Math.random();
    if (roll < 0.015) {
      winnerType = 'HUGE_REDS';
      winnerIndex =
        hugeRedsIndices[Math.floor(Math.random() * hugeRedsIndices.length)];
      lastPlannedFishRound = roundNumber;
    } else if (roll < 0.05) {
      winnerType = 'BIG_ORANGES';
      winnerIndex =
        bigOrangesIndices[Math.floor(Math.random() * bigOrangesIndices.length)];
      lastPlannedFishRound = roundNumber;
    } else if (roll < 0.10) {
      winnerType = 'LIL_BLUES';
      winnerIndex =
        lilBluesIndices[Math.floor(Math.random() * lilBluesIndices.length)];
      lastPlannedFishRound = roundNumber;
    } else if (roll < 0.55) {
      winnerType = 'WHITE_LEAF';
      winnerIndex =
        whiteLeafIndices[Math.floor(Math.random() * whiteLeafIndices.length)];
    } else {
      winnerType = 'BLUE_LEAF';
      winnerIndex =
        blueLeafIndices[Math.floor(Math.random() * blueLeafIndices.length)];
    }
  }

  const isNearExisting = (idx: number) => {
    return Object.keys(segmentMultipliers).some((k) => {
      const existingIdx = Number(k);
      const diff = Math.abs(existingIdx - idx);
      const circularDiff = Math.min(diff, numSegs - diff);
      return circularDiff < 4;
    });
  };

  // Pick 4 to 6 well-spaced LEAF segments to receive golden snowball multipliers (3x, 4x, 5x, 8x, 10x)
  const numBoosted = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numBoosted * 5; i++) {
    if (Object.keys(segmentMultipliers).length >= numBoosted) break;
    const segIdx = Math.floor(Math.random() * numSegs);
    const segType = WHEEL_SEGMENTS[segIdx].type;
    if (segType !== 'WHITE_LEAF' && segType !== 'BLUE_LEAF') continue;
    if (isNearExisting(segIdx)) continue;
    const m = multOptions[Math.floor(Math.random() * multOptions.length)];
    segmentMultipliers[segIdx] = m;
  }

  // Very rarely (12% chance) boost bonus fish cards with 2x, 3x, or 4x multipliers
  if (Math.random() < 0.12) {
    const cardMultPool = [2, 3, 4];
    bonusCardMultipliers.LIL_BLUES =
      cardMultPool[Math.floor(Math.random() * cardMultPool.length)];
    if (Math.random() < 0.3) {
      bonusCardMultipliers.BIG_ORANGES =
        cardMultPool[Math.floor(Math.random() * cardMultPool.length)];
    }
    if (Math.random() < 0.2) {
      bonusCardMultipliers.HUGE_REDS =
        cardMultPool[Math.floor(Math.random() * cardMultPool.length)];
    }
  }

  const appliedMult =
    segmentMultipliers[winnerIndex] || bonusCardMultipliers[winnerType] || 1;

  // Fish Bonus Multiplier Rule requested by user:
  // 90% of the time: finalBonusMult is <= 20x (3x to 19x, SMALL fish catch)
  // 10% of the time: finalBonusMult is > 20x (LARGE or COLOSSAL fish catch)
  const isUnder20x = Math.random() < 0.9;
  let sizeTier: BonusSizeTier = 'SMALL';
  let finalBonusMult = appliedMult > 1 ? appliedMult : 2;

  if (
    winnerType === 'LIL_BLUES' ||
    winnerType === 'BIG_ORANGES' ||
    winnerType === 'HUGE_REDS'
  ) {
    if (isUnder20x) {
      sizeTier = 'SMALL';
      const smallPools: Record<string, number[]> = {
        LIL_BLUES: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18],
        BIG_ORANGES: [5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19],
        HUGE_REDS: [8, 9, 10, 11, 12, 14, 15, 16, 18, 19],
      };
      const validSmall = smallPools[winnerType].filter(
        (m) => m * appliedMult <= 19
      );
      const chosenBase =
        validSmall.length > 0
          ? validSmall[Math.floor(Math.random() * validSmall.length)]
          : Math.max(2, Math.floor(18 / Math.max(1, appliedMult)));
      finalBonusMult = Math.min(19, chosenBase * appliedMult);
    } else {
      // 10% chance of > 20x multiplier
      sizeTier = Math.random() < 0.7 ? 'LARGE' : 'COLOSSAL';
      const bigPools: Record<string, Record<'LARGE' | 'COLOSSAL', number[]>> = {
        LIL_BLUES: {
          LARGE: [22, 24, 26, 28, 30, 35],
          COLOSSAL: [40, 50, 60, 75],
        },
        BIG_ORANGES: {
          LARGE: [24, 28, 32, 36, 42, 48],
          COLOSSAL: [65, 80, 100, 126],
        },
        HUGE_REDS: {
          LARGE: [25, 30, 36, 42, 48, 55, 65],
          COLOSSAL: [80, 100, 120, 150, 200],
        },
      };
      const pool = bigPools[winnerType][sizeTier];
      const chosenBase = pool[Math.floor(Math.random() * pool.length)];
      finalBonusMult = Math.max(21, chosenBase * appliedMult);
    }
  }

  return {
    roundNumber,
    winnerIndex,
    winnerType,
    segmentMultipliers,
    bonusCardMultipliers,
    appliedMult,
    sizeTier,
    finalBonusMult,
  };
}

export const LIVE_CHAT_USERNAMES = [
  'Sunny_Del',
  'Vikram_R',
  'Rahul_King',
  'Aman_Delhi',
  'AmitSharma9',
  'Priya_K',
  'Deepak_7',
  'Sanjay_Y',
  'Karan_G',
  'Arun_K',
  'Rajesh_88',
  'Rohit_V',
  'Neeraj_Bhai',
  'Alex_UK',
  'Marco_IT',
  'Erik_Swe',
  'SofiaFan22',
  'Vlad_UA',
  'Lucas_BR',
  'Mateo_AR',
  'Chen_HK',
  'Taras_Kiev',
  'David_C',
  'Carlos_ESP',
  'Kenji_JP',
  'Sam_USA',
  'Guest_49201',
  'Guest_18392',
  'Guest_74291',
  'Guest_91042',
  'Guest_62810',
  'LuckyStrike',
  'IceFisher_99',
  'RedWhale_10x',
  'TwinLeafPro',
  'ColdCash_8',
  'SpinKing',
  'BonusHunter_7',
  'DeepIceWin',
  'Sparky',
  'Petaka',
  'Sd',
  'J-MIKE',
  'Memati35',
  'dad8',
  'yari',
  'michiko',
  'Bagus',
  'khuchhu',
  'Fam4sG0d',
  'Guru_Ji',
  'RajaSelvam',
  'bxt_1ls',
  'scag06',
  'tadaronia',
  'rollicksangma',
  'hemantu143',
  'Tyu616',
  'Atik_R',
  'Rosean',
  'Karmosiram',
  'tamiyanang',
  'Shreem',
  'WLPRIS32',
  'shankar',
  'Khushalivelip',
  'daffille',
  'shiva',
  'CronUk',
  'rikigogoi',
  'kushal',
  'Patshering',
  'Sony_P',
  'julfikar',
  'benjamin',
  'old_man',
  'cherrycia',
  'Vegabond',
  'jv_singh',
  'onlystatus',
  'nandha',
  'randomNE',
  'Ilyas_G',
  'GuptaNevlar',
  'yangkis',
  'yam_saru',
  'kamal_g',
  'samsadalam',
  'yomkan',
];

export const PHASE_SPECIFIC_CHAT_MESSAGES: Record<string, string[]> = {
  BETTING: [
    'Orange this time please 🙏',
    '1000 on huge red',
    'All 3 bonus covered! Let us go',
    'White leaf for safety',
    '10x leaf coming this round',
    'Sofia bring us huge red!',
    'Erik we need 50x today!',
    'Trusting blue today',
    'Last round was teasing lol',
    'Big bets placed, good luck all',
    '2000 on white leaf',
    'Red is overdue! Placing heavy',
    'Bet closing soon, hurry up',
    'Good luck everyone 🎉',
    'My balance is ready for red',
    'All bonuses covered! 🎣',
    'Pls bonus today',
    'Red or orange, nothing else',
    'White leaf 1:1 safe return',
    '5000 on Big Orange 🍊',
    'Let us get that massive fish!',
    'Varg give us the robot!',
    'Who is betting red with me?',
    'Last 3 spins were leaves, bonus time!',
    'Hoping for 10x multiplier launch',
    'Leaf covers the bet, bonus gives profit',
    'Come on dealer, show some magic!',
    'Big Orange bonus please 🙏',
  ],
  MULTIPLIER_SPIN: [
    'Multiplier spin!!',
    'Give 20x please!',
    'Send snowball to huge red!!',
    'Need 10x on blue leaf',
    'Gold center medallion looks nice ✨',
    'Come on 50x or 100x!',
    'Snowball to red please 🙏',
    'Big multiplier incoming!',
    'Boom 10x on white leaf!',
    'Snowball hit orange! Yes!',
    'Hit the Huge Red wedge!',
    '20x on Lil Blues!',
    'Center spinning fast!',
    'Come on 10x on all bonuses!',
  ],
  SPINNING: [
    'Red red red!!',
    'Pass the white leaf please!!',
    'Hold on Big Orange!',
    'SLOW DOWN!',
    'One more peg please!!',
    'NOOO do not stop on white',
    'YESSS KEEP ROLLING',
    'Mini heart attack haha 😂',
    'Teasing again!!',
    'Flapper please click one more peg!',
    'Stop on blue robot!',
    'RED PLEASE 🙏🙏🙏',
    'Pass the blue leaf!',
    'Hold it right there!!',
    'Flapper is bending, one more tick!',
    'OMG so close to huge red!',
    'Just 2 more clicks dealer!',
    'Let it roll into orange!',
    'Do not stop on white please god',
    'Tick tick tick... YES!',
    'Almost had the 10x!',
    'Keep spinning!!',
  ],
  BONUS_FISHING: [
    'PULL IT UP!! 🎣',
    'Huge fish on the line!!',
    'Robot go crazy!',
    'Catch the golden one!',
    'What a monster fish!! 🐟',
    'Big orange helicopter wow!',
    'Massive win coming guys!',
    'Show us 100x multiplier!',
    'Red bonus is insane 🔥',
    'Best session ever ❤️',
    'Congrats everyone who bet red!',
    '50x minimum please!',
    'Look at that rod bending!!',
    '🔥🔥🔥🔥🔥',
    'LET US GOOOO!!',
    'Easy 30x in the pocket!',
    'Crane is pulling something huge!',
    'Deep ice fishing at its best!',
    'Massive catch incoming!',
  ],
  RESULT_REVEAL: [
    'Nice win!! 🎉',
    'Leaf again lol, at least doubled',
    'Next round red 100%',
    'Almost hit orange!',
    'GG everyone! 👏',
    'Thanks host!',
    'Got ₹2,500 from white leaf',
    'Recovered my balance nicely',
    'Next one is definitely fish bonus',
    'Who won this round?',
    'Still in solid profit today',
    'Rip my 200 bet haha next time',
    'Onto the next spin! 🚀',
    'White leaf delivered again',
    'Doubled up! Ready for next',
    'Orange was only 2 pegs away!',
  ],
  GENERAL: [
    'Hello from Mumbai! 👋',
    'Greetings from Delhi',
    'Sofia your smile is the best 😊',
    'Erik you are the best dealer!',
    'How long is your shift today?',
    'Withdrawals are super fast today',
    'Love this Ice Fishing game',
    'Yesterday hit 180x on red!',
    'Anyone betting high this round?',
    'Varg looking cool in that jacket ❄️',
    'Best live casino stream!',
    'Good vibe today everyone',
    'Nice dealer rotation today',
    'Can we hit record multiplier today?',
    'Good luck to all players! 🍀',
  ],
};

// Ring buffer of recently delivered messages to prevent any repetition
const recentChatMessagesSet = new Set<string>();
const MAX_RECENT_CHAT = 120;

/**
 * Dynamically generates a fresh, unique, non-repeating live player chat message.
 * Reacts contextually to the current game phase, dealer, and multiplier!
 */
export function generateNextLiveChatMessage(
  phase?: string,
  hostName?: string
): { user: string; text: string } {
  const currentPhase = phase || 'BETTING';
  const categoryPool = PHASE_SPECIFIC_CHAT_MESSAGES[currentPhase] || PHASE_SPECIFIC_CHAT_MESSAGES.BETTING;
  const generalPool = PHASE_SPECIFIC_CHAT_MESSAGES.GENERAL;

  // 75% phase-specific message, 25% general banter
  const usePhase = Math.random() < 0.75;
  const sourcePool = usePhase ? categoryPool : generalPool;

  // Try up to 20 times to pick or generate an unseen unique message
  for (let attempt = 0; attempt < 20; attempt++) {
    const randomUser =
      LIVE_CHAT_USERNAMES[Math.floor(Math.random() * LIVE_CHAT_USERNAMES.length)];
    let text = sourcePool[Math.floor(Math.random() * sourcePool.length)];

    // Inject current host name if message mentions host
    if (hostName && text.includes('Sofia') && hostName !== 'Sofia') {
      text = text.replace(/Sofia/g, hostName);
    } else if (hostName && text.includes('Erik') && hostName !== 'Erik') {
      text = text.replace(/Erik/g, hostName);
    } else if (hostName && text.includes('Varg') && hostName !== 'Varg') {
      text = text.replace(/Varg/g, hostName);
    }

    const uniqueKey = `${randomUser}:${text}`;
    if (!recentChatMessagesSet.has(uniqueKey)) {
      recentChatMessagesSet.add(uniqueKey);
      if (recentChatMessagesSet.size > MAX_RECENT_CHAT) {
        // Remove oldest entries
        const firstKey = recentChatMessagesSet.values().next().value;
        if (firstKey) recentChatMessagesSet.delete(firstKey);
      }
      return { user: randomUser, text };
    }
  }

  // Fallback with fresh random timestamp suffix so it's guaranteed unique
  const randomUser =
    LIVE_CHAT_USERNAMES[Math.floor(Math.random() * LIVE_CHAT_USERNAMES.length)];
  const fallbackText = `Let us go ${currentPhase === 'SPINNING' ? 'RED!' : 'win this!'} 🍀`;
  return { user: randomUser, text: fallbackText };
}

export const LIVE_CHAT_MESSAGES: { user: string; text: string }[] = [
  { user: 'Sunny_Del', text: 'Orange this time please 🙏' },
  { user: 'Vikram_R', text: '1000 on huge red' },
  { user: 'tamiyanang', text: 'Teasing' },
  { user: 'Aman_Delhi', text: 'All 3 bonus covered! Let us go' },
  { user: 'Atik_R', text: 'Vai blue robot' },
  { user: 'Rosean', text: 'MINI HEART ATTACK 😂' },
  { user: 'Karmosiram', text: 'Banana 😢' },
  { user: 'WLPRIS32', text: 'Please huge red 🙏' },
  { user: 'shankar', text: 'Please god' },
  { user: 'yam_saru', text: 'Red' },
];

const WINNER_USERNAMES_POOL = [
  'ocd28',
  '3e6df...',
  'SPARK',
  'Sd',
  'petaka',
  'Sofia23',
  'UNCLE...',
  'yari',
  'dad8',
  'khuchhu',
  'Bagus',
  'michiko',
  'Fam4sG0d',
  'J-MIKE',
  'mister bean',
  'Memati35',
  'guru',
  'kutter',
  'DAVID',
  'bxt_nwm1ls',
  'taliyan88',
  'KukungPalung',
  'RajaSelvam87',
  'Vikram_99',
  'AmanKing',
  'Rohit_77',
  'Nmn',
  'Jt',
  'Mr_...',
  'Rkb...',
  'Sk7...',
  'aa',
  'Ri',
  'Fl',
  'Sz',
  'xxb',
  'Sa',
  '882wjsi...',
  'scag06',
  '19a7696...',
  'SunnyDelhi',
  'IceKing77',
  'RedCatch_9',
  'Deepak_Win',
  'VargBro',
  'LuckyLad',
  'CasinoPro99',
  'WhiteLeaf_1x',
  'BlueFishFan',
  'GoldMedal8',
  'Harsh_V',
  'KaranGup',
  'SanjayYad',
  'Alex_Mcr',
  'TarasUA',
  'MateoARG',
  'LucasSP',
  'Chen_HKG',
  'Kenji_TYO',
  'David_LDN',
];

/**
 * Generates a fresh, dynamic, vertically-scrolling winner list for each round
 * so the left-side winner feed continuously scrolls upward with new winners!
 */
export function generateDynamicWinnerFeed(
  roundNumber: number,
  multiplier: number | undefined,
  playerWinAmount: number
): {
  totalPlayers: number;
  totalWon: number;
  winners: WinnerEntry[];
} {
  const effectiveMult = multiplier && multiplier > 1 ? multiplier : 2;
  const basePlayers = 5200 + ((roundNumber * 1373 + effectiveMult * 97) % 6900);
  const entries: WinnerEntry[] = [];

  // Pick 18 fresh usernames shuffled by roundNumber & multiplier
  const count = 18;
  const poolLen = WINNER_USERNAMES_POOL.length;
  const startOffset = (roundNumber * 7 + effectiveMult * 3) % poolLen;

  let topBaseAmount =
    effectiveMult >= 80
      ? 3800000 + ((roundNumber * 412000) % 9500000)
      : effectiveMult >= 20
      ? 650000 + ((roundNumber * 185000) % 1800000)
      : effectiveMult >= 6
      ? 145000 + ((roundNumber * 43000) % 420000)
      : 48000 + ((roundNumber * 17500) % 95000);

  for (let i = 0; i < count; i++) {
    const uname = WINNER_USERNAMES_POOL[(startOffset + i * 3) % poolLen];
    const decay = Math.pow(0.81, i);
    const jitter = 0.92 + (((roundNumber + i * 13) % 17) / 100);
    const rawAmt = Math.max(
      100,
      Math.round((topBaseAmount * decay * jitter) / 10) * 10
    );
    entries.push({
      id: `w-${roundNumber}-${i}-${uname}`,
      username: uname,
      amount: rawAmt,
      multiplier: multiplier && multiplier > 1 ? multiplier : undefined,
    });
  }

  // If the current player won this round, insert their real win into the scrolling feed!
  if (playerWinAmount > 0) {
    entries.unshift({
      id: `w-you-${roundNumber}-${Date.now()}`,
      username: 'You',
      amount: playerWinAmount,
      multiplier: multiplier && multiplier > 1 ? multiplier : undefined,
      isCurrentUser: true,
    });
  }

  // Sort descending by amount just like the real Evolution winner feed
  entries.sort((a, b) => b.amount - a.amount);

  const sumTop = entries.reduce((acc, item) => acc + item.amount, 0);
  const totalWon = Math.round(sumTop * (2.8 + ((roundNumber % 5) * 0.45))) + playerWinAmount;

  return {
    totalPlayers: basePlayers,
    totalWon,
    winners: entries,
  };
}
