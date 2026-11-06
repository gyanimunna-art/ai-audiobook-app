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

// 54-segment wheel matching the exact clockwise layout of wheel_disc_wedges.png from 12 o'clock
const RAW_SEGMENT_TYPES: BetSpotId[] = [
  'LIL_BLUES',   // 0 (12 o'clock)
  'WHITE_LEAF',  // 1
  'BLUE_LEAF',   // 2
  'WHITE_LEAF',  // 3
  'BLUE_LEAF',   // 4
  'WHITE_LEAF',  // 5
  'BLUE_LEAF',   // 6
  'BIG_ORANGES', // 7
  'BLUE_LEAF',   // 8
  'WHITE_LEAF',  // 9
  'BLUE_LEAF',   // 10
  'WHITE_LEAF',  // 11
  'BLUE_LEAF',   // 12
  'WHITE_LEAF',  // 13
  'LIL_BLUES',   // 14
  'BLUE_LEAF',   // 15
  'WHITE_LEAF',  // 16
  'BLUE_LEAF',   // 17
  'WHITE_LEAF',  // 18
  'BLUE_LEAF',   // 19
  'WHITE_LEAF',  // 20
  'BLUE_LEAF',   // 21
  'WHITE_LEAF',  // 22
  'BLUE_LEAF',   // 23
  'HUGE_REDS',   // 24
  'WHITE_LEAF',  // 25
  'BLUE_LEAF',   // 26
  'WHITE_LEAF',  // 27
  'BLUE_LEAF',   // 28
  'WHITE_LEAF',  // 29
  'BLUE_LEAF',   // 30
  'WHITE_LEAF',  // 31
  'LIL_BLUES',   // 32
  'BLUE_LEAF',   // 33
  'WHITE_LEAF',  // 34
  'BLUE_LEAF',   // 35
  'WHITE_LEAF',  // 36
  'BLUE_LEAF',   // 37
  'WHITE_LEAF',  // 38
  'BIG_ORANGES', // 39
  'BLUE_LEAF',   // 40
  'WHITE_LEAF',  // 41
  'BLUE_LEAF',   // 42
  'WHITE_LEAF',  // 43
  'BLUE_LEAF',   // 44
  'WHITE_LEAF',  // 45
  'LIL_BLUES',   // 46
  'BLUE_LEAF',   // 47
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

// Multiple distinct Male & Female live presenters in the same blue-and-white Arctic uniform.
// Rotates on each new login/session (and only on long dealer shift changes, NOT after every single spin!)
export const STUDIO_HOSTS: StudioHost[] = [
  {
    id: 'host_varg_male',
    name: 'Varg',
    gender: 'male',
    type: 'video',
    src: '/assets/game/host_clip_1.mp4',
  },
  {
    id: 'host_sofia_female',
    name: 'Sofia',
    gender: 'female',
    type: 'video',
    src: '/assets/game/host_female_1.mp4',
  },
  {
    id: 'host_laurynas_male',
    name: 'Laurynas',
    gender: 'male',
    type: 'video',
    src: '/assets/game/host_male_laurynas.mp4',
  },
  {
    id: 'host_elena_female',
    name: 'Elena',
    gender: 'female',
    type: 'video',
    src: '/assets/game/host_female_2.mp4',
  },
  {
    id: 'host_erik_male',
    name: 'Erik',
    gender: 'male',
    type: 'video',
    src: '/assets/game/host_clip_2.mp4',
  },
];

export const INITIAL_HISTORY: HistoryItem[] = [
  { id: 'h-1', winner: 'HUGE_REDS', timestamp: '12:05:42' },
  { id: 'h-2', winner: 'HUGE_REDS', multiplier: 4, timestamp: '12:05:18' },
  { id: 'h-3', winner: 'BLUE_LEAF', timestamp: '12:04:55' },
  { id: 'h-4', winner: 'BLUE_LEAF', timestamp: '12:04:31' },
  { id: 'h-5', winner: 'WHITE_LEAF', timestamp: '12:04:09' },
  { id: 'h-6', winner: 'WHITE_LEAF', timestamp: '12:03:48' },
  { id: 'h-7', winner: 'WHITE_LEAF', timestamp: '12:03:25' },
  { id: 'h-8', winner: 'WHITE_LEAF', timestamp: '12:03:02' },
  { id: 'h-9', winner: 'WHITE_LEAF', timestamp: '12:02:40' },
  { id: 'h-10', winner: 'LIL_BLUES', timestamp: '12:02:15' },
  { id: 'h-11', winner: 'LIL_BLUES', multiplier: 4, timestamp: '12:01:50' },
];

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

/**
 * Pre-computes the exact outcome of a round at the start of BETTING so:
 * 1. The wheel spin is 100% fair and independent of player bets.
 * 2. Fish bonuses have a 90% chance of <= 20x multiplier and 10% chance of > 20x multiplier.
 * 3. The Floating Ice Predictor can reveal the exact upcoming round winner before bets close!
 */
export function generateRoundOutcomePlan(roundNumber: number): RoundOutcomePlan {
  const multOptions = [3, 4, 5, 8, 10];
  const segmentMultipliers: Record<number, number> = {};
  const bonusCardMultipliers: Partial<Record<BetSpotId, number>> = {};
  const numSegs = WHEEL_SEGMENTS.length;

  const bonusSegmentIndices = WHEEL_SEGMENTS.map((s, idx) => ({ s, idx }))
    .filter(
      ({ s }) =>
        s.type === 'LIL_BLUES' ||
        s.type === 'BIG_ORANGES' ||
        s.type === 'HUGE_REDS'
    )
    .map(({ idx }) => idx);

  let winnerIndex = Math.floor(Math.random() * numSegs);
  if (Math.random() < 0.22) {
    winnerIndex =
      bonusSegmentIndices[
        Math.floor(Math.random() * bonusSegmentIndices.length)
      ];
  }
  const winnerType = WHEEL_SEGMENTS[winnerIndex].type;

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

  // Occasionally also boost bonus fish cards with 2x, 3x, or 4x multipliers
  if (Math.random() < 0.32) {
    const cardMultPool = [2, 3, 4];
    bonusCardMultipliers.LIL_BLUES =
      cardMultPool[Math.floor(Math.random() * cardMultPool.length)];
    if (Math.random() < 0.5) {
      bonusCardMultipliers.BIG_ORANGES =
        cardMultPool[Math.floor(Math.random() * cardMultPool.length)];
    }
    if (Math.random() < 0.4) {
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

export const LIVE_CHAT_MESSAGES: { user: string; text: string }[] = [
  { user: 'tadaroniatadaronia', text: 'Last 345x robot money is still not...' },
  { user: 'rollicksangma', text: 'Are u play football' },
  { user: 'hemantu143JH', text: 'Can we expect robot again' },
  { user: 'Tyu616', text: 'Last robot?' },
  { user: 'Atik Rahman', text: 'Vai blue robot' },
  { user: 'Rosean', text: 'MINI HEART ATTACK' },
  { user: 'Karmosiram', text: 'Banana 😢' },
  { user: 'tamiyanang', text: 'Teasing' },
  { user: 'Shreem', text: 'BLUE ROBOT' },
  { user: 'Shunnitasundas', text: 'Bonus p' },
  { user: 'WLPRIS32691723', text: 'Please' },
  { user: 'talayen', text: 'Oh no..... 😢😢😢' },
  { user: 'shankar', text: 'Please god' },
  { user: '2_d_Khushalivelip', text: 'Kesari Lal Yadav' },
  { user: 'Suryamani9', text: '/' },
  { user: 'daffille', text: 'red combien le dernier ?' },
  { user: 'alex', text: 'bye' },
  { user: 'shiva', text: 'Lv u bro' },
  { user: 'phelamwangnaw', text: 'Please' },
  { user: 'CronUk', text: 'Which god?' },
  { user: '❖hangs❖h', text: 'Where is ur hammer Varg 🤣🤣🤣' },
  { user: 'rikigogoixk', text: 'All miss' },
  { user: '35280056', text: 'Ya no va a dar nada😭' },
  { user: 'Depu1234', text: '🤮🤮🤮🤮🙏🙏🙏' },
  { user: 'kushal', text: 'Last robot' },
  { user: 'Patshering', text: 'My widral not credited' },
  { user: 'Sony', text: 'Thankyousir❤️🙏' },
  { user: 'julfikar', text: 'Nice 👍' },
  { user: 'U', text: 'How many persons here?' },
  { user: 'benjamin', text: 'Lil blue or big red' },
  { user: 'old man', text: 'I loss 40k 10bet mistake' },
  { user: 'city', text: 'Mor' },
  { user: 'cherrycia', text: 'Varg please give' },
  { user: 'Vegabond', text: 'Best session' },
  { user: 'jv singh', text: 'Thank you so much' },
  { user: 'onlystatusvideo', text: 'wake up robot' },
  { user: 'Kc', text: 'Thanks for robo' },
  { user: 'nandha.shaju', text: 'Almost finish the game' },
  { user: 'gangnaigangsa', text: 'Red and yellow' },
  { user: 'randomnortheast', text: 'Please robot' },
  { user: 'Ilyasg', text: 'Huge fish one more time' },
  { user: 'Golfa3', text: 'Hola wieres quedar' },
  { user: 'Khampl', text: 'Sir bigg' },
  { user: 'GuptaNevlar', text: 'We love you' },
  { user: 'popichintey', text: 'Last change bro' },
  { user: 'yangkis504', text: 'Collection' },
  { user: 'Borotaezing', text: 'Pls' },
  { user: 'gegegadi', text: 'Letssss gooo sir 😍' },
  { user: 'yam saru', text: 'Red' },
  { user: 'kamalghimire', text: 'Go go go' },
  { user: '2_d_Zinxu', text: 'Too much' },
  { user: 'karma lal syangtan', text: 'plz big' },
  { user: 'samsadalamJG', text: 'Dewali bonus sir' },
  { user: 'yomkan', text: 'Abi lutega' },
  { user: 'Rosean', text: '8===D~FISH PLS' },
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
