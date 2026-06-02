import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Share2, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  CheckSquare, 
  Square, 
  AlertCircle,
  X,
  Send,
  Download,
  Bell,
  MailCheck,
  FileText
} from 'lucide-react';
import { Scholarship, ScholarshipPriority, ScholarshipStatus } from '../types';
import { motion } from 'framer-motion';

export const ScholarshipsView: React.FC = () => {
  const { 
    currentUser, 
    scholarships, 
    profiles, 
    addScholarship, 
    updateScholarship, 
    deleteScholarship, 
    sendRecommendation,
    sendScholarshipReminderEmail
  } = useApp();

  // Selected Scholar details or active states
  const myScholarships = scholarships.filter(s => s.user_id === currentUser?.id);

  // States: Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [notesSearchTerm, setNotesSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [displayType, setDisplayType] = useState<'CARDS' | 'TABLE'>('CARDS');

  // States: Email Reminder Simulation feedback
  const [reminderSuccessId, setReminderSuccessId] = useState<string | null>(null);

  const handleTriggerReminder = async (id: string) => {
    const res = await sendScholarshipReminderEmail(id);
    if (res.success) {
      setReminderSuccessId(id);
      setTimeout(() => {
        setReminderSuccessId(null);
      }, 4000);
    }
  };

  // States: Form Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);

  // Form Fields State
  const [formNom, setFormNom] = useState('');
  const [formPays, setFormPays] = useState('');
  const [formOrganisation, setFormOrganisation] = useState('');
  const [formLien, setFormLien] = useState('');
  const [formDebut, setFormDebut] = useState('');
  const [formFin, setFormFin] = useState('');
  const [formCriteres, setFormCriteres] = useState('');
  const [formPriority, setFormPriority] = useState<ScholarshipPriority>('HAUTE');
  const [formStatus, setFormStatus] = useState<ScholarshipStatus>('A_POSTULER');
  const [formNotes, setFormNotes] = useState('');
  const [formPieces, setFormPieces] = useState<string[]>([]);
  const [newPieceInput, setNewPieceInput] = useState('');

  // States: Recommendation Modal
  const [recomModalOpen, setRecomModalOpen] = useState(false);
  const [recomScholarshipName, setRecomScholarshipName] = useState('');
  const [recomScholarshipLien, setRecomScholarshipLien] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [recomMessage, setRecomMessage] = useState('');
  const [recomSuccessMsg, setRecomSuccessMsg] = useState<string | null>(null);

  const defaultDocOptions = [
    'CV d\'Excellence',
    'Lettre de motivation argumentée',
    'Bulletins de notes certifiés',
    'Lettre de recommandation d\'enseignant',
    'Projet de recherche académique',
    'Copie conforme de Passeport / CNI',
    'Certificat d\'inscription universitaire'
  ];

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingScholarship(null);
    setFormNom('');
    setFormPays('');
    setFormOrganisation('');
    setFormLien('');
    setFormDebut('2026-06-01');
    setFormFin('2026-06-30');
    setFormCriteres('');
    setFormPriority('MOYENNE');
    setFormStatus('A_POSTULER');
    setFormNotes('');
    setFormPieces(['CV d\'Excellence', 'Lettre de motivation argumentée']);
    setIsFormOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (scholar: Scholarship) => {
    setEditingScholarship(scholar);
    setFormNom(scholar.nom);
    setFormPays(scholar.pays);
    setFormOrganisation(scholar.organisation);
    setFormLien(scholar.lien_officiel);
    setFormDebut(scholar.date_debut);
    setFormFin(scholar.date_fin);
    setFormCriteres(scholar.criteres_eligibilite);
    setFormPriority(scholar.priorite);
    setFormStatus(scholar.statut);
    setFormNotes(scholar.notes || '');
    setFormPieces(scholar.pieces_demandees || []);
    setIsFormOpen(true);
  };

  // Close form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingScholarship(null);
  };

  // Form submit (save or create)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom || !formPays || !formOrganisation || !formLien) return;

    const dataInput = {
      nom: formNom,
      pays: formPays,
      organisation: formOrganisation,
      lien_officiel: formLien,
      date_debut: formDebut,
      date_fin: formFin,
      criteres_eligibilite: formCriteres,
      pieces_demandees: formPieces,
      priorite: formPriority,
      domaine: currentUser?.domaine_etudes || 'Général',
      statut: formStatus,
      notes: formNotes
    };

    if (editingScholarship) {
      await updateScholarship({
        ...editingScholarship,
        ...dataInput
      });
    } else {
      await addScholarship(dataInput);
    }

    handleCloseForm();
  };

  // Toggle checklist of documents in form
  const handleTogglePiece = (p: string) => {
    if (formPieces.includes(p)) {
      setFormPieces(formPieces.filter(item => item !== p));
    } else {
      setFormPieces([...formPieces, p]);
    }
  };

  const handleAddNewPiece = () => {
    const trimmed = newPieceInput.trim();
    if (trimmed && !formPieces.includes(trimmed)) {
      setFormPieces([...formPieces, trimmed]);
      setNewPieceInput('');
    }
  };

  // Recom Modal trigger
  const handleOpenRecommend = (scholar: Scholarship) => {
    setRecomScholarshipName(scholar.nom);
    setRecomScholarshipLien(scholar.lien_officiel);
    
    // Find people with the same study domain
    const friends = profiles.filter(p => p.id !== currentUser?.id && p.role !== 'ADMIN' && p.is_active);
    const sameDomainMates = friends.filter(p => p.domaine_etudes === currentUser?.domaine_etudes);
    
    // Default selected to first friend
    const defaultSelection = sameDomainMates.length > 0 ? sameDomainMates[0].id : (friends.length > 0 ? friends[0].id : '');
    setSelectedReceiverId(defaultSelection);

    setRecomMessage(`Bonjour ! Je te recommande vivement cette bourse d'excellence internationale qui cadre parfaitement avec ton projet de recherche en ${currentUser?.domaine_etudes}.`);
    setRecomSuccessMsg(null);
    setRecomModalOpen(true);
  };

  const handlesendRecommendationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceiverId || !recomScholarshipName) return;

    await sendRecommendation(recomScholarshipName, recomScholarshipLien, selectedReceiverId, recomMessage);
    
    const receiver = profiles.find(p => p.id === selectedReceiverId);
    setRecomSuccessMsg(`Succès ! Votre recommandation confidentielle de la bourse "${recomScholarshipName}" a été notifiée instantanément à ${receiver?.prenom} ${receiver?.nom}.`);
    
    setTimeout(() => {
      setRecomModalOpen(false);
      setRecomSuccessMsg(null);
    }, 3000);
  };

  const handleExportCSV = () => {
    if (filteredScholarships.length === 0) return;

    const headers = [
      "ID",
      "Nom de la bourse",
      "Pays",
      "Organisation",
      "Lien officiel",
      "Date de début",
      "Date de fin",
      "Critères d'éligibilité",
      "Pièces demandées",
      "Priorité",
      "Statut",
      "Notes privées"
    ];

    const escapeCSV = (val: any) => {
      if (val === undefined || val === null) return '""';
      let stringified = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Clean newlines to prevent row shifts in Excel
      stringified = stringified.replace(/\r?\n/g, ' ');
      return `"${stringified.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      "sep=;", // Excel standard helper to force semi-colon separation recognition
      headers.join(';'),
      ...filteredScholarships.map(s => [
        escapeCSV(s.id),
        escapeCSV(s.nom),
        escapeCSV(s.pays),
        escapeCSV(s.organisation),
        escapeCSV(s.lien_officiel),
        escapeCSV(s.date_debut),
        escapeCSV(s.date_fin),
        escapeCSV(s.criteres_eligibilite),
        escapeCSV(s.pieces_demandees?.join(', ')),
        escapeCSV(s.priorite),
        escapeCSV(s.statut),
        escapeCSV(s.notes)
      ].join(';'))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bourses_suivi_${currentUser?.prenom || 'scholar'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Scholarships
  const filteredScholarships = myScholarships.filter(s => {
    const matchesSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.pays.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.organisation.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Specific search filter on personal user notes
    const matchesNotesSearch = !notesSearchTerm || 
                               (s.notes && s.notes.toLowerCase().includes(notesSearchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || s.statut === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || s.priorite === priorityFilter;

    return matchesSearch && matchesNotesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (p: ScholarshipPriority) => {
    switch (p) {
      case 'HAUTE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'MOYENNE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'FAIBLE': return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusLabel = (s: ScholarshipStatus) => {
    switch (s) {
      case 'A_POSTULER': return 'À postuler';
      case 'EN_COURS': return 'En cours';
      case 'SOUMIS': return 'Soumis';
      case 'ACCEPTE': return 'Accepté 🎉';
      case 'REFUSE': return 'Refusé';
    }
  };

  const getStatusColor = (s: ScholarshipStatus) => {
    switch (s) {
      case 'A_POSTULER': return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'EN_COURS': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25';
      case 'SOUMIS': return 'bg-amber-500/15 text-amber-500 border-amber-500/25';
      case 'ACCEPTE': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      case 'REFUSE': return 'bg-rose-500/15 text-rose-400 border-rose-500/25';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Hub */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4.5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-slate-500 flex items-center bg-transparent" />
            <input
              type="text"
              placeholder="Rechercher une bourse par nom, organisation, pays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Search by personal notes */}
          <div className="relative">
            <FileText className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-amber-500 flex items-center bg-transparent" />
            <input
              type="text"
              placeholder="Filtrer spécifiquement par contenu des notes personnelles..."
              value={notesSearchTerm}
              onChange={(e) => setNotesSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9.5 pr-14 py-2 text-xs text-slate-100 placeholder-slate-500/70 focus:outline-none focus:border-amber-500 transition-colors border-amber-500/10"
            />
            {notesSearchTerm && (
              <button 
                onClick={() => setNotesSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 hover:text-white font-mono bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>

        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-3 border-t border-slate-900/40">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Display switch */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex">
              <button 
                onClick={() => setDisplayType('CARDS')}
                className={`px-3 py-1 text-[10px] font-mono rounded ${displayType === 'CARDS' ? 'bg-amber-500/10 text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Cartes
              </button>
              <button 
                onClick={() => setDisplayType('TABLE')}
                className={`px-3 py-1 text-[10px] font-mono rounded ${displayType === 'TABLE' ? 'bg-amber-500/10 text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Tableau
              </button>
            </div>

            {/* Status filtering dropdown */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs px-3.5 py-1.5 rounded-lg text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="A_POSTULER">À postuler</option>
              <option value="EN_COURS">En cours</option>
              <option value="SOUMIS">Soumis</option>
              <option value="ACCEPTE">Accepté</option>
              <option value="REFUSE">Refusé</option>
            </select>

            {/* Priority filtering dropdown */}
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs px-3.5 py-1.5 rounded-lg text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Toutes priorités</option>
              <option value="HAUTE">Priorité Haute</option>
              <option value="MOYENNE">Priorité Moyenne</option>
              <option value="FAIBLE">Priorité Faible</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              disabled={filteredScholarships.length === 0}
              className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-350 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Exporter les bourses filtrées au format CSV"
            >
              <Download className="h-4 w-4" />
              <span>Exporter CSV</span>
            </button>

            {/* Add button trigger */}
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Bourse</span>
            </button>

          </div>

        </div>
      </div>

      {/* Main content display */}
      {filteredScholarships.length === 0 ? (
        <div className="bg-slate-950 border border-slate-850 rounded-2xl py-16 text-center space-y-3.5">
          <div className="h-12 w-12 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 mx-auto">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-sans font-medium text-slate-300">Aucune bourse d'études répertoriée</p>
            <p className="text-xs text-slate-500 font-sans mt-1">Créez votre première fiche de bourse d'un clic pour en planifier les documents et la priorité.</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-500 hover:text-amber-400 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Enregistrer une opportunité</span>
          </button>
        </div>
      ) : displayType === 'CARDS' ? (
        
        // DISPLAY: CARDS
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
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
          {filteredScholarships.map(s => (
            <motion.div 
              key={s.id} 
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
              }}
              className="bg-slate-950 border border-slate-850/80 rounded-2xl p-5 hover:border-slate-800 transition-all space-y-4.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1">
                    <span className={`text-[9px] font-mono tracking-wider font-bold px-1.5 py-0.5 border rounded-lg ${getPriorityColor(s.priorite)}`}>
                      Priorité {s.priorite}
                    </span>
                    <h3 className="font-sans font-semibold text-white text-base leading-snug mt-2">{s.nom}</h3>
                    <p className="text-xs text-slate-400 font-sans flex items-center gap-1.5 pt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span>{s.pays} • <span className="text-slate-300 font-medium">{s.organisation}</span></span>
                    </p>
                  </div>

                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 border rounded-lg shrink-0 font-semibold ${getStatusColor(s.statut)}`}>
                    {getStatusLabel(s.statut)}
                  </span>
                </div>

                {/* Date ranges */}
                <div className="grid grid-cols-2 gap-3.5 p-3 bg-slate-900/40 rounded-xl border border-slate-900/60 mt-4.5">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Date d'ouverture</span>
                    <p className="text-xs text-slate-300 font-semibold mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-500 shrink-0" />
                      {new Date(s.date_debut).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Deadline de Clôture</span>
                    <p className="text-xs text-amber-400 font-semibold mt-1 flex items-center gap-1.5 justify-end">
                      <Calendar className="h-3 w-3 text-amber-500/80 shrink-0" />
                      {new Date(s.date_fin).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Criteria */}
                <div className="mt-4.5 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Critères d'Éligibilité</span>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-3">
                    {s.criteres_eligibilite || "Aucun critère technique spécifié."}
                  </p>
                </div>

                {/* Checklist de pieces justificatives */}
                {s.pieces_demandees && s.pieces_demandees.length > 0 && (
                  <div className="mt-4.5 space-y-1.5 border-t border-slate-900 pt-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Dossier de Pièces Justificatives</span>
                    <div className="flex flex-wrap gap-1.5">
                      {s.pieces_demandees.map((piece, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-md font-sans">
                          ✓ {piece}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personal secrets/notes */}
                {s.notes && (
                  <div className="mt-4.5 p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Mes Notes Privées</span>
                    <p className="text-xs text-slate-400 font-sans mt-1 italic">
                      “ {s.notes} ”
                    </p>
                  </div>
                )}

                {/* Email Sent Success Alert */}
                {reminderSuccessId === s.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2 text-[10px] text-emerald-400 font-mono"
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Rappel envoyé à votre email ! 📭 (Simulation)</span>
                  </motion.div>
                )}

              </div>

              {/* Card Controls */}
              <div className="mt-6 pt-3 border-t border-slate-900 flex items-center justify-between gap-2.5">
                
                <a 
                  href={s.lien_officiel} 
                  target="_blank" 
                  rel="noreferrer referrer" 
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-sans font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Site de la Bourse</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTriggerReminder(s.id)}
                    title="M'envoyer un rappel de révision par email (API Resend)"
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                      reminderSuccessId === s.id
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : s.statut === 'EN_COURS'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-transparent hover:border-slate-800'
                    }`}
                  >
                    <Bell className="h-4.5 w-4.5" />
                  </button>

                  <button
                    onClick={() => handleOpenRecommend(s)}
                    title="Recommander confidentiellement à une amie partageant l'étude"
                    className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 rounded-lg border border-transparent hover:border-indigo-500/10 cursor-pointer transition-all"
                  >
                    <Share2 className="h-4.5 w-4.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(s)}
                    title="Modifier la fiche"
                    className="p-1.5 text-amber-500 hover:text-amber-400 hover:bg-amber-500/5 rounded-lg border border-transparent hover:border-amber-500/10 cursor-pointer transition-all"
                  >
                    <Edit3 className="h-4.5 w-4.5" />
                  </button>

                  <button
                    onClick={() => deleteScholarship(s.id)}
                    title="Supprimer la bourse"
                    className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg border border-transparent hover:border-rose-500/10 cursor-pointer transition-all"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

      ) : (

        // DISPLAY: COMPACT TABLE
        <motion.div 
          className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.3 } }
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-sans">
              <thead className="text-[10px] font-mono uppercase tracking-wider bg-slate-900 border-b border-slate-850 text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Intitulé de la Bourse</th>
                  <th className="px-5 py-3.5">Pays & Org</th>
                  <th className="px-5 py-3.5 text-right">Clôture (Date)</th>
                  <th className="px-5 py-3.5">Priorité</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredScholarships.map((s, idx) => (
                  <motion.tr 
                    key={s.id} 
                    custom={idx}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: (i: number) => ({
                        opacity: 1,
                        y: 0,
                        transition: { delay: i * 0.03, duration: 0.25, ease: "easeOut" }
                      })
                    }}
                    initial="hidden"
                    animate="visible"
                    className="hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white text-xs">{s.nom}</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">{s.lien_officiel}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div>{s.pays}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{s.organisation}</div>
                    </td>
                    <td className="px-5 py-4 text-right text-amber-400 font-mono font-medium">
                      {new Date(s.date_fin).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[9px] px-1.5 py-0.5 font-mono border rounded ${getPriorityColor(s.priorite)}`}>
                        {s.priorite}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[9px] px-1.5 py-0.5 font-mono border rounded-lg ${getStatusColor(s.statut)}`}>
                        {getStatusLabel(s.statut)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a 
                          href={s.lien_officiel} 
                          target="_blank" 
                          rel="noreferrer referrer" 
                          title="Site Officiel"
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleTriggerReminder(s.id)}
                          title={reminderSuccessId === s.id ? "Rappel envoyé !" : "M'envoyer un rappel de révision par email"}
                          className={`p-1 transition-colors ${
                            reminderSuccessId === s.id
                              ? 'text-emerald-400'
                              : s.statut === 'EN_COURS'
                                ? 'text-amber-500 hover:text-amber-400'
                                : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {reminderSuccessId === s.id ? (
                            <MailCheck className="h-4 w-4" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenRecommend(s)}
                          title="Recommander"
                          className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          title="Modifier"
                          className="p-1 text-amber-500 hover:text-amber-400 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteScholarship(s.id)}
                          title="Supprimer"
                          className="p-1 text-rose-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      )}

      {/* MODAL FORM: Add / Edit Scholarship */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="p-5 border-b border-slate-900 bg-slate-950 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <h3 className="text-white font-sans font-semibold text-sm">
                  {editingScholarship ? "Éditer l'opportunité de bourse" : "Enregistrer une bourse internationale"}
                </h3>
              </div>
              <button 
                onClick={handleCloseForm}
                className="p-1.5 border border-slate-800 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Nom de la Bourse</label>
                  <input
                    type="text"
                    required
                    value={formNom}
                    onChange={(e) => setFormNom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="ex: Bourse d'Excellence Eiffel"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Pays d'hébergement</label>
                  <input
                    type="text"
                    required
                    value={formPays}
                    onChange={(e) => setFormPays(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="ex: France, Japon, Canada"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Organisation Émettrice</label>
                  <input
                    type="text"
                    required
                    value={formOrganisation}
                    onChange={(e) => setFormOrganisation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="ex: Campus France, Banque Mondiale"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Lien Officiel (URL)</label>
                  <input
                    type="url"
                    required
                    value={formLien}
                    onChange={(e) => setFormLien(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="https://www.organisation.org/programme"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Date d'ouverture de l'appel</label>
                  <input
                    type="date"
                    required
                    value={formDebut}
                    onChange={(e) => setFormDebut(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Deadline finale de Clôture</label>
                  <input
                    type="date"
                    required
                    value={formFin}
                    onChange={(e) => setFormFin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Niveau de Priorité</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as ScholarshipPriority)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="HAUTE">Haute Priorité</option>
                    <option value="MOYENNE">Moyenne Priorité</option>
                    <option value="FAIBLE">Faible Priorité</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Statut de Postulation</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ScholarshipStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="A_POSTULER">À postuler</option>
                    <option value="EN_COURS">En cours d'écriture</option>
                    <option value="SOUMIS">Dossier soumis</option>
                    <option value="ACCEPTE">Accepté 🎉</option>
                    <option value="REFUSE">Refusé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Critères d'Éligibilité (Texte long)</label>
                <textarea
                  value={formCriteres}
                  onChange={(e) => setFormCriteres(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 h-20 placeholder-slate-600 resize-none"
                  placeholder="Âge limite, moyenne académique requise, diplômes admissibles..."
                  required
                />
              </div>

              {/* PIECES DEMANDEES CHECKLIST */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Pièces justificatives demandées</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-900/40 border border-slate-900 rounded-xl">
                  {defaultDocOptions.map((doc, i) => {
                    const isChecked = formPieces.includes(doc);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleTogglePiece(doc)}
                        className="flex items-center gap-2 px-2 py-1 bg-transparent hover:bg-slate-900/50 rounded-lg text-left text-xs cursor-pointer select-none"
                      >
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-600" />
                        )}
                        <span className={isChecked ? 'text-amber-400 font-medium' : 'text-slate-400'}>{doc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom document addition */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newPieceInput}
                    onChange={(e) => setNewPieceInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                    placeholder="Ajouter une autre pièce spécifique au dossier..."
                  />
                  <button
                    type="button"
                    onClick={handleAddNewPiece}
                    className="px-3 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-amber-500 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Notes personnelles (Notes privées et confidentielles)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 h-16 placeholder-slate-600 resize-none font-sans italic"
                  placeholder="Évocation d'un contact privilégié, statut spécifique, rappels de documents..."
                />
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end gap-3 text-xs bg-slate-950">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-slate-905 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  {editingScholarship ? "Appliquer les modifications" : "Enregistrer la bourse"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confidentially Recommend Scholarship to Academic Friend */}
      {recomModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            
            <div className="p-4.5 border-b border-slate-900 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4.5 w-4.5 text-indigo-400" />
                <span className="text-white font-sans font-semibold text-sm">Transmettre confidentiellement</span>
              </div>
              <button 
                onClick={() => setRecomModalOpen(false)}
                className="p-1 border border-slate-800 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {recomSuccessMsg ? (
              <div className="p-6 text-center space-y-4">
                <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                  <Send className="h-5 w-5" />
                </div>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">{recomSuccessMsg}</p>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 animate-pulse w-full duration-1000" />
                </div>
              </div>
            ) : (
              <form onSubmit={handlesendRecommendationSubmit} className="p-5 space-y-4">
                
                <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Données partagées de la bourse</p>
                  <p className="text-white font-sans text-xs font-semibold mt-1">{recomScholarshipName}</p>
                  <p className="text-[10px] text-slate-400 mt-1 truncate font-mono">{recomScholarshipLien}</p>
                  <p className="text-[9px] text-amber-500 mt-2 font-mono flex items-center gap-1.5 justify-end">
                    <AlertCircle className="h-3 w-3 inline shrink-0" />
                    🔒 Notes & Pièces exclues pour la vie privée
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Amie partageant votre domaine d'études</label>
                  <select
                    value={selectedReceiverId}
                    onChange={(e) => setSelectedReceiverId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {/* List active user friends */}
                    {profiles.filter(p => p.id !== currentUser?.id && p.role !== 'ADMIN' && p.is_active).map(p => {
                      const shares = p.domaine_etudes === currentUser?.domaine_etudes;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.prenom} {p.nom} ({p.domaine_etudes} {shares ? '✨ même domaine' : ''})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Message d'accompagnement (Optionnel)</label>
                  <textarea
                    value={recomMessage}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 h-20 placeholder-slate-700 resize-none font-sans"
                    placeholder="Saisissez vos mots d'encouragement..."
                    onChange={(e) => setRecomMessage(e.target.value)}
                  />
                </div>

                <div className="pt-3 border-t border-slate-900 bg-slate-950 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRecomModalOpen(false)}
                    className="px-3.5 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-400 text-xs rounded-xl cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-slate-100 font-semibold text-xs rounded-xl cursor-pointer shadow-lg shadow-indigo-500/10 flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Envoyer confidentiellement</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
