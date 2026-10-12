import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-800">
      <div className="container-app flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-2xl">🏏</span>
          <span className="text-gradient">Anthony Tips 🌟</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'admin' && (
              <>
               <Link to="/admin/predictions" className="btn-ghost text-sm">
                   📝 Predictions
               </Link>
               <Link to="/admin/transactions" className="btn-ghost text-sm">
                   💳 Transactions
               </Link>
              </>
             )}
              <Link to="/dashboard" className="btn-ghost text-sm">
                Dashboard
              </Link>
              {!user.isPremium && (
                <Link to="/premium" className="btn-premium text-sm">
                  ⭐ Premium
                </Link>
              )}
              <button onClick={handleLogout} className="btn-outline text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Login</Link>
              <Link to="/register" className="btn-primary text-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}