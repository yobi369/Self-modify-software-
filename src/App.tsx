import React, { useState } from 'react';
import { ActiveTab } from './types';
import { Navbar } from './components/Navbar';
import { InfographicView } from './components/InfographicView';
import { RealityVerificationLab } from './components/RealityVerificationLab';
import { AutonomousProductionEngine } from './components/AutonomousProductionEngine';
import { VirtualMemorySimulator } from './components/VirtualMemorySimulator';
import { LiveSandboxPlayground } from './components/LiveSandboxPlayground';
import { HexMemoryInspector } from './components/HexMemoryInspector';
import { SecurityDefenseLab } from './components/SecurityDefenseLab';
import { AiMetamorphicArchitect } from './components/AiMetamorphicArchitect';
import { EvidenceReproductionSuite } from './components/EvidenceReproductionSuite';

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
      {/* Top Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
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
      </main>
    </div>
  );
}
