import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Headphones,
  History,
  Settings,
  HelpCircle,
  ArrowUpDown,
  Volume2,
  VolumeX,
  ChevronLeft,
} from 'lucide-react';
import { HistoryItem } from '../data/wheelConfig';
import { HistoryFishBadge } from './FloatingIcePredictor';
import { TwinLeafIcon } from './IceWheelCanvas';

interface MenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  history: HistoryItem[];
  balance: number;
  onResetBalance: (amount: number) => void;
  onSendChatMessage: (text: string) => void;
}

type SubView = 'MAIN' | 'HISTORY' | 'PAYOUTS' | 'HOW_TO_PLAY' | 'CHAT' | 'SETTINGS';

export const MenuSheet: React.FC<MenuSheetProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  history,
  balance,
  onResetBalance,
  onSendChatMessage,
}) => {
  const [subView, setSubView] = useState<SubView>('MAIN');
  const [chatInput, setChatInput] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setSubView('MAIN');
    onClose();
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChatMessage(chatInput.trim());
    setChatInput('');
    handleClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-[1px]">
      <div className="flex-1" onClick={handleClose} />

      <div className="w-full bg-[#18181a] rounded-t-[26px] px-4 pt-4 pb-5 text-white shadow-[0_-10px_30px_rgba(0,0,0,0.85)] border-t border-white/10">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-4">
          {subView !== 'MAIN' && (
            <button
              type="button"
              onClick={() => setSubView('MAIN')}
              className="absolute left-0 w-9 h-9 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <span className="text-[15px] font-semibold tracking-wide">
            {subView === 'MAIN'
              ? 'Menu'
              : subView === 'HISTORY'
              ? 'Game History'
              : subView === 'PAYOUTS'
              ? 'Payouts & Limits'
              : subView === 'HOW_TO_PLAY'
              ? 'How To Play'
              : subView === 'CHAT'
              ? 'Live Chat'
              : 'Settings'}
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-0 w-9 h-9 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {subView === 'MAIN' && (
          <>
            {/* 2x3 Grid matching 00:10 in reference video */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Lobby */}
              <button
                type="button"
                onClick={handleClose}
                className="h-[98px] rounded-[14px] bg-[#262629] hover:bg-[#303034] active:scale-95 transition flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <svg width="30" height="26" viewBox="0 0 32 28">
                  <ellipse
                    cx="11"
                    cy="15"
                    rx="9"
                    ry="4.8"
                    transform="rotate(-35 11 15)"
                    fill="#2dd4bf"
                  />
                  <ellipse
                    cx="21"
                    cy="15"
                    rx="9"
                    ry="4.8"
                    transform="rotate(35 21 15)"
                    fill="#22d3ee"
                  />
                </svg>
                <span className="text-[13px] font-medium text-[#22d3ee]">Lobby</span>
              </button>

              {/* Chat */}
              <button
                type="button"
                onClick={() => setSubView('CHAT')}
                className="h-[98px] rounded-[14px] bg-[#262629] hover:bg-[#303034] active:scale-95 transition flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-6 h-6 text-white fill-white" />
                <span className="text-[13px] font-medium text-white">Chat</span>
              </button>

              {/* Live Support */}
              <button
                type="button"
                onClick={() => setSubView('HOW_TO_PLAY')}
                className="h-[98px] rounded-[14px] bg-[#262629] hover:bg-[#303034] active:scale-95 transition flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <Headphones className="w-6 h-6 text-white" />
                <span className="text-[13px] font-medium text-white leading-tight text-center">
                  Live
                  <br />
                  Support
                </span>
              </button>

              {/* Game History */}
              <button
                type="button"
                onClick={() => setSubView('HISTORY')}
                className="h-[98px] rounded-[14px] bg-[#262629] hover:bg-[#303034] active:scale-95 transition flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <History className="w-6 h-6 text-white" />
                <span className="text-[13px] font-medium text-white leading-tight text-center">
                  Game
                  <br />
                  History
                </span>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => setSubView('SETTINGS')}
                className="h-[98px] rounded-[14px] bg-[#262629] hover:bg-[#303034] active:scale-95 transition flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <Settings className="w-6 h-6 text-white" />
                <span className="text-[13px] font-medium text-white">Settings</span>
              </button>

              {/* How To Play */}
              <button
                type="button"
                onClick={() => setSubView('HOW_TO_PLAY')}
                className="h-[98px] rounded-[14px] bg-[#262629] hover:bg-[#303034] active:scale-95 transition flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-6 h-6 text-white fill-white/15" />
                <span className="text-[13px] font-medium text-white leading-tight text-center">
                  How To
                  <br />
                  Play
                </span>
              </button>
            </div>

            {/* Bottom bar inside Menu */}
            <div className="mt-4 flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setSubView('PAYOUTS')}
                className="flex items-center gap-2 text-[14px] font-medium text-white/90 hover:text-white cursor-pointer py-2"
              >
                <ArrowUpDown className="w-4 h-4 text-white/75" />
                <span>Payouts &amp; Limits</span>
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                aria-label="Toggle Sound"
                className="w-11 h-11 rounded-full bg-[#262629] hover:bg-[#323236] flex items-center justify-center text-white cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </>
        )}

        {subView === 'HISTORY' && (
          <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
            {history.map((item) => {
              const isFish =
                item.winner === 'LIL_BLUES' ||
                item.winner === 'BIG_ORANGES' ||
                item.winner === 'HUGE_REDS';
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-[#262629] px-3.5 py-2.5 rounded-xl text-xs"
                >
                  <span className="text-white/60 font-mono-num">
                    #{item.timestamp}
                  </span>
                  <span className="font-semibold text-white flex items-center gap-2">
                    {isFish ? (
                      <HistoryFishBadge type={item.winner} size={20} />
                    ) : (
                      <TwinLeafIcon
                        variant={
                          item.winner === 'WHITE_LEAF' ? 'white' : 'blue'
                        }
                        size={16}
                      />
                    )}
                    <span>
                      {item.winner === 'WHITE_LEAF'
                        ? 'White Leaf (1:1)'
                        : item.winner === 'BLUE_LEAF'
                        ? 'Blue Leaf (1:1)'
                        : item.winner.replace('_', ' ')}
                      {item.multiplier ? ` · ${item.multiplier}x` : ''}
                    </span>
                  </span>
                  <span className="font-mono-num text-[#fbbf24] font-semibold">
                    {item.payoutAmount && item.payoutAmount > 0
                      ? `+₹${item.payoutAmount.toLocaleString('en-IN')}`
                      : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {subView === 'PAYOUTS' && (
          <div className="space-y-2 text-xs text-white/90">
            <div className="flex justify-between bg-[#262629] p-3 rounded-xl">
              <span>White Leaf / Blue Leaf</span>
              <span className="font-mono-num font-bold text-[#fbbf24]">
                1:1 (Up to 10x with Multiplier)
              </span>
            </div>
            <div className="flex justify-between bg-[#262629] p-3 rounded-xl">
              <span>Lil&apos; Blues Bonus</span>
              <span className="font-mono-num font-bold text-[#38bdf8]">10x – 100x</span>
            </div>
            <div className="flex justify-between bg-[#262629] p-3 rounded-xl">
              <span>Big Oranges Bonus</span>
              <span className="font-mono-num font-bold text-[#fbbf24]">20x – 250x</span>
            </div>
            <div className="flex justify-between bg-[#262629] p-3 rounded-xl">
              <span>Huge Reds Bonus</span>
              <span className="font-mono-num font-bold text-[#f87171]">50x – 500x</span>
            </div>
            <div className="flex justify-between bg-[#262629] p-3 rounded-xl">
              <span>Table Limits</span>
              <span className="font-mono-num font-bold">₹10 – ₹1,000,000</span>
            </div>
          </div>
        )}

        {subView === 'HOW_TO_PLAY' && (
          <div className="space-y-2.5 text-xs text-white/80 leading-relaxed">
            <p>
              Place your chips during the 7-second betting window on either of the{' '}
              <strong className="text-white">1:1 Leaf</strong> spots or any of the three{' '}
              <strong className="text-white">Bonus Fish</strong> cards (Lil&apos; Blues, Big
              Oranges, Huge Reds).
            </p>
            <p>
              Tap <strong className="text-[#fbbf24]">ALL BONUSES</strong> to simultaneously
              place your selected chip across all three fish bonus cards.
            </p>
            <p>
              Before each spin stops, random golden multipliers (2x to 10x) splash onto wheel
              segments and boost payouts!
            </p>
          </div>
        )}

        {subView === 'CHAT' && (
          <form onSubmit={handleChatSubmit} className="space-y-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message to live chat..."
              className="w-full bg-[#262629] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#22d3ee]"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#22d3ee] text-slate-950 font-semibold text-sm cursor-pointer"
            >
              Send Message
            </button>
          </form>
        )}

        {subView === 'SETTINGS' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between bg-[#262629] p-3 rounded-xl">
              <span>Game Audio &amp; Sound Effects</span>
              <button
                type="button"
                onClick={onToggleMute}
                className="px-3 py-1.5 rounded-lg bg-white/10 font-semibold text-white cursor-pointer"
              >
                {isMuted ? 'Unmute Audio' : 'Mute Audio'}
              </button>
            </div>
            <div className="flex items-center justify-between bg-[#262629] p-3 rounded-xl">
              <span>Current Balance: ₹{balance.toLocaleString('en-IN')}</span>
              <button
                type="button"
                onClick={() => {
                  onResetBalance(22280);
                  handleClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#fbbf24] text-slate-950 font-bold cursor-pointer"
              >
                Reset to ₹22,280
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
