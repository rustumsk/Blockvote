import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import PublicElectionsPage from './pages/public/PublicElectionsPage';
import PublishedElectionsPage from './pages/public/PublishedElectionsPage';
import CandidateProfilePage from './pages/public/CandidateProfilePage';
import PublicElectionDetailPage from './pages/public/PublicElectionDetailPage';
import PublicVerifyPage from './pages/public/PublicVerifyPage';
import RequireRole from './components/routing/RequireRole';

function App() {
  return (
    <BrowserRouter>
      <>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/elections" element={<PublicElectionsPage />} />
          <Route path="/published-elections" element={<PublishedElectionsPage />} />
          <Route path="/elections/:id" element={<PublicElectionDetailPage />} />
          <Route path="/elections/:electionId/candidates/:candidateId" element={<CandidateProfilePage />} />
          <Route path="/verify" element={<PublicVerifyPage />} />

          {/* Voter */}
          <Route element={<RequireRole role="VOTER" />}>
            <Route path="/voter/dashboard" element={<VoterDashboard />} />
            <Route path="/voter/elections" element={<ElectionsPage />} />
            <Route path="/voter/elections/:id" element={<VotePage />} />
            <Route path="/voter/elections/:id/vote" element={<VotePage />} />
            <Route path="/voter/receipt" element={<ReceiptPage />} />
            <Route path="/voter/verify" element={<VerifyPage />} />
            <Route path="/voter/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin */}
          <Route element={<RequireRole role="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/elections" element={<ManageElectionsPage />} />
            <Route path="/admin/elections/:id" element={<ElectionDetailPage />} />
            <Route path="/admin/voters" element={<ManageVotersPage />} />
            <Route path="/admin/logs" element={<BlockchainLogsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3500}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
      </>
    </BrowserRouter>
  );
}

export default App;
