/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  domaine_etudes: string;
  role: UserRole;
  is_first_login: boolean;
  is_active: boolean;
  created_at: string;
}

export type ScholarshipPriority = 'HAUTE' | 'MOYENNE' | 'FAIBLE';

export type ScholarshipStatus = 'A_POSTULER' | 'EN_COURS' | 'SOUMIS' | 'ACCEPTE' | 'REFUSE';

export interface Scholarship {
  id: string;
  user_id: string;
  nom: string;
  pays: string;
  organisation: string;
  lien_officiel: string;
  date_debut: string; // YYYY-MM-DD
  date_fin: string; // YYYY-MM-DD
  criteres_eligibilite: string;
  pieces_demandees: string[]; // List of required documents (e.g. ["CV", "Lettre de motivation"])
  priorite: ScholarshipPriority;
  domaine: string;
  statut: ScholarshipStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  sender_id: string;
  sender_nom_complet: string;
  receiver_id: string;
  scholarship_nom: string;
  scholarship_lien: string;
  message?: string;
  is_read: boolean;
  created_at: string;
}

export interface SentInvitationEmailSimulated {
  id: string;
  to: string;
  subject: string;
  prenom: string;
  nom: string;
  tempPass?: string;
  sentAt: string;
  type?: 'INVITATION' | 'RAPPEL';
  scholarshipNom?: string;
  messageBody?: string;
  appUrl?: string;
}
