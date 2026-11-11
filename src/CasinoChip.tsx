import React from 'react';
import { CHIP_OPTIONS } from '../data/wheelConfig';

interface CasinoChipProps {
  value: number;
  size?: number;
  showRupeePrefix?: boolean;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

export const getChipThemeForAmount = (amount: number) => {
  if (amount >= 10000) return CHIP_OPTIONS[5];
  if (amount >= 2500) return CHIP_OPTIONS[4];
  if (amount >= 500) return CHIP_OPTIONS[3];
  if (amount === 150) {
    return {
      primaryColor: '#8E5332',
      secondaryColor: '#5B311A',
      ringColor: '#E2B49A',
    };
  }
  if (amount >= 100) {
    return {
      primaryColor: '#3D4852',
      secondaryColor: '#1E242B',
      ringColor: '#94A3B8',
    };
  }
  if (amount >= 50) return CHIP_OPTIONS[1];
  return CHIP_OPTIONS[0];
};

export const formatChipLabel = (amount: number, showRupeePrefix = false): string => {
  if (amount >= 10000 && amount % 1000 === 0) {
    return `${showRupeePrefix ? '₹' : ''}${amount / 1000}K`;
  }
  return `${showRupeePrefix ? '₹' : ''}${amount}`;
};

export const CasinoChip: React.FC<CasinoChipProps> = ({
  value,
  size = 48,
  showRupeePrefix = false,
  selected = false,
  className = '',
  onClick,
}) => {
  const exactOption = CHIP_OPTIONS.find((c) => c.value === value);
  const theme = exactOption && !showRupeePrefix ? exactOption : getChipThemeForAmount(value);
  const label = formatChipLabel(value, showRupeePrefix);

  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center rounded-full select-none transition-transform duration-150 ${
        onClick ? 'cursor-pointer active:scale-90' : ''
      } ${selected ? 'scale-105' : ''} ${className}`}
    >
      {selected && (
        <div
          className="absolute -inset-1.5 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(251,191,36,0.65) 0%, rgba(251,191,36,0.2) 55%, transparent 75%)',
          }}
        />
      )}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.65)]"
      >
        {/* Outer base circle */}
        <circle cx="50" cy="50" r="47" fill={theme.primaryColor} stroke="#ffffff" strokeWidth="1.5" />

        {/* 8 white/cream edge stripes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <rect x="44" y="2.5" width="12" height="9.5" rx="2" fill="#F8FAFC" />
            <circle cx="50" cy="17.5" r="2.1" fill="#F8FAFC" opacity="0.85" />
          </g>
        ))}

        {/* Inner ring */}
        <circle
          cx="50"
          cy="50"
          r="35.5"
          fill={theme.secondaryColor}
          stroke="#F8FAFC"
          strokeWidth="1.8"
          strokeDasharray="6 3.5"
        />

        {/* Center medallion */}
        <circle
          cx="50"
          cy="50"
          r="29.5"
          fill={theme.primaryColor}
          stroke={theme.ringColor}
          strokeWidth="1.4"
        />

        {/* Subtle inner gloss */}
        <ellipse cx="50" cy="36" rx="22" ry="11" fill="rgba(255,255,255,0.14)" />
      </svg>

      <span
        className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-white tracking-tight leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
        style={{
          fontSize:
            label.length >= 5
              ? Math.max(9, size * 0.25)
              : label.length === 4
              ? Math.max(10, size * 0.28)
              : Math.max(11, size * 0.34),
        }}
      >
        {label}
      </span>
    </div>
  );
};
