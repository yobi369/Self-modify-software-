import React from 'react';
import { ActiveTab } from '../types';
import { 
  Cpu, 
  Layers, 
  Terminal, 
  Binary, 
  ShieldCheck, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Code,
  Dna,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { isSoundEnabled, toggleSound, sounds } from '../audio/soundEffects';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) {
      sounds.click();
    }
  };

  // The 8 exposed main sections
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'architecture', label: 'Architecture Visualizer', icon: <Layers className="w-4 h-4" /> },
    { id: 'live_sandbox', label: 'Live Executable Sandbox', icon: <Terminal className="w-4 h-4" />, badge: 'JS/WASM' },
    { id: 'hex_inspector', label: 'Hex & Opcode Memory Inspector', icon: <Binary className="w-4 h-4" /> },
    { id: 'metamorphic_engine', label: 'Metamorphic Mutation Engine', icon: <Dna className="w-4 h-4 text-emerald-400" />, badge: 'Autonomous' },
    { id: 'reality_verification', label: 'Reality Verification Lab', icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />, badge: 'TOST / 95% CI' },
    { id: 'security_defense', label: 'W^X Security & Defense Lab', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'ai_architect', label: 'AI Metamorphic Architect', icon: <Sparkles className="w-4 h-4 text-emerald-400" />, badge: 'AI Engine' },
    { id: 'evidence_suite', label: 'Evidence & Reproduction Suite', icon: <FileCheck className="w-4 h-4 text-amber-400" />, badge: 'SHA-256' },
  ];

  // Map legacy / alias IDs to match active state
  const isTabActive = (tabId: ActiveTab) => {
    if (activeTab === tabId) return true;
    if (tabId === 'architecture' && (activeTab === 'infographic' || activeTab === 'simulator')) return true;
    if (tabId === 'metamorphic_engine' && activeTab === 'autonomous_engine') return true;
    return false;
  };

  return (
    <header className="border-b border-emerald-950/60 bg-[#070b0e]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between py-3 gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <Code className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold tracking-wider text-white text-base">
                  AUTO<span className="text-emerald-400">MORPH</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 font-semibold">
                  Research-Grade Autonomous Software Studio Prototype
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans tracking-tight line-clamp-1">
                Self-Modifying Software Studio &amp; Binary Mutation Research Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={handleSoundToggle}
              className={`p-2 rounded-md border transition-colors ${
                soundOn 
                  ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-400' 
                  : 'border-neutral-800 bg-neutral-900/50 text-neutral-500'
              }`}
              title="Toggle Web Audio"
              aria-label="Toggle Web Audio"
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={handleSoundToggle}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors border ${
              soundOn 
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                : 'border-neutral-800 bg-neutral-900/40 text-neutral-500 hover:text-neutral-400'
            }`}
            title="Toggle synthesizer audio effects"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundOn ? 'SFX ON' : 'SFX OFF'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-cyan-900/40 bg-cyan-950/30 text-[11px] font-mono text-cyan-300/90" title="Claims strictly scoped to empirical test harness & threat model">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>SCOPED TESTBED</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-900/40 bg-emerald-950/20 text-[11px] font-mono text-emerald-400/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>W^X: ENFORCED</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Exposing all 8 sections */}
      <div className="border-t border-neutral-800/60 bg-[#05080b]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
            {tabs.map((tab) => {
              const active = isTabActive(tab.id);
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => {
                    sounds.click();
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border cursor-pointer ${
                    active
                      ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-semibold'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      active 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
