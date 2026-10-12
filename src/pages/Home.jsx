import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/predictions')
      .then((r) => setMatches(r.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = matches.filter((m) => {
    if (filter === 'free') return !m.isPremium;
    if (filter === 'premium') return m.isPremium;
    return true;
  });

  // Group by league
  const grouped = filtered.reduce((acc, m) => {
    const league = m.league || 'Other';
    if (!acc[league]) acc[league] = [];
    acc[league].push(m);
    return acc;
  }, {});

  return (
    <div className="container-app py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
          🏏 <span className="text-gradient">Anthony Tips</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Expert toss calls and match analysis across major cricket leagues.
          70% of matches are completely free.
        </p>
      </motion.div>

      <div className="flex justify-center gap-2 mb-8">
        {[
          { id: 'all', label: 'All Matches' },
          { id: 'free', label: '🆓 Free' },
          { id: 'premium', label: '⭐ Premium' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === f.id
                ? 'bg-pitch text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-pitch'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-6 w-3/4 mb-3" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">
            {filter === 'all'
              ? 'No predictions published yet. Check back soon!'
              : `No ${filter} predictions right now.`}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([league, leagueMatches]) => (
            <div key={league}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-pitch-light">
                  🏆 {league}
                </h2>
                <span className="text-xs text-slate-500">
                  {leagueMatches.length} match
                  {leagueMatches.length !== 1 ? 'es' : ''}
                </span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leagueMatches.map((m, i) => {
                  const isLive =
                    m.matchStartTime &&
                    new Date(m.matchStartTime) < new Date();

                  return (
                    <motion.div
                      key={m.matchId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                      className="card-hover"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold leading-tight flex-1">
                          {m.teams?.join(' vs ') || 'TBD vs TBD'}
                        </h3>
                        {m.isPremium ? (
                          <span className="badge-premium">PRO</span>
                        ) : (
                          <span className="badge-free">FREE</span>
                        )}
                      </div>

                      {m.matchStartTime && (
                        <p className="text-xs text-slate-500 mb-3">
                          {isLive ? (
                            <span className="text-red-400">🔴 Started</span>
                          ) : (
                            <>
                              🕐{' '}
                              {new Date(m.matchStartTime).toLocaleString()}
                            </>
                          )}
                        </p>
                      )}

                      <Link
                        to={`/match/${m.matchId}`}
                        className="text-sm text-pitch-light hover:underline inline-flex items-center gap-1"
                      >
                        View Prediction →
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}