import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminTransactions() {
  const { user } = useAuth();
  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/payment/admin/all?status=${filter}`);
      setTxs(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [filter, user]);

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

  const approve = async (id) => {
    if (!confirm('Approve this transaction?')) return;
    await api.post(`/payment/admin/approve/${id}`);
    load();
  };

  const reject = async (id) => {
    const reason = prompt('Rejection reason?') || 'Invalid UTR';
    await api.post(`/payment/admin/reject/${id}`, { reason });
    load();
  };

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-bold mb-6">Transaction Verification</h1>

      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn text-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="skeleton h-24 w-full" />
        ) : txs.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            No {filter} transactions.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Plan</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">UTR</th>
                <th className="text-left p-2">Submitted</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx) => (
                <tr key={tx._id} className="border-b border-slate-800/50">
                  <td className="p-2 text-xs">{tx.userEmail}</td>
                  <td className="p-2 capitalize">{tx.plan}</td>
                  <td className="p-2">₹{tx.amount}</td>
                  <td className="p-2 font-mono text-xs">{tx.utr}</td>
                  <td className="p-2 text-slate-400 text-xs">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 space-x-2">
                    {tx.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => approve(tx._id)}
                          className="text-green-400 hover:underline text-xs"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => reject(tx._id)}
                          className="text-red-400 hover:underline text-xs"
                        >
                          ❌ Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-500 capitalize text-xs">
                        {tx.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}