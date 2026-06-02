import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  ExternalLink, 
  CheckCircle, 
  MailWarning, 
  HeartHandshake, 
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const { currentUser, recommendations, markRecommendationRead, profiles } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'RECEIVED' | 'SENT'>('RECEIVED');

  // Filter recommendations
  const receivedRecs = recommendations.filter(r => r.receiver_id === currentUser?.id);
  const sentRecs = recommendations.filter(r => r.sender_id === currentUser?.id);

  const getReceiverName = (receiverId: string): string => {
    const r = profiles.find(p => p.id === receiverId);
    return r ? `${r.prenom} ${r.nom}` : "Utilisatrice ScholarTrack";
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-900 gap-1 select-none">
        <button
          onClick={() => setActiveSubTab('RECEIVED')}
          className={`px-5 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'RECEIVED' 
              ? 'border-amber-500 text-amber-500 font-bold bg-amber-500/5' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Recommandations Reçues ({receivedRecs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('SENT')}
          className={`px-5 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'SENT' 
              ? 'border-amber-500 text-amber-500 font-bold bg-amber-500/5' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Recommandations Envoyées ({sentRecs.length})
        </button>
      </div>

      {activeSubTab === 'RECEIVED' ? (
        
        // RECEIVED SUB-TAB
        receivedRecs.length === 0 ? (
          <div className="bg-slate-950 border border-slate-850 rounded-2xl py-16 text-center space-y-3">
            <div className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 mx-auto">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-sans font-medium text-slate-300">Aucune recommandation reçue</p>
              <p className="text-xs text-slate-500 font-sans mt-1">Vos collègues diplômées n'ont pas encore partagé d'avis sur cette rubrique pour l'instant.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receivedRecs.map(r => (
              <div 
                key={r.id} 
                className={`p-5 rounded-2xl border transition-all space-y-4 relative overflow-hidden flex flex-col justify-between ${
                  r.is_read 
                    ? 'bg-slate-950/60 border-slate-850' 
                    : 'bg-indigo-950/15 border-indigo-500/25 shadow-lg shadow-indigo-500/5'
                }`}
              >
                {/* Visual indicator of unread status */}
                {!r.is_read && (
                  <div className="absolute right-0 top-0 h-12 w-12 bg-indigo-500/10 [clip-path:polygon(100%_0,0_0,100%_100%)] flex items-start justify-end p-2 text-indigo-400">
                    <span className="text-[8px] font-mono font-bold tracking-wider rotate-45 translate-x-1.5 -translate-y-0.5">NEW</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 font-medium">Transmis par</span>
                      <p className="text-xs text-slate-300 font-semibold">{r.sender_nom_complet}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>

                  {/* Redacted, private design banner for RLS integrity */}
                  <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl relative">
                    <h3 className="font-sans font-semibold text-white text-sm pr-6">{r.scholarship_nom}</h3>
                    
                    <div className="mt-3.5 flex items-center justify-between py-1 px-1.5 bg-slate-900 rounded-lg text-[9px] text-amber-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3 inline shrink-0 text-amber-500" />
                        Confidentialité ScholarTrack active
                      </span>
                      <span>Notes & Pièces Masquées</span>
                    </div>
                  </div>

                  {/* Recommendation explanation note */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Message de soutien</span>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed italic bg-slate-900/20 p-3 rounded-lg border border-slate-900">
                      “ {r.message || "Votre amie n'a pas laissé d'instructions supplémentaires mais valide d'un clin d'œil cette opportunité !"} ”
                    </p>
                  </div>
                </div>

                {/* Received Actions */}
                <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-3">
                  <a 
                    href={r.scholarship_lien}
                    target="_blank"
                    rel="noreferrer referrer"
                    className="px-3.5 py-1.5 bg-slate-90 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-sans font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Visiter le site officiel</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </a>

                  {!r.is_read && (
                    <button
                      onClick={() => markRecommendationRead(r.id)}
                      className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-emerald-950 hover:text-white font-semibold text-[11px] rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Marquer comme lu</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )

      ) : (

        // SENT SUB-TAB
        sentRecs.length === 0 ? (
          <div className="bg-slate-950 border border-slate-850 rounded-2xl py-16 text-center space-y-3">
            <div className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 mx-auto">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-sans font-medium text-slate-300">Aucune recommandation transmise</p>
              <p className="text-xs text-slate-500 font-sans mt-1">Recommandez vos opportunités de bourses à vos amies directes depuis l'onglet "Mes Bourses".</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {sentRecs.map(r => (
              <div key={r.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1 bg-transparent">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-md">Transmis</span>
                    <h4 className="text-white font-sans text-xs font-semibold">{r.scholarship_nom}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed pt-0.5">
                    Destinataire : <span className="text-amber-500 font-semibold">{getReceiverName(r.receiver_id)}</span> • Le {new Date(r.created_at).toLocaleDateString('fr-FR')} à {new Date(r.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  {r.message && (
                    <p className="text-[10px] text-slate-500 leading-snug italic mt-1 line-clamp-1">
                      Message d'accompagnement : “ {r.message} ”
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 select-none">
                  <a 
                    href={r.scholarship_lien} 
                    target="_blank" 
                    rel="noreferrer referrer" 
                    className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer text-xs"
                    title="Visiter"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )

      )}

    </div>
  );
};
