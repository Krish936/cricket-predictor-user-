import { useState } from 'react';

export default function WinPercentageToggle({ teamA, teamB, initialA = 50 }) {
  const [mode, setMode] = useState('percent');
  const [a, setA] = useState(initialA);
  const b = 100 - a;

  const toOdds = (p) => (100 / p).toFixed(2);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Live Winning Chances</h3>
        <button
          onClick={() => setMode(mode === 'percent' ? 'odds' : 'percent')}
          className="text-xs bg-slate-800 px-3 py-1 rounded-full hover:bg-slate-700"
        >
          View as: {mode === 'percent' ? '%' : 'Odds'}
        </button>
      </div>

      <div className="flex justify-between text-sm mb-2 text-slate-400">
        <span>{teamA}</span>
        <span>{teamB}</span>
      </div>

      <div className="flex justify-between font-mono text-2xl">
        <span className="text-pitch-light">
          {mode === 'percent' ? `${a}%` : toOdds(a)}
        </span>
        <span className="text-premium">
          {mode === 'percent' ? `${b}%` : toOdds(b)}
        </span>
      </div>

      <input
        type="range"
        min="1"
        max="99"
        value={a}
        onChange={(e) => setA(Number(e.target.value))}
        className="w-full mt-4 accent-pitch"
      />
      <p className="text-xs text-slate-500 mt-1">
        Adjust based on your own analysis (view only — doesn't affect others)
      </p>
    </div>
  );
}