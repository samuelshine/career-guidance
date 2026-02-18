import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BranchExplorerPage from './pages/BranchExplorerPage';
import CoachPage from './pages/CoachPage';
import InterviewPage from './pages/InterviewPage';
import type { ReactNode } from 'react';
import { Toaster } from './components/ui/sonner';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="branches" element={<BranchExplorerPage />} />
          <Route path="coach" element={<CoachPage />} />
          <Route path="interview" element={<InterviewPage />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
