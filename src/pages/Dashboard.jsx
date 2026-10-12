import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payment/my-transactions')
      .then((r) => setTxs(r.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-app py-10 space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">My Dashboard</h1>

      <div className="card">
        <p className="mb-2"><strong>Email:</strong> {user?.email}</p>
        <p className="mb-2">
          <strong>Status:</strong>{' '}
          {user?.isPremium ? (
            <span className="text-green-400">Premium ✅</span>
          ) : (
            <span className="text-slate-400">Free</span>
          )}
        </p>
        {user?.isPremium && user?.premiumExpiresAt && (
          <p className="text-sm text-slate-400">
            Expires: {new Date(user.premiumExpiresAt).toLocaleDateString()}
          </p>
        )}
        {!user?.isPremium && (
          <Link to="/premium" className="btn-premium mt-4 inline-block">
            ⭐ Upgrade to Premium
          </Link>
        )}
      </div>

      <div className="card">
        <h2 className="font-bold mb-3">Purchase History</h2>
        {loading ? (
          <div className="skeleton h-20 w-full" />
        ) : txs.length === 0 ? (
          <p className="text-slate-400 text-sm">No purchases yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="text-left p-2">Plan</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">UTR</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx._id} className="border-b border-slate-800/50">
                    <td className="p-2 capitalize">{tx.plan}</td>
                    <td className="p-2">₹{tx.amount}</td>
                    <td className="p-2 font-mono text-xs">{tx.utr}</td>
                    <td className="p-2">
                      <span
                        className={
                          tx.status === 'approved' ? 'text-green-400' :
                          tx.status === 'rejected' ? 'text-red-400' :
                          'text-amber-400'
                        }
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-2 text-slate-400 text-xs">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}