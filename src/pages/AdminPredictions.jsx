import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminPredictions() {
  const { user } = useAuth();
  const [liveMatches, setLiveMatches] = useState([]);
  const [existingPredictions, setExistingPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [formData, setFormData] = useState({
    matchId: '',
    teams: ['', ''],
    predictionText: '',
    tossCall: '',
    winPercentage: { teamA: 50, teamB: 50 },
    isPremium: false,
    matchStartTime: '',
  });

  // Load live matches + existing predictions
  useEffect(() => {
    if (user?.role !== 'admin') return;

    Promise.all([
      api.get('/predictions/admin/live-matches'),
      api.get('/predictions'),
    ])
      .then(([live, existing]) => {
        setLiveMatches(live.data);
        setExistingPredictions(existing.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="container-app py-16 max-w-md text-center">
        <div className="card">
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-4">Admin access required.</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  // Pick a match from CricAPI list
  const pickMatch = (match) => {
    setSelectedMatch(match);
    setFormData({
      matchId: match.id,
      teams: match.teams || ['', ''],
      predictionText: '',
      tossCall: '',
      winPercentage: { teamA: 50, teamB: 50 },
      isPremium: false,
      matchStartTime: match.dateTimeGMT || '',
    });
    setMessage('');
    setError('');
  };

  // Load an existing prediction for editing
  const editExisting = (pred) => {
    setSelectedMatch({
      id: pred.matchId,
      name: pred.teams?.join(' vs ') || pred.matchId,
      teams: pred.teams,
    });
    setFormData({
      matchId: pred.matchId,
      teams: pred.teams || ['', ''],
      predictionText: pred.predictionText || '',
      tossCall: pred.tossCall || '',
      winPercentage: pred.winPercentage || { teamA: 50, teamB: 50 },
      isPremium: pred.isPremium || false,
      matchStartTime: pred.matchStartTime || '',
    });
    setMessage('');
    setError('');
  };

  // Adjust team A percentage and auto-balance team B
  const setTeamAPercent = (val) => {
    const a = Math.min(99, Math.max(1, Number(val)));
    setFormData((prev) => ({
      ...prev,
      winPercentage: { teamA: a, teamB: 100 - a },
    }));
  };

  const savePrediction = async () => {
    setError('');
    setMessage('');

    if (!formData.matchId) return setError('Please select a match first');
    if (!formData.predictionText.trim())
      return setError('Prediction text is required');

    setSaving(true);
    try {
      await api.post('/predictions', formData);
      setMessage('✅ Prediction saved successfully!');

      // Reload existing predictions list
      const r = await api.get('/predictions');
      setExistingPredictions(r.data);

      // Reset form after 1.5s
      setTimeout(() => {
        setSelectedMatch(null);
        setFormData({
          matchId: '',
          teams: ['', ''],
          predictionText: '',
          tossCall: '',
          winPercentage: { teamA: 50, teamB: 50 },
          isPremium: false,
          matchStartTime: '',
        });
        setMessage('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-app py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <Link to="/admin/transactions" className="btn-outline text-sm">
            Transactions
          </Link>
        </div>
      </div>

      {/* Layout: Left = match list, Right = form */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT: Existing predictions + live matches */}
        <div className="lg:col-span-1 space-y-4">
          {/* Existing predictions */}
          <div className="card">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              📝 Published Predictions
              <span className="text-xs bg-pitch text-white px-2 py-0.5 rounded-full">
                {existingPredictions.length}
              </span>
            </h2>

            {existingPredictions.length === 0 ? (
              <p className="text-slate-400 text-sm">No predictions yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {existingPredictions.map((p) => (
                  <button
                    key={p.matchId}
                    onClick={() => editExisting(p)}
                    className={`w-full text-left p-3 rounded-lg border transition
                      ${
                        formData.matchId === p.matchId
                          ? 'border-pitch bg-pitch/10'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm font-semibold">
                        {p.teams?.join(' vs ')}
                      </span>
                      {p.isPremium && (
                        <span className="badge-premium text-[10px]">PRO</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {p.predictionText?.slice(0, 60) || 'No text'}...
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live matches from CricAPI */}
          <div className="card">
            <h2 className="font-bold mb-3">
              🌐 Live/Upcoming Matches
              <span className="text-xs text-slate-500 font-normal ml-2">
                from CricAPI
              </span>
            </h2>

            {loading ? (
              <div className="skeleton h-20" />
            ) : liveMatches.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No live matches found. Check your CricAPI key in `server/.env`.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {liveMatches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => pickMatch(m)}
                    className={`w-full text-left p-3 rounded-lg border transition
                      ${
                        selectedMatch?.id === m.id
                          ? 'border-pitch bg-pitch/10'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm font-semibold leading-tight">
                        {m.name}
                      </span>
                      {m.matchStarted && !m.matchEnded && (
                        <span className="badge-live text-[10px]">LIVE</span>
                      )}
                    </div>
                    {m.status && (
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {m.status}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Prediction form */}
        <div className="lg:col-span-2">
          {!selectedMatch ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-3">👈</div>
              <p className="text-slate-400">
                Select a live match or an existing prediction to start editing.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedMatch.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Match ID: <span className="font-mono">{formData.matchId}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕ Close
                </button>
              </div>

              <div className="divider" />

              {/* Teams display */}
              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Team A</label>
                  <input
                    type="text"
                    value={formData.teams[0] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teams: [e.target.value, formData.teams[1] || ''],
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Team B</label>
                  <input
                    type="text"
                    value={formData.teams[1] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teams: [formData.teams[0] || '', e.target.value],
                      })
                    }
                  />
                </div>
              </div>

              {/* Toss call */}
              <div className="input-group">
                <label className="input-label">🪙 Toss Prediction</label>
                <input
                  type="text"
                  value={formData.tossCall}
                  onChange={(e) =>
                    setFormData({ ...formData, tossCall: e.target.value })
                  }
                  placeholder="e.g. India wins toss, chooses to bat"
                />
              </div>

              {/* Prediction text */}
              <div className="input-group">
                <label className="input-label">🎯 Match Prediction (your analysis)</label>
                <textarea
                  rows={6}
                  value={formData.predictionText}
                  onChange={(e) =>
                    setFormData({ ...formData, predictionText: e.target.value })
                  }
                  placeholder="Write your analysis here. This is what users will see (if premium, only premium users see it)."
                  className="resize-none"
                />
              </div>

              {/* Win percentage */}
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <label className="input-label mb-0">
                    📊 Base Winning Chances
                  </label>
                  <span className="text-xs text-slate-500">
                    Users can adjust locally — this is your base
                  </span>
                </div>

                <div className="flex justify-between items-center mb-2 text-sm">
                  <span>{formData.teams[0] || 'Team A'}: <strong className="text-pitch-light">{formData.winPercentage.teamA}%</strong></span>
                  <span>{formData.teams[1] || 'Team B'}: <strong className="text-premium">{formData.winPercentage.teamB}%</strong></span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="99"
                  value={formData.winPercentage.teamA}
                  onChange={(e) => setTeamAPercent(e.target.value)}
                  className="w-full accent-pitch"
                />
              </div>

              {/* Premium toggle */}
              <div className="flex items-center justify-between bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                <div>
                  <p className="font-semibold">⭐ Premium Content</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Only premium users will see the prediction text and toss call
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isPremium: !formData.isPremium })
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    formData.isPremium ? 'bg-premium' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.isPremium ? 'translate-x-7' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Match start time */}
              <div className="input-group">
                <label className="input-label">
                  Match Start Time (optional — used for sorting)
                </label>
                <input
                  type="datetime-local"
                  value={
                    formData.matchStartTime
                      ? new Date(formData.matchStartTime)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      matchStartTime: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : '',
                    })
                  }
                />
              </div>

              {/* Messages */}
              {error && (
                <p className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg">
                  ❌ {error}
                </p>
              )}
              {message && (
                <p className="text-green-400 text-sm bg-green-950/30 p-3 rounded-lg">
                  {message}
                </p>
              )}

              {/* Save button */}
              <button
                onClick={savePrediction}
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? 'Saving…' : '💾 Save Prediction'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}