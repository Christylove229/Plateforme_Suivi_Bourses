import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  Scholarship,
  Recommendation,
  SentInvitationEmailSimulated,
  ScholarshipStatus,
  ScholarshipPriority
} from '../types';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface AppContextProps {
  currentUser: UserProfile | null;
  profiles: UserProfile[];
  scholarships: Scholarship[];
  recommendations: Recommendation[];
  emails: SentInvitationEmailSimulated[];
  loading: boolean;
  login: (email: string, pass: string) => Promise<string | null>;
  logout: () => Promise<void>;
  changePassword: (newPass: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  adminCreateUser: (prenom: string, nom: string, email: string, domaine: string) => Promise<{ success: boolean; tempPass: string; error?: string }>;
  adminToggleUserActive: (userId: string, currentStatus: boolean) => Promise<void>;
  adminDeleteUser: (userId: string) => Promise<string | null>;
  deleteUser: () => Promise<string | null>;
  updateProfileDomain: (newDomain: string) => Promise<string | null>;
  addScholarship: (scholarship: Omit<Scholarship, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateScholarship: (scholarship: Scholarship) => Promise<void>;
  deleteScholarship: (id: string) => Promise<void>;
  sendRecommendation: (scholarshipNom: string, scholarshipLien: string, receiverId: string, message?: string) => Promise<void>;
  markRecommendationRead: (id: string) => Promise<void>;
  sendScholarshipReminderEmail: (scholarshipId: string) => Promise<{ success: boolean; error?: string }>;
  getCloseDeadlinesCount: () => number;
  unreceivedRecommendationsCount: () => number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [emails, setEmails] = useState<SentInvitationEmailSimulated[]>([]); // Keep only for local admin log visualization
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('scholar_theme') as 'dark' | 'light') || 'dark';
  });

  // Inactivity timeout (30 minutes)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('scholar_theme', next);
      return next;
    });
  };

  // Update last activity on user interaction
  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  // Check for inactivity and logout if needed
  const checkInactivity = () => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivity;

    if (timeSinceActivity > INACTIVITY_TIMEOUT && currentUser) {
      supabase.auth.signOut();
    }
  };

  useEffect(() => {
    // Add event listeners for user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Check inactivity every minute
    inactivityTimerRef.current = setInterval(checkInactivity, 60000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [lastActivity, currentUser]);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Verify session is still valid by getting user
        supabase.auth.getUser(session.access_token).then(({ data, error }) => {
          if (error || !data.user) {
            // Session invalid, sign out
            supabase.auth.signOut();
            setLoading(false);
          } else {
            fetchUserProfile(session.user.id);
          }
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setScholarships([]);
        setRecommendations([]);
        setProfiles([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      setCurrentUser(null);
    } else {
      setCurrentUser(data as UserProfile);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    if (!currentUser) return;
    
    // Fetch profiles (RLS handles visibility: ADMIN sees all, USER sees active users in same domain)
    const { data: profilesData } = await supabase.from('profiles').select('*');
    if (profilesData) setProfiles(profilesData as UserProfile[]);

    // Fetch scholarships (RLS ensures user only sees their own)
    if (currentUser.role === 'USER') {
      const { data: scholarshipsData } = await supabase.from('scholarships').select('*').order('created_at', { ascending: false });
      if (scholarshipsData) setScholarships(scholarshipsData as Scholarship[]);

      // Fetch recommendations
      const { data: recData } = await supabase.from('recommendations').select('*').order('created_at', { ascending: false });
      if (recData) setRecommendations(recData as Recommendation[]);
    }
  };

  // Auth: Connection
  const login = async (email: string, pass: string): Promise<string | null> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      setLoading(false);
      return "Identifiants invalides ou compte suspendu.";
    }
    
    // The onAuthStateChange will trigger fetchUserProfile and set loading false
    return null;
  };

  // Auth: Deconnection
  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  // Auth: Change Password
  const changePassword = async (newPass: string): Promise<string | null> => {
    if (!currentUser) return "Utilisateur non connecté.";
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) {
      setLoading(false);
      return error.message;
    }

    // Update profile is_first_login
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_first_login: false })
      .eq('id', currentUser.id);

    if (profileError) {
      console.error("Erreur màj profile", profileError);
    }

    await fetchUserProfile(currentUser.id); // Refresh user
    setLoading(false);

    // Redirect to remove /change-password from URL
    window.history.replaceState({}, '', '/');

    return null;
  };

  // Auth: Reset Password (Forgot Password)
  const resetPassword = async (email: string): Promise<string | null> => {
    setLoading(true);

    // Check if email exists in profiles table first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profileError || !profile) {
      setLoading(false);
      // For security, we don't reveal if email exists or not
      // But we return a generic error to avoid email enumeration
      return "Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.";
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/change-password`,
    });

    setLoading(false);

    if (error) {
      return error.message;
    }

    return null;
  };

  // User: Update Domain
  const updateProfileDomain = async (newDomain: string): Promise<string | null> => {
    if (!currentUser) return "Non connecté";
    const { error } = await supabase.from('profiles').update({ domaine_etudes: newDomain }).eq('id', currentUser.id);
    if (error) return error.message;
    await fetchUserProfile(currentUser.id);
    return null;
  }

  // Admin: Create User Account (via Serverless Function)
  const adminCreateUser = async (prenom: string, nom: string, email: string, domaine: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const appUrl = window.location.origin;
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ prenom, nom, email, domaine, appUrl })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setLoading(false);
        return { success: false, tempPass: '', error: data.error || 'Erreur inconnue' };
      }

      // Add to local log for display
      const newEmailLog: SentInvitationEmailSimulated = {
        id: 'e-' + Math.random().toString(36).substring(2, 9),
        to: email,
        subject: `🎒 Votre accès à la Plateforme de Bourses : ${prenom} ${nom}`,
        prenom,
        nom,
        tempPass: data.tempPass,
        sentAt: new Date().toISOString(),
        type: 'INVITATION',
        appUrl
      };
      setEmails(prev => [newEmailLog, ...prev]);

      fetchData(); // Refresh profiles list
      setLoading(false);
      return { success: true, tempPass: data.tempPass };
    } catch (err: any) {
      setLoading(false);
      return { success: false, tempPass: '', error: 'Erreur réseau.' };
    }
  };

  // Admin: Toggle Active State
  const adminToggleUserActive = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUser?.id) return; // Cannot suspend self

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId);

    if (!error) {
      fetchData(); // refresh list
    }
  };

  // Admin: Delete User
  const adminDeleteUser = async (userId: string): Promise<string | null> => {
    if (userId === currentUser?.id) return "Vous ne pouvez pas supprimer votre propre compte.";
    if (!currentUser || currentUser.role !== 'ADMIN') return "Accès non autorisé.";

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return data.error || 'Erreur inconnue';
      }

      // Refresh data
      await fetchData();
      setLoading(false);
      return null;
    } catch (error: any) {
      setLoading(false);
      return error.message || "Erreur lors de la suppression de l'utilisateur.";
    }
  };

  // User: Delete Own Account
  const deleteUser = async (): Promise<string | null> => {
    if (!currentUser) return "Utilisateur non connecté.";

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/delete-own-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        }
      });
      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return data.error || 'Erreur inconnue';
      }

      // Logout after deletion
      await supabase.auth.signOut();
      setLoading(false);
      return null;
    } catch (error: any) {
      setLoading(false);
      return error.message || "Erreur lors de la suppression de votre compte.";
    }
  };

  // User: Add Scholarship
  const addScholarship = async (scholarshipInput: Omit<Scholarship, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!currentUser) return;
    const { data, error } = await supabase.from('scholarships').insert([
      { ...scholarshipInput, user_id: currentUser.id }
    ]).select();

    if (data && !error) {
      setScholarships(prev => [data[0] as Scholarship, ...prev]);
    }
  };

  // User: Edit Scholarship
  const updateScholarship = async (updated: Scholarship) => {
    const { error } = await supabase
      .from('scholarships')
      .update({
        nom: updated.nom,
        pays: updated.pays,
        organisation: updated.organisation,
        lien_officiel: updated.lien_officiel,
        date_debut: updated.date_debut,
        date_fin: updated.date_fin,
        criteres_eligibilite: updated.criteres_eligibilite,
        pieces_demandees: updated.pieces_demandees,
        priorite: updated.priorite,
        domaine: updated.domaine,
        statut: updated.statut,
        notes: updated.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', updated.id);

    if (!error) {
      setScholarships(prev => prev.map(s => s.id === updated.id ? { ...updated, updated_at: new Date().toISOString() } : s));
    }
  };

  // User: Delete Scholarship
  const deleteScholarship = async (id: string) => {
    const { error } = await supabase.from('scholarships').delete().eq('id', id);
    if (!error) {
      setScholarships(prev => prev.filter(s => s.id !== id));
    }
  };

  // User: Recommend a scholarship
  const sendRecommendation = async (scholarshipNom: string, scholarshipLien: string, receiverId: string, message?: string) => {
    if (!currentUser) return;

    const { data, error } = await supabase.from('recommendations').insert([{
      sender_id: currentUser.id,
      receiver_id: receiverId,
      scholarship_nom: scholarshipNom,
      scholarship_lien: scholarshipLien,
      message,
    }]).select();

    if (data && !error) {
      setRecommendations(prev => [data[0] as Recommendation, ...prev]);
    }
  };

  // User: Mark Recommendation as Read
  const markRecommendationRead = async (id: string) => {
    const { error } = await supabase.from('recommendations').update({ is_read: true }).eq('id', id);
    if (!error) {
      setRecommendations(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
    }
  };

  // User: Send reminder email for a scholarship (via Serverless Function)
  const sendScholarshipReminderEmail = async (scholarshipId: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "Non connecté." };

    const scholarship = scholarships.find(s => s.id === scholarshipId);
    if (!scholarship) return { success: false, error: "Bourse introuvable." };

    const messageBody = `Bonjour ${currentUser.prenom},\n\n` +
      `Ceci est un rappel de suivi pour votre dossier de bourse d'études en cours : "${scholarship.nom}" proposé par l'organisation : "${scholarship.organisation}".\n\n` +
      `Détails Clés du Dossier :\n` +
      `• Destination : ${scholarship.pays}\n` +
      `• Priorité de Traitement : ${scholarship.priorite}\n` +
      `• Clôture d'Admission : ${new Date(scholarship.date_fin).toLocaleDateString('fr-FR')}\n\n` +
      `Vos Notes Personnelles Secrètes :\n` +
      `“ ${scholarship.notes || 'Aucun détail ou consigne supplémentaire.'} ”\n\n` +
      `Assurez-vous de préparer l'ensemble des pièces requises :\n` +
      `${scholarship.pieces_demandees && scholarship.pieces_demandees.length > 0 ? scholarship.pieces_demandees.map(p => ` - [ ] ${p}`).join('\n') : "Aucune pièce spécifique référencée."}\n\n` +
      `Révisez attentivement votre dossier d'excellence avant l'échéance.\nCordialement,\nL'Administration ScholarTrack.`;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ 
          to: currentUser.email,
          prenom: currentUser.prenom,
          subject: `🚨 Rappel de Suivi : Bourse "${scholarship.nom}"`,
          messageBody
        })
      });

      if (!res.ok) throw new Error();

      // Log visuel (optionnel)
      const reminderEmailLog: SentInvitationEmailSimulated = {
        id: 'e-' + Math.random().toString(36).substring(2, 9),
        to: currentUser.email,
        subject: `🚨 Rappel de Suivi : Bourse "${scholarship.nom}"`,
        prenom: currentUser.prenom,
        nom: currentUser.nom,
        sentAt: new Date().toISOString(),
        type: 'RAPPEL',
        scholarshipNom: scholarship.nom,
        messageBody
      };
      setEmails(prev => [reminderEmailLog, ...prev]);

      return { success: true };
    } catch (e) {
      return { success: false, error: "Erreur envoi email." };
    }
  };

  const getCloseDeadlinesCount = (): number => {
    if (!currentUser || currentUser.role === 'ADMIN') return 0;
    const today = new Date(); // Use actual current date
    return scholarships.filter(s => {
      if (s.statut === 'ACCEPTE' || s.statut === 'REFUSE') return false;
      const finDate = new Date(s.date_fin);
      const diffDays = Math.ceil((finDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }).length;
  };

  const unreceivedRecommendationsCount = (): number => {
    if (!currentUser) return 0;
    return recommendations.filter(r => r.receiver_id === currentUser.id && !r.is_read).length;
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      profiles,
      scholarships,
      recommendations,
      emails,
      loading,
      login,
      logout,
      changePassword,
      resetPassword,
      adminCreateUser,
      adminToggleUserActive,
      adminDeleteUser,
      deleteUser,
      updateProfileDomain,
      addScholarship,
      updateScholarship,
      deleteScholarship,
      sendRecommendation,
      markRecommendationRead,
      sendScholarshipReminderEmail,
      getCloseDeadlinesCount,
      unreceivedRecommendationsCount,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
