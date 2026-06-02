/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { supabase } from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { ChangePasswordView } from './components/ChangePasswordView';
import { DashboardView } from './components/DashboardView';
import { ScholarshipsView } from './components/ScholarshipsView';
import { RecommendationsView } from './components/RecommendationsView';
import { ProfileView } from './components/ProfileView';
import { AdminView } from './components/AdminView';

function AppContent() {
  const { currentUser, theme } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [forcePasswordReset, setForcePasswordReset] = useState<boolean>(false);
  const [isValidResetToken, setIsValidResetToken] = useState<boolean>(false);

  // Check if user arrived via password reset link with valid token
  useEffect(() => {
    const checkResetToken = async () => {
      if (window.location.pathname === '/change-password') {
        // Check if URL hash contains access_token (Supabase reset token)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');

        if (accessToken) {
          // Verify the token with Supabase
          const { data, error } = await supabase.auth.getUser(accessToken);
          if (!error && data.user) {
            setIsValidResetToken(true);
            setForcePasswordReset(true);
          } else {
            // Invalid token, redirect to login
            window.location.replace('/');
          }
        } else {
          // No token in URL, redirect to login
          window.location.replace('/');
        }
      }
    };

    checkResetToken();
  }, []);

  // Router for active session based on Auth & First Login
  // Force password reset takes priority over everything
  if (forcePasswordReset && isValidResetToken) {
    return <div className={theme}><ChangePasswordView /></div>;
  }

  if (!currentUser) {
    return <div className={theme}><LoginView /></div>;
  }

  if (currentUser.is_first_login) {
    return <div className={theme}><ChangePasswordView /></div>;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'bourses':
        return <ScholarshipsView />;
      case 'recommandations':
        return <RecommendationsView />;
      case 'profil':
        return <ProfileView />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-905 flex selection:bg-amber-500 selection:text-slate-900 ${theme}`}>
      {/* Navigation Drawer/Menu */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Primary Display viewport */}
      <main className="flex-1 md:pl-64 min-h-screen bg-slate-900 text-slate-100 flex flex-col md:pt-0 pt-16">
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

