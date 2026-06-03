# Guide de déploiement GitHub + Vercel

## Avant d’envoyer sur GitHub

### 1. Vérifier le .gitignore

Le fichier `.gitignore` est déjà configuré pour ignorer les fichiers sensibles :

```text
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 2. Vérifier que .env n’est pas suivi par Git

Exécute cette commande pour vérifier :

```bash
git status
```

Si `.env` apparaît dans les fichiers non suivis, c’est correct.

### 3. Vérifier que .env.example existe

Le fichier `.env.example` documente les variables d’environnement nécessaires.

## Déploiement sur GitHub

### 1. Initialiser le repository

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Créer le repository sur GitHub

1. Va sur https://github.com/new
2. Crée un nouveau repository (sans README, .gitignore, license)
3. Copie l’URL du repository

### 3. Connecter et pousser

```bash
git remote add origin <ton-repository-url>
git branch -M main
git push -u origin main
```

## Déploiement sur Vercel

### 1. Importer le projet sur Vercel

1. Va sur https://vercel.com/new
2. Clique sur "Import Git Repository"
3. Sélectionne ton repository GitHub

### 2. Configurer les variables d’environnement

Dans les settings du projet Vercel, ajoute ces variables :

| Variable | Description | Source |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | URL du projet Supabase | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Clé admin Supabase | Supabase Dashboard > Settings > API |
| `VITE_RESEND_API_KEY` | Clé API Resend | Resend Dashboard > API Keys |
| `VITE_GEMINI_API_KEY` | Clé API Google Gemini | Google AI Studio |

### 3. Configurer les fonctions serverless

Le fichier `vercel.json` est déjà configuré pour :

- Build command : `npm run build`
- Output directory : `dist`
- Framework : Vite
- Rewrites pour les routes `/api/*`

### 4. Déployer

Clique sur "Deploy" dans Vercel.

## Après le déploiement

### 1. Vérifier les fonctions API

Les fonctions serverless sont dans le dossier `api/` :

- `api/create-user.ts` - Création d’utilisateur par admin
- `api/send-reminder.ts` - Envoi de rappels email

Vercel les déploiera automatiquement comme fonctions serverless.

### 2. Configurer Supabase Email Templates

Configure les templates email dans Supabase :

1. Supabase Dashboard > Authentication > Email Templates
2. Configure "Reset Password" avec le template dans `templates/reset-password-email.html`

### 3. Tester l’application

1. Ouvre l’URL Vercel
2. Teste la connexion
3. Teste la création d’utilisateur (admin)
4. Teste la réinitialisation de mot de passe

## Variables d’environnement locales vs Vercel

### Localement

Utilise le fichier `.env` avec tes vraies clés.

### Sur Vercel

Configure les variables dans :
```text
Vercel Dashboard > Settings > Environment Variables
```

## Sécurité

- **Jamais** committer `.env` sur GitHub
- Utiliser `.env.example` pour documenter les variables
- Les variables Vercel sont chiffrées et sécurisées
- Le `SUPABASE_SERVICE_ROLE_KEY` donne des droits admin - ne le partager jamais
