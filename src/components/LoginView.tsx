import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Landmark, KeyRound, User, ShieldAlert, Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, loading, resetPassword } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Veuillez renseigner tous les champs.");
      return;
    }

    const err = await login(email, password);
    if (err) {
      setError(err);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);

    if (!resetEmail) {
      setResetError("Veuillez renseigner votre adresse email.");
      return;
    }

    const err = await resetPassword(resetEmail);
    if (err) {
      setResetError(err);
    } else {
      setResetSuccess(true);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetEmail('');
    setResetSuccess(false);
    setResetError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-900">
      <div className="w-full max-w-4xl bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden grid md:grid-cols-12">
        
        {/* Left Side: Aesthetic brand with Academics & Gold Accent */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="font-sans font-bold tracking-tight text-white text-md">ScholarTrack</p>
              <p className="text-[10px] uppercase font-mono tracking-widest text-amber-500/80">PREMIUM ACADEMICS</p>
            </div>
          </div>

          <div className="my-12">
            <h1 className="text-2xl font-sans font-semibold tracking-tight text-white leading-tight">
              Portail de bourses internationales
            </h1>
            <p className="mt-3 text-sm text-slate-400 font-sans leading-relaxed">
              Espace privé d'accompagnement et d'excellence pour le suivi et la recommandation de programmes d'études universitaires.
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <span>●</span>
            <span>Système sécurisé et confidentiel (Supabase Auth)</span>
          </div>
        </div>

        {/* Right Side: Log-in controls */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center relative">

          {loading && (
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-r-2xl">
               <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
             </div>
          )}

          {!isForgotPassword ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-sans font-medium text-white tracking-tight">Connexion à votre espace</h2>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  Veuillez saisir vos identifiants sécurisés.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs">
                  <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Erreur : </span>
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Adresse Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="nom@universite.org"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl text-sm cursor-pointer shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <span>Authentification</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-amber-500 transition-colors mb-4"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Retour à la connexion</span>
                </button>
                <h2 className="text-xl font-sans font-medium text-white tracking-tight">Réinitialiser le mot de passe</h2>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  Entrez votre adresse email pour recevoir un lien de réinitialisation.
                </p>
              </div>

              {resetSuccess && (
                <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-emerald-400 text-xs">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Succès : </span>
                    Un email de réinitialisation a été envoyé à votre adresse email.
                  </div>
                </div>
              )}

              {resetError && (
                <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs">
                  <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Erreur : </span>
                    {resetError}
                  </div>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Adresse Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="nom@universite.org"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl text-sm cursor-pointer shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <span>Envoyer le lien de réinitialisation</span>
                </button>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
