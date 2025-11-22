import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Palette } from './components/Builder/Palette';
import { Canvas } from './components/Builder/Canvas';
import { Button } from './components/ui/Button';
import { evaluateTokens } from './lib/engine';
import type { Token } from '@/types';
import { logAudit, getAuditLogs } from './services/audit';
import { UserProvider, useUser } from './stores/useUser';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Inter } from 'next/font/google';

type View = 'builder' | 'admin' | 'tests';

const initialTokens: Token[] = [];

const AppContent: React.FC = () => {
  const [tokens, setTokens] = useLocalStorage<Token[]>('calcforge.tokens', initialTokens);
  const [memory, setMemory] = useLocalStorage<number | null>('calcforge.memory', null);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useLocalStorage<{ expr: string; value: number; ts: string }[]>('calcforge.history', []);
  const [view, setView] = useState<View>('builder');
  const [online, setOnline] = useLocalStorage<boolean>('calcforge.online', true);
  const [templateName, setTemplateName] = useState<string>('Untitled Calculator');

  // On add token from palette
  const handleAddToken = useCallback((item: { id: string; type: string; value: string }) => {
    const t: Token = { id: Date.now(), type: item.type as any, value: item.value };
    setTokens([...tokens, t]);
    logAudit(`Added token ${item.value} to expression`, 'INFO');
  }, [tokens, setTokens]);

  const evaluate = useCallback(() => {
    try {
      const val = evaluateTokens(tokens, memory ?? undefined);
      setResult(val);
      const expr = tokens.map(t => t.value).join(' ');
      const ts = new Date().toISOString();
      setHistory([{ expr, value: val, ts }, ...history].slice(0, 100));
      logAudit(`Evaluated expression. Result=${val}`);
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      logAudit(`Evaluation error: ${err}`, 'ERROR');
      setResult(null);
    }
  }, [tokens, memory, history, setHistory]);

  const clearAll = useCallback(() => {
    setTokens([]);
    setMemory(null);
    setResult(null);
  }, [setTokens, setMemory, setResult]);

  const removeLast = useCallback(() => {
    setTokens(tokens.slice(0, -1));
  }, [tokens, setTokens]);

  // Save current tokens as a version
  const saveTemplate = useCallback(() => {
    if (!templateName) return;
    const version = {
      id: Date.now().toString(),
      name: templateName,
      timestamp: new Date().toISOString(),
      tokens: tokens
    };
    logAudit(`Saved template version: ${templateName}`, 'INFO');
    // Persist versions in localStorage as a simple array
    const key = 'calcforge.templates';
    const existing = (localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key) as string) : []) as any[];
    existing.push(version);
    localStorage.setItem(key, JSON.stringify(existing));
  }, [templateName, tokens]);

  // Sync mock (offline-first demonstration)
  const sync = useCallback(() => {
    if (!online) {
      logAudit('Sync skipped: offline mode', 'WARN');
      return;
    }
    const cloudKey = 'calcforge.cloud';
    const payload = { memory, tokens, result, history };
    localStorage.setItem(cloudKey, JSON.stringify(payload));
    logAudit('Synced data to cloud', 'INFO');
  }, [online, memory, tokens, result, history]);

  // Run tests (simple inline tests using engine)
  const runTests = useCallback(() => {
    // Basic evaluator tests
    const tests: { input: Token[]; expected: number }[] = [
      { input: [{ id:0,type:'number',value:'2'},{id:1,type:'operator',value:'+'},{id:2,type:'number',value:'3'}], expected: 5 },
      { input: [{ id:0,type:'number',value:'10'},{ id:1, type:'operator', value:'/' }, { id:2, type:'number', value:'2' }], expected: 5 },
      { input: [{ id:0,type:'number',value:'6'},{ id:1, type:'operator', value:'*' }, { id:2, type:'number', value:'7' }], expected: 42 }
    ];
    const failures: string[] = [];
    for (const t of tests) {
      // Convert to tokens with 'memory' left undefined
      try {
        const val = evaluateTokens(t.input, memory ?? undefined);
        if (Math.abs(val - t.expected) > 1e-6) {
          failures.push(`Expected ${t.expected} got ${val}`);
        }
      } catch (e) {
        failures.push('Eval error');
      }
    }
    if (failures.length === 0) {
      logAudit('All tests passed', 'INFO');
      alert('All tests passed');
    } else {
      logAudit(`Tests failed: ${failures.length} failures`, 'ERROR');
      alert('Tests failed: ' + failures.join('; '));
    }
  }, [memory]);

  // UI derived values
  const expression = useMemo(() => tokens.map(t => t.value).join(' '), [tokens]);

  // Persist tokens to template names as we type
  useEffect(() => {
    // auto-save on memory changes for offline UX
  }, [memory]);

  // Simple keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveTemplate();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        evaluate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saveTemplate, evaluate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <header className="p-4 bg-primary shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold tracking-wide" style={{ color: '#fff' }}>CalcForge</div>
          <nav className="flex gap-2">
            <button className="px-4 py-2 rounded bg-accent text-white hover:opacity-90" onClick={() => setView('builder')}>Builder</button>
            <button className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600" onClick={() => setView('admin')}>Audit</button>
            <button className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600" onClick={() => setView('tests')}>Tests</button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="col-span-1 lg:col-span-1">
          <div className="bg-white/5 p-3 rounded-md mb-4">
            <div className="text-sm font-semibold mb-2">Brand & User</div>
            <div className="flex flex-col gap-2">
              <span className="text-xs">Memory: {memory ?? 'n/a'}</span>
              <span className="text-xs">Expression Length: {tokens.length}</span>
              <div className="flex gap-2 mt-1">
                <button className="px-3 py-1 rounded bg-accent text-white" onClick={() => logAudit('Clicked sync', 'INFO')}>Audit</button>
                <button className="px-3 py-1 rounded bg-primary text-white" onClick={sync}>Sync</button>
              </div>
            </div>
          </div>
          <Palette onAdd={handleAddToken} />
        </section>
        <section className="col-span-2 lg:col-span-1">
          <Canvas tokens={tokens} onRemoveLast={removeLast} onClear={() => setTokens([])} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-3 rounded-md">
              <div className="text-sm font-semibold mb-2">Live Display</div>
              <div className="text-sm">Expression: {expression || '(empty)'}</div>
              <div className="mt-2 text-lg">Result: {result ?? '—'}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-md">
              <div className="text-sm font-semibold mb-2">Memory</div>
              <div className="flex items-center gap-2">
                <input
                  aria-label="Memory value"
                  className="bg-white/90 text-black rounded p-2 w-full"
                  placeholder={memory?.toString() ?? 'Set memory via evaluator'}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!Number.isNaN(val)) setMemory(val);
                  }}
                />
              </div>
              <button className="mt-2 w-full px-3 py-2 rounded bg-primary text-white" onClick={() => memory != null ? setMemory(null) : setMemory(0)}>Mem 0/clear</button>
            </div>
          </div>
        </section>
      </main>
      <section className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/5 p-3 rounded-md">
          <div className="text-sm font-semibold mb-2">History</div>
          <div className="max-h-40 overflow-auto text-sm space-y-1">
            {history.length === 0 && <div className="text-gray-300">No history yet.</div>}
            {history.map((h, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="truncate w-ful">{h.expr}</span>
                <span className="ml-2 text-xs text-gray-300">{h.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 p-3 rounded-md">
          <div className="text-sm font-semibold mb-2">Templates</div>
          <input className="bg-white/90 rounded p-2 w-full" placeholder="Template name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
          <div className="flex gap-2 mt-2">
            <button className="px-3 py-1 rounded bg-primary text-white" onClick={saveTemplate}>Save Version</button>
            <button className="px-3 py-1 rounded bg-gray-700 text-white" onClick={() => setTokens([])}>Clear Builder</button>
          </div>
        </div>
        <div className="bg-white/5 p-3 rounded-md">
          <div className="text-sm font-semibold mb-2">Sync Status</div>
          <div className="text-sm">Cloud: {online ? 'Online' : 'Offline'}</div>
          <button className="mt-2 w-full px-3 py-1 rounded bg-accent text-white" onClick={() => setOnline((v) => !v)}>
            Toggle Online
          </button>
          <button className="mt-2 w-full px-3 py-1 rounded bg-gray-700 text-white" onClick={runTests}>Run Tests</button>
        </div>
      </section>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </div>
  );
};

export default App;
