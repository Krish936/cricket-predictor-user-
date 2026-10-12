import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  { id: '2', name: 'Valid for 2 Matches Only', price: 199, Matches: 2 },
  { id: '7', name: 'Package of 7 Matches', price: 699, Matches: 7 },
  { id: '1', name: 'Valid for 1 Match Only', price: 99, Matches: 1 },
];

export default function Premium() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('monthly');
  const [utr, setUtr] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait one tick so AuthContext hydrates from localStorage
  if (!mounted) {
    return (
      <div className="container-app py-16 max-w-md text-center">
        <div className="skeleton h-40" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="container-app py-16 max-w-md">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-3">Login Required</h1>
          <p className="text-slate-400 mb-5">
            Please login or register to buy premium access.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="btn-outline">Login</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  // Already premium
  if (user.isPremium) {
    return (
      <div className="container-app py-16 max-w-md">
        <div className="card text-center">
          <div className="text-5xl mb-3">⭐</div>
          <h1 className="text-2xl font-bold mb-2">You're Premium!</h1>
          <p className="text-slate-400 mb-5">
            Enjoy all locked predictions and premium content.
          </p>
          <Link to="/" className="btn-primary">Browse Matches</Link>
        </div>
      </div>
    );
  }

  const plan = PLANS.find((p) => p.id === selected) || PLANS[0];

  const submitUTR = async () => {
    setError('');
    if (!/^\d{12}$/.test(utr)) {
      return setError('UTR must be exactly 12 digits');
    }
    if (!token) {
      return setError('Please log in again');
    }

    setLoading(true);
    try {
      await api.post('/payment/submit-utr', { plan: selected, utr });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gradient text-center">
        Upgrade to Premium
      </h1>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map((p) => (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelected(p.id)}
                className={`card text-left transition ${
                  selected === p.id
                    ? 'border-premium ring-2 ring-premium/30'
                    : ''
                }`}
              >
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-2xl text-premium mt-2">₹{p.price}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {p.days} days access
                </p>
              </motion.button>
            ))}
          </div>

          <button className="btn-premium w-full" onClick={() => setStep(2)}>
            Continue with {plan.name} — ₹{plan.price}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card space-y-4">
          <h2 className="text-xl font-bold">Pay ₹{plan.price} via UPI</h2>

          <div className="bg-white p-3 rounded-lg w-fit mx-auto">
            <img
              src="/paytm-qr.png"
              alt="Paytm QR Code"
              className="w-56 h-56 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML =
                  '<p class="text-black text-xs p-4">QR code not uploaded yet</p>';
              }}
            />
          </div>

          <p className="text-center text-sm text-slate-400">
            Scan with any UPI app — Paytm, GPay, PhonePe, BHIM
          </p>

          <div className="text-center font-mono text-pitch-light text-lg">
            UPI ID: yourname@paytm
          </div>

          <div className="h-px bg-slate-800" />

          <div>
            <label className="text-sm text-slate-300 block mb-1">
              Enter 12-digit UTR / Transaction ID after payment
            </label>
            <input
              type="text"
              value={utr}
              onChange={(e) =>
                setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))
              }
              placeholder="e.g. 412345678901"
              maxLength={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono tracking-widest text-center text-lg"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={submitUTR}
            disabled={loading}
            className="btn-premium w-full"
          >
            {loading ? 'Submitting…' : 'Submit for Verification'}
          </button>

          <button
            onClick={() => setStep(1)}
            className="text-slate-400 text-sm w-full hover:text-white"
          >
            ← Back to plans
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="card text-center space-y-3">
          <div className="text-5xl">⏳</div>
          <h2 className="text-xl font-bold">Submission Received</h2>
          <p className="text-slate-400">
            We'll verify your UTR within 30 minutes. You'll be upgraded once
            approved.
          </p>
          <Link to="/dashboard" className="btn-outline inline-block">
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}