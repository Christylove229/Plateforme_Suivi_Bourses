# 🎓 ScholarTrack — Suivi & Recommandation de Bourses

Plateforme académique d'excellence permettant à des groupes de candidates de suivre et de se recommander des programmes de bourses d'études internationales de manière sécurisée et confidentielle.

---

## 🚀 Caractéristiques Clés
*   **Tableau de Bord Privé (USER)** : Statistiques, notifications de deadlines imminentes (<30 jours), et recommandations de bourses d'amies.
*   **Gestion Autonome des Bourses** : Formulaire complet (priorité, domaine d'étude, dates d'ouverture/fermeture, checklists de pièces justificatives, notes secrètes).
*   **Recommandation Solidaire** : Transmission d'une opportunité à une amie partageant le même domaine d'étude, préservant le secret absolu des notes personnelles et pièces justificatives du candidat expéditeur.
*   **Console Administrative (ADMIN)** : Création sécurisée des profils d'études, génération de mot de passe temporaire initial, suspension temporaire de comptes.
*   **Authentification Exclusive** : Obligation de mise à jour du mot de passe à la première connexion (`is_first_login`).
*   **Confidentialité Totale (RLS)** : L'administrateur n'a aucun regard ni accès en lecture/écriture aux bourses spécifiques ciblées par les candidates (conforme aux Politiques de sécurité Supabase).

---

## 🛠️ Stack Technique & Hébergement
*   **Frontend & UI** : React 19 + TypeScript + Lucide Icons.
*   **Styles & Animations** : Tailwind CSS + Motion.
*   **Base de Données & Sécurité** : PostgreSQL + Règles RLS sur Supabase.
*   **Hébergement & Déploiement** : Prêt pour déploiement instantané sur Vercel.

---

## 🗄️ Étapes d'Installation & Configuration (Supabase + Vercel)

### Étape 1 : Initialisation de la Base de Données (Supabase)
1. Créez un projet de base de données gratuit sur [Supabase](https://supabase.com).
2. Ouvrez l'onglet **SQL Editor** dans votre tableau de bord Supabase.
3. Copiez puis exécutez le script SQL présent dans le projet sous `/src/data/supabase_schema.sql`.
   *Ce script va structurer les tables `profiles`, `scholarships` et `recommendations`, configurer les clés primaires/étrangères, les triggers automatiques de création de profil à l'inscription, ainsi que toutes les politiques d'accès de sécurité RLS restrictives.*

### Étape 2 : Configuration des Variables d'Environnement
Pour connecter l'application à Supabase et à votre service d'emails Resend dans votre environnement de production, déclarez ces clés dans votre projet Vercel ou votre fichier de configuration local `.env` :

```env
# Clé d'API requis pour les modules optionnels d'IA
GEMINI_API_KEY="votre_cle_gemini_api"

# URL publique de déploiement
APP_URL="https://votre-projet.vercel.app"

# Configuration Supabase (Production)
VITE_SUPABASE_URL="https://votre-id-supabase.supabase.co"
VITE_SUPABASE_ANON_KEY="votre-anon-key-de-liaison"
SUPABASE_SERVICE_ROLE_KEY="votre-service-role-key"

# Configuration Éléments d'Email (Resend)
RESEND_API_KEY="re_votre_cle_api_resend"
```

### Étape 3 : Déploiement sur Vercel
1. Installez le CLI de Vercel ou connectez simplement votre compte Github à la plateforme de déploiement [Vercel](https://vercel.com).
2. Ajoutez un nouveau projet de dépôt et sélectionnez la racine du projet.
3. Renseignez les variables d'environnement listées à l'Étape 2 dans les paramètres du projet Vercel.
4. Cliquez sur **Deploy**. Le build et la mise en production s'accomplissent automatiquement !

---

## 🧪 Simulation Locale & Sandbox pour Tests de Démonstration
Pour faciliter vos vérifications de fonctionnalités complexes **multi-utilisatrices (comme l'envoi et la réception de recommandations instantanées)** au sein d'un navigateur ou d'une iframe sans configuration initiale requise, nous avons intégré un **Sélecteur Démo Sandbox** (au bas de la barre de navigation du site) :
*   **Changement d'identité à la volée** : Passez de *Marie Curie* (utilisatrice finale) à *Ada Lovelace* (consœur d'études) ou à l'adresse administrateur *Directrice Sophie* pour observer les interactions croisées de notifications.
*   **Boîte mail virtuelle (Resend Log)** : Les invitations de création de compte initiées par l'administrateur s'affichent instantanément dans l'onglet des logs administratifs, vous permettant d'extraire les mots de passe temporaires d'invitation d'un clic !
