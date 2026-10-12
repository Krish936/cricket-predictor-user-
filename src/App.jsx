import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Disclaimer from './components/Disclaimer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MatchDetail from './pages/MatchDetail';
import Dashboard from './pages/Dashboard';
import Premium from './pages/Premium';
import AdminTransactions from './pages/AdminTransactions';
import AdminPredictions from './pages/AdminPredictions';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Disclaimer />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/match/:matchId" element={<MatchDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/predictions" element={<AdminPredictions />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}