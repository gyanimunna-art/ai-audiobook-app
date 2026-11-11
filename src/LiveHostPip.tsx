import React, { useEffect, useState } from 'react';
import { STUDIO_HOSTS, StudioHost } from '../data/wheelConfig';

interface LiveHostPipProps {
  roundNumber: number;
}

const HOST_STORAGE_KEY = 'ice_fishing_host_login_idx_v2';

export const LiveHostPip: React.FC<LiveHostPipProps> = ({ roundNumber }) => {
  // Select a DIFFERENT male/female presenter each time the user logs in / opens the app,
  // and keep that presenter for the session instead of switching after every single spin!
  const [hostIndex, setHostIndex] = useState<number>(() => {
    try {
      const prevRaw = localStorage.getItem(HOST_STORAGE_KEY);
      const nextIdx =
        prevRaw !== null
          ? (Number(prevRaw) + 1) % STUDIO_HOSTS.length
          : 0;
      localStorage.setItem(HOST_STORAGE_KEY, String(nextIdx));
      return Number.isNaN(nextIdx) ? 0 : nextIdx;
    } catch {
      return 0;
    }
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  // Only rotate automatically on a long studio dealer shift (every 12 rounds),
  // NOT after every single wheel spin!
  useEffect(() => {
    if (roundNumber <= 1 || roundNumber % 12 !== 0) return;
    setIsTransitioning(true);
    const switchTimer = setTimeout(() => {
      setHostIndex((prev) => {
        const next = (prev + 1) % STUDIO_HOSTS.length;
        try {
          localStorage.setItem(HOST_STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }, 650);
    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
    return () => {
      clearTimeout(switchTimer);
      clearTimeout(endTimer);
    };
  }, [roundNumber]);

  const handleManualSwitch = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setHostIndex((prev) => {
        const next = (prev + 1) % STUDIO_HOSTS.length;
        try {
          localStorage.setItem(HOST_STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }, 350);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 900);
  };

  const currentHost: StudioHost = STUDIO_HOSTS[hostIndex] || STUDIO_HOSTS[0];
  const hasFailed = imageErrorMap[currentHost.id];

  return (
    <button
      type="button"
      onClick={handleManualSwitch}
      title={`Live Host: ${currentHost.name} (Tap to switch presenter)`}
      className="relative w-[88px] h-[58px] rounded-[9px] overflow-hidden shadow-[0_3px_10px_rgba(0,0,0,0.5)] border-[2px] border-[#d8e8f2]/90 bg-[#6f8fa6] select-none cursor-pointer group focus:outline-none"
    >
      {/* Frosty top snow highlight */}
      <div
        className="absolute inset-x-0 top-0 h-[2.5px] z-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(226,241,248,0.95) 50%, rgba(255,255,255,0.8) 100%)',
        }}
      />

      {/* Active Host Live Stream */}
      {currentHost.type === 'video' && !hasFailed ? (
        <video
          key={currentHost.src}
          src={currentHost.src}
          autoPlay
          loop
          muted
          playsInline
          onError={() =>
            setImageErrorMap((prev) => ({ ...prev, [currentHost.id]: true }))
          }
          className="w-full h-full object-cover object-center"
        />
      ) : !hasFailed ? (
        <div className="relative w-full h-full overflow-hidden bg-[#8bb4d4]">
          <img
            src={currentHost.src}
            alt={currentHost.name}
            referrerPolicy="no-referrer"
            onError={() =>
              setImageErrorMap((prev) => ({ ...prev, [currentHost.id]: true }))
            }
            className="w-full h-full object-cover object-center animate-host-live"
          />
        </div>
      ) : (
        <img
          src="/assets/game/pip_clean.png"
          alt="Studio Host"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover animate-host-live"
        />
      )}

      {/* Inner metallic icy bezel */}
      <div className="absolute inset-0 rounded-[8px] ring-1 ring-inset ring-white/50 pointer-events-none z-10" />

      {/* Camera-switch blur & outline Twin-Leaf emblem */}
      {isTransitioning && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#6c7f8e]/80 backdrop-blur-md transition-opacity duration-200">
          <svg
            width="18"
            height="18"
            viewBox="0 0 64 64"
            fill="none"
            className="animate-pulse opacity-85"
          >
            <path
              d="M12 10.5 C29 6, 51 14, 54 30.5 L32 30.5 C22 27.5, 16 20, 12 10.5 Z"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M12 53.5 C29 58, 51 50, 54 33.5 L32 33.5 C22 36.5, 16 44, 12 53.5 Z"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
};
