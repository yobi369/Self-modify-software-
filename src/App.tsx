import React, { lazy, Suspense, useState } from 'react';
import { ActiveTab } from './types';
import { Navbar } from './components/Navbar';
const InfographicView = lazy(() => import('./components/InfographicView').then((module) => ({ default: module.InfographicView })));
const RealityVerificationLab = lazy(() => import('./components/RealityVerificationLab').then((module) => ({ default: module.RealityVerificationLab })));
const AutonomousProductionEngine = lazy(() => import('./components/AutonomousProductionEngine').then((module) => ({ default: module.AutonomousProductionEngine })));
const VirtualMemorySimulator = lazy(() => import('./components/VirtualMemorySimulator').then((module) => ({ default: module.VirtualMemorySimulator })));
const LiveSandboxPlayground = lazy(() => import('./components/LiveSandboxPlayground').then((module) => ({ default: module.LiveSandboxPlayground })));
const HexMemoryInspector = lazy(() => import('./components/HexMemoryInspector').then((module) => ({ default: module.HexMemoryInspector })));
const SecurityDefenseLab = lazy(() => import('./components/SecurityDefenseLab').then((module) => ({ default: module.SecurityDefenseLab })));
const AiMetamorphicArchitect = lazy(() => import('./components/AiMetamorphicArchitect').then((module) => ({ default: module.AiMetamorphicArchitect })));
const EvidenceReproductionSuite = lazy(() => import('./components/EvidenceReproductionSuite').then((module) => ({ default: module.EvidenceReproductionSuite })));

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('architecture');
  const [aiInitialCode, setAiInitialCode] = useState<string | undefined>(undefined);

  const handleLoadInSimulator = () => {
    setActiveTab('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAiArchitect = (snippet?: string) => {
    if (snippet) {
      setAiInitialCode(snippet);
    }
    setActiveTab('ai_architect');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#040709] text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-emerald-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-black">Skip to main content</a>
      {/* Top Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-xs font-mono text-emerald-400" role="status" aria-live="polite">Loading research module…</div>}>
        {(activeTab === 'architecture' || activeTab === 'infographic') && (
          <InfographicView 
            onLoadInSimulator={handleLoadInSimulator}
            onOpenAiArchitect={handleOpenAiArchitect}
            onOpenAutonomousEngine={() => {
              setActiveTab('metamorphic_engine');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'live_sandbox' && (
          <LiveSandboxPlayground />
        )}

        {activeTab === 'hex_inspector' && (
          <HexMemoryInspector />
        )}

        {(activeTab === 'metamorphic_engine' || activeTab === 'autonomous_engine') && (
          <AutonomousProductionEngine />
        )}

        {activeTab === 'reality_verification' && (
          <RealityVerificationLab />
        )}

        {activeTab === 'security_defense' && (
          <SecurityDefenseLab />
        )}

        {activeTab === 'ai_architect' && (
          <AiMetamorphicArchitect initialCode={aiInitialCode} />
        )}

        {activeTab === 'evidence_suite' && (
          <EvidenceReproductionSuite />
        )}

        {activeTab === 'simulator' && (
          <VirtualMemorySimulator />
        )}
        </Suspense>
      </main>
    </div>
  );
}
