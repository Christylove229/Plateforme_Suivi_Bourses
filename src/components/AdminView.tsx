import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserPlus, 
  Users, 
  Mail, 
  Copy, 
  Check, 
  Send,
  UserCheck2,
  LockKeyhole,
  Loader2
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { 
    profiles, 
    emails, 
    adminCreateUser, 
    adminToggleUserActive,
    loading 
  } = useApp();

  // New user form state
  const [formPrenom, setFormPrenom] = useState('');
  const [formNom, setFormNom] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDomaine, setFormDomaine] = useState('');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<{ tempPass: string; email: string } | null>(null);

  // Copied indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formPrenom || !formNom || !formEmail || !formDomaine) {
      setFormError("Veuillez renseigner l'ensemble des champs requis.");
      return;
    }

    const { success, tempPass, error } = await adminCreateUser(formPrenom, formNom, formEmail, formDomaine);
    if (!success && error) {
      setFormError(error);
      return;
    }

    setFormSuccess({ tempPass, email: formEmail.trim().toLowerCase() });
    setFormPrenom('');
    setFormNom('');
    setFormEmail('');
    setFormDomaine('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const usersOnly = profiles.filter(p => p.role !== 'ADMIN');

  return (
    <div className="space-y-6">
      
      {/* Informative RLS Security Lock Header */}
      <div className="p-4.5 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl shrink-0 mt-0.5">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-white font-sans font-semibold text-xs uppercase tracking-wider">Normes d'étanchéité et de souveraineté (Supabase RLS)</h3>
          <p className="text-slate-400 text-xs mt-1 font-sans leading-relaxed">
            Par mesure de déontologie universitaire et d'étanchéité de données, le compte d'administration dispose de privilèges exclusifs pour encadrer la création de profils et leur statut d'accès. Cependant, les règles PostgreSQL/RLS garantissent que <span className="text-indigo-400 font-semibold">l'administration n'a strictement aucun droit de lecture ni d'écriture</span> sur les bourses d'études et notes personnelles des candidates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* CREATE ACCOUNT PANEL */}
        <div className="lg:col-span-4 relative">
           {loading && (
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
               <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
             </div>
          )}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-905 pb-2.5">
              <UserPlus className="h-4.5 w-4.5 text-amber-500" />
              <h3 className="text-xs font-mono uppercase text-white tracking-wider font-semibold">Inscrire une candidate</h3>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-xs space-y-2 relative overflow-hidden">
                <p className="text-emerald-400 font-bold flex items-center gap-1">
                  <UserCheck2 className="h-4 w-4 shrink-0" />
                  Compte créé d'excellence !
                </p>
                <p className="text-slate-300 leading-normal">
                  L'utilisatrice a reçu l'invitation automatisée (via API Resend). Le mot de passe temporaire généré est :
                </p>
                
                <div className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="font-mono text-white text-xs font-bold selection:bg-amber-500 selection:text-slate-950">{formSuccess.tempPass}</span>
                  <button
                    onClick={() => handleCopy(formSuccess.tempPass, 'temp-pass')}
                    type="button"
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                  >
                    {copiedId === 'temp-pass' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Ce mot de passe devra être changé obligatoirement dès sa première mise en relation.
                </p>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Prénom de la candidate</label>
                <input
                  type="text"
                  required
                  value={formPrenom}
                  onChange={(e) => setFormPrenom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="ex: Marie"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Nom de famille</label>
                <input
                  type="text"
                  required
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="ex: Curie"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Adresse Email principale</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="marie@lps.org"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Domaine d'études principal</label>
                <input
                  type="text"
                  required
                  value={formDomaine}
                  onChange={(e) => setFormDomaine(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="ex: Sciences Physiques, Informatique"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl text-xs cursor-pointer shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Générer le compte & l'invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LIST OF CANDIDATES ACCOUNTS */}
        <div className="lg:col-span-8 space-y-5 bg-transparent">
          
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-905 pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="text-xs font-mono uppercase text-white tracking-wider font-semibold">Utilisatrices enregistrées ({usersOnly.length})</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-sans">
                <thead className="text-[10px] font-mono uppercase tracking-wider bg-slate-900/60 border-b border-slate-850 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Identité de l'étudiante</th>
                    <th className="px-4 py-3">Domaine ciblé</th>
                    <th className="px-4 py-3">Inscription</th>
                    <th className="px-4 py-3">Accès Initial</th>
                    <th className="px-4 py-3 text-right">Statut / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {usersOnly.map(user => (
                    <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-100">{user.prenom} {user.nom}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{user.email}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-medium">
                        {user.domaine_etudes}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500 text-[10px]">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3.5">
                        {user.is_first_login ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">First Connect</span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Pass Défini</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right select-none">
                        <button
                          onClick={() => adminToggleUserActive(user.id, user.is_active)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                            user.is_active 
                              ? 'bg-emerald-500/10 hover:bg-rose-500/10 border-emerald-500/20 hover:border-rose-500/20 text-emerald-400 hover:text-rose-400' 
                              : 'bg-rose-500/5 hover:bg-emerald-500/10 border-rose-500/15 hover:border-emerald-500/20 text-rose-500 hover:text-emerald-400'
                          }`}
                          title={user.is_active ? "Désactiver le compte" : "Réactiver le compte"}
                        >
                          {user.is_active ? "Actif • Suspendre" : "Suspendu • Débloquer"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIMULATED RESEND MAILBOX LOGS */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-905 pb-2.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="text-xs font-mono uppercase text-white tracking-wider font-semibold">Historique des envois email (API Resend)</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-500 font-bold px-1.5 py-0.5 bg-amber-500/10 rounded-lg">Logs locaux de la session</span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Ce panneau affiche les notifications d'invitation administrative et de rappels de bourses transmis réellement par l'API Resend durant cette session d'administration.
            </p>

            {emails.length === 0 ? (
              <div className="py-8 p-4 bg-slate-900/40 border border-slate-900 rounded-xl text-center space-y-1">
                <p className="text-xs text-slate-500">Aucun message n'a encore été déclenché dans cette session.</p>
                <p className="text-[10.5px] text-slate-600 font-mono">Enregistrez un compte ou demandez un rappel pour alimenter ces logs.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                {emails.map(email => (
                  <div key={email.id} className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                      <span className="font-mono text-[10px]">Date : {new Date(email.sentAt).toLocaleString('fr-FR')}</span>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[9px] rounded-lg">
                        {email.type === 'RAPPEL' ? 'RAPPEL BOUSERIE' : 'API RESEND INVITATION'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-sans">
                      <p className="text-slate-350"><span className="text-slate-500 inline-block w-16">Dest :</span> <span className="text-white font-mono">{email.to}</span></p>
                      <p className="text-slate-350"><span className="text-slate-500 inline-block w-16">Objet :</span> <span className="text-amber-500 font-semibold">{email.subject}</span></p>
                    </div>

                    {/* Email preview contents */}
                    <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-300 font-sans leading-relaxed space-y-2 whitespace-pre-wrap">
                      {email.type === 'RAPPEL' ? (
                        <div className="font-mono text-slate-400 text-[11px] leading-relaxed">
                          {email.messageBody}
                        </div>
                      ) : (
                        <>
                          <p>Bonjour <span className="text-white font-semibold">{email.prenom} {email.nom}</span>,</p>
                          <p>Votre compte d'accès à la plateforme de bourses internationales ScholarTrack a été provisionné par l'administration.</p>
                          {email.appUrl && (
                            <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 border border-slate-850 rounded-lg text-slate-200">
                              <a href={email.appUrl} target="_blank" rel="noreferrer" className="text-amber-500 hover:text-amber-400 font-mono text-[11px] truncate">
                                {email.appUrl}
                              </a>
                              <button
                                onClick={() => handleCopy(email.appUrl || '', `${email.id}-url`)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors shrink-0"
                              >
                                {copiedId === `${email.id}-url` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          )}
                          <p>Votre mot de passe temporaire de connexion est :</p>
                          
                          {email.tempPass && (
                            <div className="flex items-center justify-between p-2 bg-slate-900 border border-slate-850 rounded-lg text-slate-200 font-mono">
                              <span className="font-bold text-white tracking-widest text-sm">{email.tempPass}</span>
                              <button
                                onClick={() => handleCopy(email.tempPass || '', email.id)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"
                              >
                                {copiedId === email.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          )}

                          <p className="text-[10px] text-amber-500 mt-1.5 italic font-mono">
                            ⚠️ Pour des raisons de sécurité, changez ce mot de passe à votre première connexion.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
