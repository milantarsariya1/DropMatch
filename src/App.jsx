import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import ShopDashboard from './pages/ShopDashboard';
import DropshipperDashboard from './pages/DropshipperDashboard';
import MatchDetail from './pages/MatchDetail';
import ProfileSettings from './pages/ProfileSettings';
import ProfileDetail from './pages/ProfileDetail';
import { Loader2 } from 'lucide-react';

// Route Guard for authenticated users
const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-2" />
        <span className="text-xs text-slate-500 font-medium">Verifying session credentials...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Role mismatch, redirect to user's valid dashboard
    return <Navigate to={user.role === 'shop' ? '/shop' : '/dropshipper'} replace />;
  }

  return children;
};


const AppContent = () => {
  return (
    <BrowserRouter>
      {/* Navigation header */}
      <Navbar />

      {/* Main content page area */}
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          
          <Route 
            path="/shop" 
            element={
              <PrivateRoute allowedRole="shop">
                <ShopDashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/dropshipper" 
            element={
              <PrivateRoute allowedRole="dropshipper">
                <DropshipperDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/match/:matchId" 
            element={
              <PrivateRoute>
                <MatchDetail />
              </PrivateRoute>
            } 
          />
          
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile/:profileType/:profileId"
            element={
              <PrivateRoute>
                <ProfileDetail />
              </PrivateRoute>
            }
          />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
