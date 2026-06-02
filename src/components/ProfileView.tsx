import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  BookMarked, 
  Calendar, 
  Fingerprint,
  Mail,
  ListRestart,
  Lock,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfileDomain, changePassword } = useApp();

  // Password modify fields state
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [errorWord, setErrorWord] = useState<string | null>(null);
  const [successWord, setSuccessWord] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // Field of study state
  const [studyField, setStudyField] = useState(currentUser?.domaine_etudes || '');
  const [fieldSuccess, setFieldSuccess] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);

  const handleUpdateStudyField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setDomainLoading(true);
    const err = await updateProfileDomain(studyField);
    setDomainLoading(false);

    if (!err) {
      setFieldSuccess(true);
      setTimeout(() => setFieldSuccess(false), 2000);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorWord(null);
    setSuccessWord(null);

    if (newPass.length < 5) {
      setErrorWord("Votre nouveau mot de passe doit comporter au moins 5 caractères.");
      return;
    }

    if (newPass !== confirmPass) {
      setErrorWord("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }

    if (!currentUser) return;

    setPassLoading(true);
    
    // Vérification de l'ancien mot de passe en tentant un re-login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: oldPass,
    });

    if (signInError) {
      setErrorWord("Le mot de passe actuel saisi est erroné.");
      setPassLoading(false);
      return;
    }

    // Update password
    const err = await changePassword(newPass);
    setPassLoading(false);

    if (err) {
      setErrorWord(err);
    } else {
      setSuccessWord("Félicitations ! Votre mot de passe de sécurité ScholarTrack a été mis à jour.");
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Header card */}
      <div className="p-6 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle decorative gold glow background */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/30 border border-amber-500/30 flex items-center justify-center font-sans font-bold text-amber-500 text-lg">
            {currentUser?.prenom[0]}{currentUser?.nom[0]}
          </div>
          <div>
            <h1 className="text-xl font-sans font-semibold text-white tracking-tight">
              {currentUser?.prenom} {currentUser?.nom}
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-1">
              {currentUser?.role === 'ADMIN' ? '🎓 Directeur des Études Général' : `Candidate en ${currentUser?.domaine_etudes}`}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex gap-2">
          <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono font-bold text-slate-300 truncate max-w-[120px]">
            ID: {currentUser?.id}
          </span>
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-mono font-bold">
            Role: {currentUser?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Profile Info & Field change */}
        <div className="lg:col-span-6 space-y-5">
          
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-sans font-semibold text-white uppercase tracking-wider border-b border-slate-905 pb-2.5">Mes coordonnées académiques</h3>
            
            <div className="space-y-4 text-xs font-sans">
              
              <div className="flex items-center justify-between py-2 border-b border-slate-900/50">
                <span className="text-slate-500 flex items-center gap-2">
                  <User className="h-4 w-4" /> Nom complet
                </span>
                <span className="font-semibold text-slate-200">{currentUser?.prenom} {currentUser?.nom}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-900/50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Adresse Email
                </span>
                <span className="font-semibold text-slate-300">{currentUser?.email}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-900/50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Inscrite le
                </span>
                <span className="font-semibold text-slate-400 font-mono">
                  {currentUser ? new Date(currentUser.created_at).toLocaleDateString('fr-FR') : "24/05/2026"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" /> Statut du compte
                </span>
                <span className="text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 rounded-lg">ACTIF</span>
              </div>

            </div>
          </div>

          {currentUser?.role === 'USER' && (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 relative">
              {domainLoading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                  <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                </div>
              )}
              <h3 className="text-sm font-sans font-semibold text-white uppercase tracking-wider border-b border-slate-905 pb-2.5">Domaine d'études préféré</h3>
              
              <form onSubmit={handleUpdateStudyField} className="space-y-3.5">
                <p className="text-xs text-slate-400">
                  Votre domaine sert à cibler les bourses de votre groupe d'amies et à identifier les collaborations d'appui de dossiers.
                </p>

                <div className="relative">
                  <BookMarked className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-slate-500 flex items-center bg-transparent" />
                  <input
                    type="text"
                    required
                    value={studyField}
                    onChange={(e) => setStudyField(e.target.value)}
                    className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-900 border border-slate-805 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Physique, Informatique, Droit..."
                  />
                </div>

                <div className="flex justify-between items-center bg-transparent">
                  {fieldSuccess && (
                    <span className="text-[11px] text-emerald-400 font-semibold">✓ Modifications enregistrées</span>
                  )}
                  <button
                    type="submit"
                    disabled={domainLoading}
                    className="px-4.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-500 text-xs font-semibold rounded-xl cursor-pointer transition-colors ml-auto disabled:opacity-50"
                  >
                    Mettre à jour mon académie
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Password Modification panel */}
        <div className="lg:col-span-6">
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 relative">
             {passLoading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                  <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                </div>
              )}
            <div className="border-b border-slate-905 pb-2.5 flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-amber-500" />
              <h3 className="text-sm font-sans font-semibold text-white uppercase tracking-wider">Sécurité & Chiffrement</h3>
            </div>

            {errorWord && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs">
                {errorWord}
              </div>
            )}

            {successWord && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs">
                {successWord}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  required
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Min 5 caractères"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ressaisir à l'identique"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl text-xs cursor-pointer shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ListRestart className="h-4 w-4" />
                  <span>Enregistrer le nouveau mot de passe</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
