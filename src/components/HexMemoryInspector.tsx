import React, { useState } from 'react';
import { 
  Binary, 
  RotateCcw, 
  Copy, 
  Check, 
  Cpu, 
  Layers, 
  Info, 
  FileCode,
  Zap
} from 'lucide-react';
import { sounds } from '../audio/soundEffects';

interface ByteData {
  offset: number;
  hex: string;
  originalHex: string;
  isModified: boolean;
}

const INITIAL_BYTES: string[] = [
  // 0x00401000: Function preamble & basic block
  '55', '48', '89', 'E5', '48', '83', 'EC', '10',
  '48', '8D', '05', 'EF', 'FF', 'FF', 'FF', '00',
  // 0x00401010: Conditional check & jump
  '80', '38', '90', '74', '14', 'B8', '0A', '00',
  '00', '00', 'BF', '00', '10', '40', '00', 'BE',
  // 0x00401020: Syscall parameters
  '00', '10', '00', '00', 'BA', '07', '00', '00',
  '00', '0F', '05', 'C6', '00', '90', 'C6', '40',
  // 0x00401030: Epilogue
  '01', '90', '48', '83', 'C4', '10', '5D', 'C3',
  '90', '90', '90', '90', '90', '90', '90', '90'
];

export const HexMemoryInspector: React.FC = () => {
  const [bytes, setBytes] = useState<ByteData[]>(() =>
    INITIAL_BYTES.map((hex, index) => ({
      offset: index,
      hex,
      originalHex: hex,
      isModified: false,
    }))
  );

  const [selectedOffset, setSelectedOffset] = useState<number>(0);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [inspectorSubTab, setInspectorSubTab] = useState<'hex' | 'disasm'>('hex');

  const selectedByte = bytes[selectedOffset] || bytes[0];

  const handleBytePatch = (offset: number, newHex: string) => {
    sounds.memoryWrite();
    setBytes((prev) =>
      prev.map((b) =>
        b.offset === offset
          ? { ...b, hex: newHex.toUpperCase(), isModified: newHex.toUpperCase() !== b.originalHex }
          : b
      )
    );
  };

  const handleResetAll = () => {
    sounds.reset();
    setBytes(
      INITIAL_BYTES.map((hex, index) => ({
        offset: index,
        hex,
        originalHex: hex,
        isModified: false,
      }))
    );
  };

  const handleCopyFormatted = (format: 'c' | 'python' | 'hex' | 'shellcode') => {
    sounds.click();
    let text = '';
    if (format === 'c') {
      text = `unsigned char patched_code[] = {\n  ` +
        bytes.map((b, i) => `0x${b.hex}${i < bytes.length - 1 ? ',' : ''}${(i + 1) % 8 === 0 ? '\n  ' : ' '}`).join('') +
        `\n};`;
      setCopiedFormat('C Array');
    } else if (format === 'python') {
      text = `patched_code = b"` + bytes.map(b => `\\x${b.hex.toLowerCase()}`).join('') + `"`;
      setCopiedFormat('Python bytes');
    } else if (format === 'hex') {
      text = bytes.map(b => b.hex).join('');
      setCopiedFormat('Raw Hex');
    } else if (format === 'shellcode') {
      text = bytes.map(b => `\\x${b.hex}`).join('');
      setCopiedFormat('Shellcode');
    }
    navigator.clipboard.writeText(text);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Quick opcode explainer helper
  const getOpcodeDetails = (hex: string) => {
    switch (hex.toUpperCase()) {
      case '90': return { name: 'NOP', desc: 'No Operation (single byte padding / delay)', risk: 'Safe' };
      case '55': return { name: 'PUSH RBP', desc: 'Saves stack frame base pointer', risk: 'Preamble' };
      case '48': return { name: 'REX.W Prefix', desc: '64-bit operand size override prefix', risk: 'Instruction Prefix' };
      case '89': return { name: 'MOV r/m64, r64', desc: 'Move register to register/memory', risk: 'Data Transfer' };
      case 'E5': return { name: 'MOD/RM byte', desc: 'Specifies RBP, RSP register addressing', risk: 'Operand Specifier' };
      case 'CC': return { name: 'INT3', desc: 'Trap to debugger / Software breakpoint', risk: 'Interrupt' };
      case 'C3': return { name: 'RET', desc: 'Near return to calling function', risk: 'Control Flow' };
      case '74': return { name: 'JZ rel8 (JE)', desc: 'Jump short if zero (ZF=1)', risk: 'Conditional Branch' };
      case '75': return { name: 'JNZ rel8 (JNE)', desc: 'Jump short if not zero (ZF=0)', risk: 'Conditional Branch' };
      case '0F': return { name: 'Escape Opcode', desc: 'Prefix for 2-byte opcode extensions', risk: 'Prefix' };
      case '05': return { name: 'SYSCALL', desc: 'Transition to ring 0 kernel privilege', risk: 'Kernel Trap' };
      case '31': return { name: 'XOR r/m, r', desc: 'Bitwise exclusive OR (fast zeroing)', risk: 'ALU' };
      default: return { name: `BYTE (0x${hex})`, desc: 'Immediate data or displacement offset', risk: 'Operand' };
    }
  };

  const selectedOpDetails = getOpcodeDetails(selectedByte.hex);

  // Real-time x86-64 Linear Disassembler for 64-byte segment
  const disassembledInstructions = React.useMemo(() => {
    const list: Array<{
      address: number;
      startOffset: number;
      endOffset: number;
      hexBytes: string[];
      isModified: boolean;
      mnemonic: string;
      operands: string;
      comment: string;
    }> = [];

    let i = 0;
    while (i < bytes.length) {
      const start = i;
      const b0 = bytes[i]?.hex || '';
      const b1 = bytes[i + 1]?.hex || '';
      const b2 = bytes[i + 2]?.hex || '';
      const b3 = bytes[i + 3]?.hex || '';

      let len = 1;
      let mnemonic = 'DB';
      let operands = `0x${b0}`;
      let comment = 'Data byte';

      if (b0 === '90') {
        len = 1; mnemonic = 'NOP'; operands = ''; comment = 'No operation';
      } else if (b0 === 'CC') {
        len = 1; mnemonic = 'INT3'; operands = ''; comment = 'Debugger trap breakpoint';
      } else if (b0 === 'C3') {
        len = 1; mnemonic = 'RET'; operands = ''; comment = 'Near return from call';
      } else if (b0 === '55') {
        len = 1; mnemonic = 'PUSH'; operands = 'rbp'; comment = 'Save frame base pointer';
      } else if (b0 === '5D') {
        len = 1; mnemonic = 'POP'; operands = 'rbp'; comment = 'Restore frame base pointer';
      } else if (b0 === '0F' && b1 === '05') {
        len = 2; mnemonic = 'SYSCALL'; operands = ''; comment = 'POSIX kernel syscall trap';
      } else if (b0 === '74') {
        len = 2; mnemonic = 'JZ'; operands = `+0x${b1} (0x${(0x00401000 + i + 2 + parseInt(b1 || '0', 16)).toString(16).toUpperCase()})`; comment = 'Branch if ZF=1';
      } else if (b0 === '75') {
        len = 2; mnemonic = 'JNZ'; operands = `+0x${b1} (0x${(0x00401000 + i + 2 + parseInt(b1 || '0', 16)).toString(16).toUpperCase()})`; comment = 'Branch if ZF=0';
      } else if (b0 === '31' && b1 === 'C0') {
        len = 2; mnemonic = 'XOR'; operands = 'eax, eax'; comment = 'Clear return value (0)';
      } else if (b0 === '48' && b1 === '89' && b2 === 'E5') {
        len = 3; mnemonic = 'MOV'; operands = 'rbp, rsp'; comment = 'Establish base frame';
      } else if (b0 === '48' && b1 === '83' && b2 === 'EC') {
        len = 4; mnemonic = 'SUB'; operands = `rsp, 0x${b3}`; comment = 'Allocate stack storage';
      } else if (b0 === '48' && b1 === '83' && b2 === 'C4') {
        len = 4; mnemonic = 'ADD'; operands = `rsp, 0x${b3}`; comment = 'Reclaim stack frame';
      } else if (b0 === '48' && b1 === '8D' && b2 === '05') {
        len = 7; mnemonic = 'LEA'; operands = 'rax, [rip - 0x11]'; comment = 'Compute self function ptr';
      } else if (b0 === '80' && b1 === '38' && b2 === '90') {
        len = 3; mnemonic = 'CMP'; operands = 'byte ptr [rax], 0x90'; comment = 'Check if patched with NOP';
      } else if (b0 === 'B8') {
        len = 5; mnemonic = 'MOV'; operands = 'eax, 0x0A'; comment = 'Syscall __NR_mprotect (10)';
      } else if (b0 === 'BF') {
        len = 5; mnemonic = 'MOV'; operands = 'edi, 0x00401000'; comment = 'Arg 1: Page aligned addr';
      } else if (b0 === 'BE') {
        len = 5; mnemonic = 'MOV'; operands = 'esi, 0x1000'; comment = 'Arg 2: Length (4096 bytes)';
      } else if (b0 === 'BA') {
        len = 5; mnemonic = 'MOV'; operands = 'edx, 0x7'; comment = 'Arg 3: PROT_READ|WRITE|EXEC';
      } else if (b0 === 'C6' && b1 === '00' && b2 === '90') {
        len = 3; mnemonic = 'MOV'; operands = 'byte ptr [rax], 0x90'; comment = 'Hotpatch byte 0 with NOP';
      } else if (b0 === 'C6' && b1 === '40' && b2 === '01') {
        len = 4; mnemonic = 'MOV'; operands = 'byte ptr [rax+1], 0x90'; comment = 'Hotpatch byte 1 with NOP';
      }

      len = Math.min(len, bytes.length - i);
      const slice = bytes.slice(i, i + len);
      list.push({
        address: 0x00401000 + start,
        startOffset: start,
        endOffset: start + len - 1,
        hexBytes: slice.map(b => b.hex),
        isModified: slice.some(b => b.isModified),
        mnemonic,
        operands,
        comment,
      });

      i += len;
    }

    return list;
  }, [bytes]);

  // Group bytes into 16-byte rows
  const rows = [];
  for (let i = 0; i < bytes.length; i += 16) {
    rows.push({
      baseAddress: 0x00401000 + i,
      bytes: bytes.slice(i, i + 16),
    });
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-emerald-500/30 bg-[#080d10]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
              BINARY MACHINE CODE ANALYSIS
            </span>
            <span className="text-xs font-mono text-neutral-400">HEX MEMORY VIEW & IN-PLACE PATCHER</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">
            HEX & OPCODE MEMORY INSPECTOR
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format exporter buttons */}
          <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-900/80 p-0.5 font-mono text-[11px]">
            <button
              onClick={() => handleCopyFormatted('c')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {copiedFormat === 'C Array' ? <span className="text-emerald-400 font-bold">✓ C Array</span> : 'C Array'}
            </button>
            <button
              onClick={() => handleCopyFormatted('python')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {copiedFormat === 'Python bytes' ? <span className="text-emerald-400 font-bold">✓ Py Bytes</span> : 'Py Bytes'}
            </button>
            <button
              onClick={() => handleCopyFormatted('shellcode')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {copiedFormat === 'Shellcode' ? <span className="text-emerald-400 font-bold">✓ Shellcode</span> : '\\x Hex'}
            </button>
            <button
              onClick={() => handleCopyFormatted('hex')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {copiedFormat === 'Raw Hex' ? <span className="text-emerald-400 font-bold">✓ Raw</span> : 'Raw Hex'}
            </button>
          </div>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-mono text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Hex Dump + Opcode Patching Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hex Grid & Disassembler Table */}
        <div className="lg:col-span-8 rounded-2xl border border-emerald-950/80 bg-[#070b0e] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-emerald-400" />
              <h2 className="font-mono font-bold text-sm text-white uppercase">
                CODE SEGMENT INSPECTOR
              </h2>
            </div>

            {/* View Sub-Tab Switcher */}
            <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-900/80 p-0.5 font-mono text-xs">
              <button
                onClick={() => {
                  sounds.click();
                  setInspectorSubTab('hex');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  inspectorSubTab === 'hex'
                    ? 'bg-emerald-500 text-black font-bold shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Hex Matrix
              </button>
              <button
                onClick={() => {
                  sounds.click();
                  setInspectorSubTab('disasm');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  inspectorSubTab === 'disasm'
                    ? 'bg-emerald-500 text-black font-bold shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Live Disassembly
              </button>
            </div>
          </div>

          {inspectorSubTab === 'hex' ? (
            <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 font-mono text-xs overflow-x-auto">
              {/* Header Offset labels */}
              <div className="flex items-center pb-2 border-b border-neutral-800 text-[11px] text-neutral-500">
                <span className="w-24 text-neutral-400">Offset</span>
                <div className="flex-1 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1.5 text-center">
                  {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'].map(h => (
                    <span key={h}>{h}</span>
                  ))}
                </div>
                <span className="w-28 text-right pr-2">ASCII</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-neutral-900/80 pt-2 space-y-2">
                {rows.map((row) => (
                  <div key={row.baseAddress} className="flex items-center py-1">
                    <span className="w-24 text-neutral-500 text-[11px]">
                      0x{row.baseAddress.toString(16).toUpperCase().padStart(8, '0')}
                    </span>

                    <div className="flex-1 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1.5 text-center">
                      {row.bytes.map((b) => {
                        const isSelected = selectedOffset === b.offset;
                        return (
                          <button
                            key={b.offset}
                            onClick={() => {
                              sounds.click();
                              setSelectedOffset(b.offset);
                            }}
                            className={`py-1 rounded text-xs transition-all font-mono cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-400 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.7)] scale-110 z-10'
                                : b.isModified
                                ? 'bg-rose-950 border border-rose-500/60 text-rose-300 font-bold shadow-[0_0_6px_rgba(244,63,94,0.3)]'
                                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                            }`}
                          >
                            {b.hex}
                          </button>
                        );
                      })}
                    </div>

                    {/* ASCII preview */}
                    <span className="w-28 text-right pr-2 text-neutral-500 text-[11px] tracking-widest font-mono">
                      {row.bytes.map(b => {
                        const code = parseInt(b.hex, 16);
                        return code >= 32 && code <= 126 ? String.fromCharCode(code) : '.';
                      }).join('')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Live Disassembly View */
            <div className="rounded-xl border border-neutral-800 bg-[#040608] p-3 font-mono text-xs overflow-x-auto max-h-[380px] overflow-y-auto">
              <div className="grid grid-cols-12 pb-2 border-b border-neutral-800 text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                <span className="col-span-3">Address</span>
                <span className="col-span-3">Machine Bytes</span>
                <span className="col-span-3">Instruction</span>
                <span className="col-span-3 text-right pr-2">Annotation</span>
              </div>

              <div className="divide-y divide-neutral-900/60 pt-1">
                {disassembledInstructions.map((instr) => {
                  const containsSelectedByte = selectedOffset >= instr.startOffset && selectedOffset <= instr.endOffset;
                  return (
                    <div
                      key={instr.address}
                      onClick={() => {
                        sounds.click();
                        setSelectedOffset(instr.startOffset);
                      }}
                      className={`grid grid-cols-12 py-1.5 px-2 rounded-lg cursor-pointer transition-colors items-center ${
                        containsSelectedByte
                          ? 'bg-emerald-950/60 border border-emerald-500/50 text-white'
                          : instr.isModified
                          ? 'bg-rose-950/20 text-rose-200 hover:bg-neutral-900/80'
                          : 'hover:bg-neutral-900/60 text-neutral-300'
                      }`}
                    >
                      <span className="col-span-3 font-mono text-neutral-500 text-[11px]">
                        0x{instr.address.toString(16).toUpperCase().padStart(8, '0')}
                      </span>
                      <span className="col-span-3 font-mono text-emerald-400 text-xs">
                        {instr.hexBytes.join(' ')}
                      </span>
                      <div className="col-span-3 font-mono font-bold text-xs flex items-center gap-1.5">
                        <span className={containsSelectedByte ? 'text-emerald-300' : 'text-cyan-300'}>
                          {instr.mnemonic}
                        </span>
                        <span className="text-white font-normal text-[11px]">
                          {instr.operands}
                        </span>
                      </div>
                      <span className="col-span-3 text-right pr-2 text-[10px] text-neutral-500 font-sans truncate">
                        {instr.comment}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Red highlighted bytes have been mutated from original binary.</span>
            </span>
            <span>Total: 64 bytes</span>
          </div>
        </div>

        {/* Byte Inspector & Patching Panel */}
        <div className="lg:col-span-4 rounded-2xl border border-emerald-950/80 bg-[#080d10] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono font-bold text-sm text-white uppercase">
                BYTE INSPECTOR
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              Offset: +0x{selectedByte.offset.toString(16).toUpperCase()}
            </span>
          </div>

          {/* Active Byte Focus Display */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-[#040608] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">OPCODE HEX:</span>
              <span className="text-2xl font-mono font-bold text-emerald-300">
                0x{selectedByte.hex}
              </span>
            </div>

            <div className="pt-2 border-t border-neutral-800 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Mnemonic:</span>
                <span className="text-white font-bold">{selectedOpDetails.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Category:</span>
                <span className="text-emerald-400">{selectedOpDetails.risk}</span>
              </div>
              <p className="text-[11px] text-neutral-400 pt-1">
                {selectedOpDetails.desc}
              </p>
            </div>
          </div>

          {/* Quick Patch Presets */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-mono text-neutral-400 uppercase block">
              Inject Hotpatch Presets:
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'NOP (0x90)', hex: '90', desc: 'No-op padding' },
                { label: 'INT3 (0xCC)', hex: 'CC', desc: 'Debugger trap' },
                { label: 'RET (0xC3)', hex: 'C3', desc: 'Immediate exit' },
                { label: 'JNZ (0x75)', hex: '75', desc: 'Invert branch' },
                { label: 'JZ (0x74)', hex: '74', desc: 'Branch if zero' },
                { label: 'XOR (0x31)', hex: '31', desc: 'Clear register' },
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleBytePatch(selectedByte.offset, preset.hex)}
                  className="p-2 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:border-emerald-500/50 hover:bg-emerald-950/40 text-left transition-all cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold text-emerald-300 block">{preset.label}</span>
                  <span className="text-[10px] text-neutral-500 block truncate">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/30 text-[11px] font-mono text-neutral-400">
            <span className="text-emerald-400 font-bold block mb-1">How Hotpatching Works:</span>
            In the C poster example, the application overwrote the first instruction with <code className="text-white">0x90 0x90</code> to permanently skip preamble initialization on future runs.
          </div>
        </div>
      </div>
    </div>
  );
};
