import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';

export const ChangePasswordView: React.FC = () => {
  const { changePassword, currentUser } = useApp();
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPass.length < 5) {
      setError("Le nouveau mot de passe doit comporter au moins 5 caractères.");
      return;
    }

    if (newPass !== confirmPass) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const err = await changePassword(newPass);
    if (err) {
      setError(err);
      setLoading(false);
    }
    // If success, AppContext state updates and triggers unmount of this view automatically
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-8 relative">
        
        {loading && (
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
               <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
             </div>
        )}

        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 mb-4 animate-pulse">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-sans font-medium text-white tracking-tight">Modification de sécurité obligatoire</h2>
          <p className="text-xs text-slate-400 mt-2 font-sans max-w-sm">
            Bonjour <span className="text-amber-500 font-medium">{currentUser?.prenom} {currentUser?.nom}</span>. C'est votre première connexion à ScholarTrack. Veuillez définir votre mot de passe privé définitif.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
            <span className="font-semibold">Erreur: </span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Min 5 caractères"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Retapez à l'identique"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl text-sm cursor-pointer shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Mettre à jour & Accéder</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
          <p className="text-[10px] font-mono text-slate-500">
            Conforme aux normes de protection académique ScholarTrack.
          </p>
        </div>

      </div>
    </div>
  );
};
