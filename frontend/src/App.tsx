import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import VoterDashboard from './pages/voter/VoterDashboard';
import ElectionsPage from './pages/voter/ElectionsPage';
import VotePage from './pages/voter/VotePage';
import ReceiptPage from './pages/voter/ReceiptPage';
import VerifyPage from './pages/voter/VerifyPage';
import ProfilePage from './pages/voter/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageElectionsPage from './pages/admin/ManageElectionsPage';
import ManageVotersPage from './pages/admin/ManageVotersPage';
import BlockchainLogsPage from './pages/admin/BlockchainLogsPage';
import ElectionDetailPage from './pages/admin/ElectionDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Voter */}
        <Route path="/voter/dashboard" element={<VoterDashboard />} />
        <Route path="/voter/elections" element={<ElectionsPage />} />
        <Route path="/voter/elections/:id/vote" element={<VotePage />} />
        <Route path="/voter/receipt" element={<ReceiptPage />} />
        <Route path="/voter/verify" element={<VerifyPage />} />
        <Route path="/voter/profile" element={<ProfilePage />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/elections" element={<ManageElectionsPage />} />
        <Route path="/admin/elections/:id" element={<ElectionDetailPage />} />
        <Route path="/admin/voters" element={<ManageVotersPage />} />
        <Route path="/admin/logs" element={<BlockchainLogsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
