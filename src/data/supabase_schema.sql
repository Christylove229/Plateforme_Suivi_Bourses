-- ==========================================================
-- SCHEMA DE BASE DE DONNEES SUPABASE / POSTGRESQL
-- PROJET : Suivi de Bourses d'Études Internationales
-- ==========================================================

-- Désactiver les restrictions pour la réinitialisation si nécessaire
-- DROP TABLE IF EXISTS recommendations;
-- DROP TABLE IF EXISTS scholarships;
-- DROP TABLE IF EXISTS profiles;

-- 1. Table des profils d'utilisateurs (liée à auth.users de Supabase)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    domaine_etudes TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')) DEFAULT 'USER',
    is_first_login BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour des performances accrues
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_domaine ON public.profiles(domaine_etudes);

-- Commentaire de la table
COMMENT ON TABLE public.profiles IS 'Profils enrichis des utilisatrices et de la direction (ADMIN).';

-- 2. Table des bourses d'études
CREATE TABLE public.scholarships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    nom TEXT NOT NULL,
    pays TEXT NOT NULL,
    organisation TEXT NOT NULL,
    lien_officiel TEXT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    criteres_eligibilite TEXT NOT NULL,
    pieces_demandees TEXT[] NOT NULL DEFAULT '{}',
    priorite TEXT NOT NULL CHECK (priorite IN ('HAUTE', 'MOYENNE', 'FAIBLE')),
    domaine TEXT NOT NULL,
    statut TEXT NOT NULL CHECK (statut IN ('A_POSTULER', 'EN_COURS', 'SOUMIS', 'ACCEPTE', 'REFUSE')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_scholarships_user ON public.scholarships(user_id);
CREATE INDEX idx_scholarships_statut ON public.scholarships(statut);
CREATE INDEX idx_scholarships_date_fin ON public.scholarships(date_fin);

-- 3. Table des recommandations de bourses
CREATE TABLE public.recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    scholarship_nom TEXT NOT NULL,
    scholarship_lien TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_recommendations_receiver ON public.recommendations(receiver_id);
CREATE INDEX idx_recommendations_unread ON public.recommendations(receiver_id) WHERE is_read = FALSE;

-- ==========================================================
-- REGLES DE SECURITE (Row Level Security - RLS)
-- ==========================================================

-- Activer la RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_domain(user_id UUID)
RETURNS TEXT AS $$
  SELECT domaine_etudes
  FROM public.profiles
  WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ----------------------------------------------------------
-- POLITIQUES SUR LA TABLE public.profiles
-- ----------------------------------------------------------

-- Règle 1 : Chaque profil peut lire ses propres données
CREATE POLICY "Les utilisatrices peuvent voir leur propre profil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Règle 2 : Le profil est modifiable par son propre détenteur (ex: modifier son domaine, changer is_first_login, etc.)
CREATE POLICY "Les utilisatrices peuvent modifier leur propre profil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Règle 3 : Les ADMIN peuvent TOUT voir sur les profils (liste complète des utilisatrices, statuts...)
CREATE POLICY "Les administrateurs peuvent voir tous les profils" 
ON public.profiles FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Règle 4 : Les ADMIN peuvent créer ou mettre à jour (activer/désactiver) des profils d'utilisatrices
CREATE POLICY "Les administrateurs peuvent inserer/modifier tous les profils" 
ON public.profiles FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Règle 5 : Les utilisatrices peuvent voir les noms et domaines d'autres personnes partageant le même domaine pour recommander
-- (Restreint aux profils actifs)
CREATE POLICY "Les utilisatrices voient les amies pour recommandation" 
ON public.profiles FOR SELECT 
USING (
    is_active = TRUE 
    AND (
        domaine_etudes = public.get_user_domain(auth.uid())
        OR public.is_admin(auth.uid())
    )
);

-- ----------------------------------------------------------
-- POLITIQUES SUR LA TABLE public.scholarships
-- ----------------------------------------------------------

-- Règle 1 : Une utilisatrice peut tout faire sur ses propres bourses
CREATE POLICY "Gestion complete de ses propres bourses"
ON public.scholarships FOR ALL
USING (auth.uid() = user_id);

-- Note : Par cette règle RLS, l'ADMIN n'a AUCUN accès en SELECT, INSERT, UPDATE, ou DELETE
-- aux bourses des autres utilisatrices (conforme à l'exigence : "Pas d'accès aux bourses des utilisatrices").

-- ----------------------------------------------------------
-- POLITIQUES SUR LA TABLE public.recommendations
-- ----------------------------------------------------------

-- Règle 1 : L'utilisatrice destinataire peut lire les recommandations qui lui sont destinées
CREATE POLICY "Lecture des recommandations recues"
ON public.recommendations FOR SELECT
USING (auth.uid() = receiver_id);

-- Règle 2 : L'utilisatrice émettrice peut voir les recommandations qu'elle a envoyées
CREATE POLICY "Lecture des recommandations envoyees"
ON public.recommendations FOR SELECT
USING (auth.uid() = sender_id);

-- Règle 3 : N'importe quelle utilisatrice peut insérer une recommandation si elle en est l'expéditrice
CREATE POLICY "Creation de recommandations"
ON public.recommendations FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Règle 4 : Seule la destinataire peut modifier le statut de lecture (is_read) d'une recommandation
CREATE POLICY "Mise a jour statut de lecture par destinataire"
ON public.recommendations FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- ==========================================================
-- DECLENCHEUR (TRIGGER) POUR LA CREATION DE COMPTES
-- Autogénère automatiquement le profil public correspondant à l'utilisateur Auth
-- ==========================================================

-- Fonction déclenchée à l'inscription dans auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom, domaine_etudes, role, is_first_login, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Nom'),
    COALESCE(NEW.raw_user_meta_data->>'prenom', 'Prénom'),
    COALESCE(NEW.raw_user_meta_data->>'domaine_etudes', 'Non renseigné'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER'),
    TRUE,
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activation du trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
