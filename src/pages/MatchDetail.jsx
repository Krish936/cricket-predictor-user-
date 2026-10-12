import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import WinPercentageToggle from '../components/WinPercentageToggle';
import { useAuth } from '../context/AuthContext';

export default function MatchDetail() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/predictions/${matchId}`)
      .then((r) => setMatch(r.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) {
    return (
      <div className="container-app py-10 max-w-3xl">
        <div className="skeleton h-8 w-1/2 mb-4" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container-app py-10 max-w-3xl">
        <div className="card text-center">Match not found.</div>
      </div>
    );
  }

  const isLive = match.matchStartTime && new Date(match.matchStartTime) < new Date();

  return (
    <div className="container-app py-10 space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-slate-400 hover:text-white text-sm">
          ← Back
        </Link>
        {match.league && (
          <span className="badge bg-slate-800 text-slate-300">
            {match.league}
          </span>
        )}
        {match.isPremium && <span className="badge-premium">Premium</span>}
        {isLive && <span className="badge-live">STARTED</span>}
      </div>

      <h1 className="text-3xl font-bold">
        {match.teams?.join(' vs ') || 'Match Details'}
      </h1>

      {match.matchStartTime && (
        <p className="text-sm text-slate-400">
          🕐 {new Date(match.matchStartTime).toLocaleString()}
        </p>
      )}

      <WinPercentageToggle
        teamA={match.teams?.[0] || 'Team A'}
        teamB={match.teams?.[1] || 'Team B'}
        initialA={match.winPercentage?.teamA || 50}
      />

      <div className="card">
        <h2 className="font-semibold mb-2 text-pitch-light">🪙 Toss Prediction</h2>
        <p>{match.tossCall || 'Will be published soon.'}</p>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2 text-premium">🎯 Our Prediction</h2>
        {match.locked ? (
          <div className="text-center py-6">
            <p className="text-slate-400 mb-4">
              🔒 This is a premium prediction
            </p>
            {user ? (
              <Link to="/premium" className="btn-premium">
                Unlock Premium
              </Link>
            ) : (
              <Link to="/register" className="btn-premium">
                Register to Unlock
              </Link>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">
            {match.predictionText || 'Coming soon.'}
          </p>
        )}
      </div>

      <div className="card bg-amber-950/20 border-amber-800/50">
        <p className="text-xs text-amber-200/80 text-center">
          ⚠️ Predictions are for educational and entertainment purposes only.
          We do not support or facilitate betting.
        </p>
      </div>
    </div>
  );
}