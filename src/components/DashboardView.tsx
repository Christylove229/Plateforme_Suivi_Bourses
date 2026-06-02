import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Sparkles, 
  CalendarDays, 
  Clock, 
  ExternalLink, 
  FolderCheck, 
  FileWarning, 
  Send,
  AlertTriangle,
  GraduationCap,
  Bell,
  MailCheck,
  Loader2
} from 'lucide-react';
import { ScholarshipStatus } from '../types';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const DashboardView: React.FC = () => {
  const { currentUser, profiles, scholarships, recommendations, emails, getCloseDeadlinesCount, sendScholarshipReminderEmail } = useApp();

  // State: Email reminder simulation feedback
  const [reminderSuccessId, setReminderSuccessId] = React.useState<string | null>(null);

  const handleTriggerReminder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await sendScholarshipReminderEmail(id);
    if (res.success) {
      setReminderSuccessId(id);
      setTimeout(() => {
        setReminderSuccessId(null);
      }, 3500);
    }
  };

  // Filter scholarships of the current user
  const userScholarships = scholarships.filter(s => s.user_id === currentUser?.id);
  const unreadRecommendations = recommendations.filter(r => r.receiver_id === currentUser?.id && !r.is_read);

  // Stats calculation
  const totalCount = userScholarships.length;
  const enCoursCount = userScholarships.filter(s => s.statut === 'EN_COURS').length;
  const soumisCount = userScholarships.filter(s => s.statut === 'SOUMIS').length;
  const accepteCount = userScholarships.filter(s => s.statut === 'ACCEPTE').length;

  // Calcul des deadlines proches (inférieures à 30 jours)
  const today = new Date(); // Anchor date
  const urgentScholarships = userScholarships.filter(s => {
    if (s.statut === 'ACCEPTE' || s.statut === 'REFUSE') return false;
    const dateFin = new Date(s.date_fin);
    const diffTime = dateFin.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  const getDaysLeftString = (dateFinStr: string): { text: string; isExpiringSoon: boolean; days: number } => {
    const fin = new Date(dateFinStr);
    const diffTime = fin.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { text: "Date passée", isExpiringSoon: false, days: diffDays };
    }
    if (diffDays === 0) {
      return { text: "Aujourd'hui !", isExpiringSoon: true, days: 0 };
    }
    if (diffDays === 1) {
      return { text: "Demain !", isExpiringSoon: true, days: 1 };
    }
    return { text: `${diffDays} jours restants`, isExpiringSoon: diffDays <= 15, days: diffDays };
  };

  const getStatusLabel = (statut: ScholarshipStatus) => {
    switch (statut) {
      case 'A_POSTULER': return { label: 'À postuler', color: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'EN_COURS': return { label: 'En cours', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'SOUMIS': return { label: 'Soumis', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
      case 'ACCEPTE': return { label: 'Accepté 🎉', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'REFUSE': return { label: 'Refusé', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      default: return { label: 'Inconnu', color: 'bg-slate-500 text-slate-200 border-slate-500' };
    }
  };

  if (currentUser?.role === 'ADMIN') {
    // Admin Welcome Dashboard view
    const registeredUsers = profiles.filter(p => p.role !== 'ADMIN').length;
    const sentInvitations = emails.filter(email => email.type === 'INVITATION').length;
    return (
      <div className="space-y-6">
        <div className="p-6 bg-gradient-to-r from-slate-950 to-amber-950/20 rounded-2xl border border-slate-850">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest font-semibold">Direction Générale</span>
          </div>
          <h1 className="text-2xl font-sans font-semibold text-white tracking-tight">
            Bonjour, {currentUser.prenom} {currentUser.nom}
          </h1>
          <p className="mt-1.5 text-xs text-slate-400 font-sans leading-relaxed max-w-2xl">
            Bienvenue sur votre console d'administration académique. Vous pouvez inscrire des comptes d'utilisatrices, générer des invitations automatiques et garder un øeil attentif sur l'activité des profils sans jamais enfreindre leur secret personnel de bourses.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
        >
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
            }}
            className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Utilisatrices Enregistrées</p>
              <p className="text-2xl font-sans font-bold text-white mt-1.5">
                {registeredUsers} Compte{registeredUsers > 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Building2 className="h-5.5 w-5.5" />
            </div>
          </motion.div>

          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
            }}
            className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Invitations Envoyées</p>
              <p className="text-2xl font-sans font-bold text-white mt-1.5">
                {sentInvitations} Email{sentInvitations > 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
              <CalendarDays className="h-5.5 w-5.5" />
            </div>
          </motion.div>

          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
            }}
            className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-1"
          >
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Confidentialité RLS</p>
              <div className="mt-2.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono rounded-lg inline-block">
                POLITIQUES STRICTES ACTIVES
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <FolderCheck className="h-5.5 w-5.5" />
            </div>
          </motion.div>
        </motion.div>

        {/* Informational Guidelines Card */}
        <div className="p-6 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
          <h3 className="text-sm font-sans font-semibold text-white uppercase tracking-wider">Règles de déontologie administrative</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-400 leading-relaxed">
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850/60">
              <span className="font-semibold text-white block mb-1">🔒 Protection de la Vie Privée</span>
              Vos utilisatrices sont souveraines dans la poursuite de leurs bourses académiques. L'administration ne dispose d'aucun accès en lecture aux données de bourses qu'elles ajoutent dans leur espace.
            </div>
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850/60">
              <span className="font-semibold text-white block mb-1">🤝 Recommandations Peer-to-Peer</span>
              La plateforme s'appuie sur la solidarité des candidates. Elles peuvent se propager des recommandations d'un clic de manière anonymisée, affichant uniquement le lien officiel et l'intitulé de la bourse.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="p-6 bg-gradient-to-r from-slate-950 options:to-amber-950/20 rounded-2xl border border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-amber-500 mb-2">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest font-semibold">{currentUser?.domaine_etudes}</span>
          </div>
          <h1 className="text-2xl font-sans font-semibold text-white tracking-tight">
            Bonjour, {currentUser?.prenom} !
          </h1>
          <p className="mt-1.5 text-xs text-slate-400 font-sans leading-relaxed">
            Suivez de près vos opportunités de bourses et soutenez vos collègues universitaires en leur transmettant les meilleurs programmes académiques découverts.
          </p>
        </div>
        
        {/* Quick deadline reminder circle if any */}
        {urgentScholarships.length > 0 && (
          <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-amber-400 font-semibold tracking-wider">Dates Approches</p>
              <p className="text-white font-sans text-xs font-medium mt-0.5">
                {urgentScholarships.length} bourse(s) à soumettre bientôt !
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bento Stats Panel */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        {/* Total stats */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
          }}
          className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between"
        >
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total bourses</p>
          <div className="flex justify-between items-baseline mt-2.5">
            <span className="text-2xl font-sans font-bold text-white">{totalCount}</span>
            <span className="text-[10px] font-sans px-2 py-0.5 bg-slate-900 text-slate-400 rounded-md border border-slate-800">Ciblées</span>
          </div>
        </motion.div>

        {/* En Cours stats */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
          }}
          className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between"
        >
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">En cours d'écriture</p>
          <div className="flex justify-between items-baseline mt-2.5">
            <span className="text-2xl font-sans font-bold text-indigo-400">{enCoursCount}</span>
            <span className="text-[10px] font-sans px-2 py-0.5 bg-indigo-500/5 text-indigo-400 rounded-md border border-indigo-500/10">Active</span>
          </div>
        </motion.div>

        {/* Soumis stats */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
          }}
          className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between"
        >
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Dossiers Soumis</p>
          <div className="flex justify-between items-baseline mt-2.5">
            <span className="text-2xl font-sans font-bold text-amber-500">{soumisCount}</span>
            <span className="text-[10px] font-sans px-2 py-0.5 bg-amber-500/5 text-amber-500 rounded-md border border-amber-500/10">Attestation</span>
          </div>
        </motion.div>

        {/* Accepte stats */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
          }}
          className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between"
        >
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Bourses Acceptées</p>
          <div className="flex justify-between items-baseline mt-2.5">
            <span className="text-2xl font-sans font-bold text-emerald-400">{accepteCount}</span>
            <span className="text-[10px] font-sans px-2 py-0.5 bg-emerald-500/5 text-emerald-400 rounded-md border border-emerald-500/10">Victoires</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ALERTS MODULE (Deadlines < 30 days) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="font-sans font-medium text-white text-sm">Alertes de Clôture Proche</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-500 font-bold px-2 py-0.5 bg-amber-500/10 rounded-lg">
                {urgentScholarships.length} Alerte(s)
              </span>
            </div>

            {urgentScholarships.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="h-10 w-10 bg-slate-900/80 border border-slate-850/60 rounded-xl flex items-center justify-center text-slate-500 mx-auto">
                  <FolderCheck className="h-5 w-5" />
                </div>
                <p className="text-xs text-slate-400 font-sans">Aucune deadline sous 30 j.</p>
                <p className="text-[10px] text-slate-500 font-mono">Restez attentive !</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1 mt-3">
                {urgentScholarships.map(s => {
                  const deadlineData = getDaysLeftString(s.date_fin);
                  const isSent = reminderSuccessId === s.id;
                  return (
                    <div key={s.id} className="p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-850/60 rounded-xl relative overflow-hidden group transition-all">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500" />
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-sans font-semibold text-xs text-slate-100 group-hover:text-amber-500 transition-colors truncate">{s.nom}</h4>
                          <p className="text-[10px] text-slate-400 mt-1 font-sans truncate">
                            {s.organisation}
                          </p>
                          {isSent && (
                            <p className="text-[9px] text-emerald-400 font-mono mt-1 select-none animate-pulse">
                              Rappel envoyé !
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-1.5 pl-1">
                          <button
                            onClick={(e) => handleTriggerReminder(s.id, e)}
                            title="M'envoyer un rappel de révision par email (API Resend)"
                            className={`p-1 rounded border transition-all ${
                              isSent 
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' 
                                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-500 border-slate-850'
                            }`}
                          >
                            {isSent ? <MailCheck className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                          </button>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-semibold font-bold">
                            {deadlineData.days} jrs
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-slate-900 text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              Clôtures calculées à 30 jours restants.
            </p>
          </div>
        </div>

        {/* PROGRESSION STATUS RING CHART (donut chart) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="font-sans font-medium text-white text-sm">Statut des Dossiers</h3>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold px-2 py-0.5 bg-indigo-500/10 rounded-lg">
                {totalCount} total
              </span>
            </div>

            {(() => {
              const statusCounts = [
                { name: 'À postuler', value: userScholarships.filter(s => s.statut === 'A_POSTULER').length, color: '#475569' },
                { name: 'En cours', value: enCoursCount, color: '#6366f1' },
                { name: 'Soumis', value: soumisCount, color: '#f59e0b' },
                { name: 'Accepté', value: accepteCount, color: '#10b981' },
              ];
              const hasData = statusCounts.some(item => item.value > 0);
              const chartData = hasData 
                ? statusCounts.filter(item => item.value > 0)
                : [{ name: 'Aucune bourse', value: 1, color: '#1e293b' }];

              return (
                <div className="relative flex flex-col items-center justify-center flex-1 mt-2">
                  <div className="w-full relative h-[140px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={52}
                          paddingAngle={hasData ? 3 : 0}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#020617" strokeWidth={2} />
                          ))}
                        </Pie>
                        {hasData && (
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              borderColor: '#334155', 
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)'
                            }}
                            itemStyle={{ color: '#f8fafc' }}
                          />
                        )}
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-lg font-mono font-bold text-white leading-none">{totalCount}</span>
                      <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500 mt-1">projets</span>
                    </div>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-1.5 mt-2.5">
                    {statusCounts.map((item, index) => {
                      const percentage = totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0;
                      return (
                        <div key={index} className="flex items-center justify-between p-1 bg-slate-900/30 border border-slate-900/60 rounded-lg px-2 text-[9px] font-mono">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-400 truncate">{item.name}</span>
                          </div>
                          <span className="text-slate-200 shrink-0 select-none">
                            {item.value} <span className="text-[8px] text-slate-500">({percentage}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="pt-3 border-t border-slate-900 text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              Progression de vos candidatures.
            </p>
          </div>
        </div>

        {/* UNREAD RECOMMENDATIONS received from mates */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <Send className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="font-sans font-medium text-white text-sm">Recommandations non lues</h3>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold px-2 py-0.5 bg-indigo-500/10 rounded-lg">
                {unreadRecommendations.length} Reçue(s)
              </span>
            </div>

            {unreadRecommendations.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="h-10 w-10 bg-slate-900/80 border border-slate-850/60 rounded-xl flex items-center justify-center text-slate-500 mx-auto">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-xs text-slate-400 font-sans">Aucune recommandation.</p>
                <p className="text-[10px] text-slate-500 font-mono">Échangez avec vos amies !</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {unreadRecommendations.map(r => (
                  <div key={r.id} className="p-3 bg-indigo-950/20 border border-indigo-500/15 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-indigo-400 font-mono font-medium truncate">De : {r.sender_nom_complet}</p>
                      <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-1 rounded shrink-0">NEW</span>
                    </div>
                    <div>
                      <h4 className="font-sans font-semibold text-xs text-slate-200 truncate">{r.scholarship_nom}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-2">“ {r.message || "Aucun message..."} ”</p>
                    </div>
                    <div className="pt-1 select-none flex items-center justify-between">
                      <a 
                        href={r.scholarship_lien} 
                        target="_blank" 
                        rel="noreferrer referrer" 
                        className="text-[10px] text-amber-500 hover:text-amber-400 font-semibold inline-flex items-center gap-1"
                      >
                        <span>Visiter le site</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-900 text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              🔒 Les notes privées restent invisibles des autres candidates.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
