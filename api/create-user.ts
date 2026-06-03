import { createClient } from '@supabase/supabase-js';

// Initialiser le client Supabase avec la clé SERVICE ROLE pour avoir les droits d'admin
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { data: authUser, error: authUserError } = await supabaseAdmin.auth.getUser(token);
  if (authUserError || !authUser.user) {
    return res.status(401).json({ error: 'Session invalide' });
  }

  const { data: requesterProfile, error: requesterProfileError } = await supabaseAdmin
    .from('profiles')
    .select('role,is_active')
    .eq('id', authUser.user.id)
    .single();

  if (requesterProfileError || requesterProfile?.role !== 'ADMIN' || !requesterProfile?.is_active) {
    return res.status(403).json({ error: 'Accès administrateur requis' });
  }

  const { prenom, nom, email, domaine } = req.body;

  if (!prenom || !nom || !email || !domaine) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Envoyer l'invitation via Supabase Auth (crée l'utilisateur et envoie l'email)
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        prenom,
        nom,
        domaine_etudes: domaine,
        role: 'USER',
      },
    });

    if (inviteError) {
      console.error('Erreur invitation Supabase:', inviteError);
      return res.status(400).json({ error: inviteError.message });
    }

    // Le trigger dans Supabase (défini dans le SQL) va créer l'entrée dans public.profiles
    // Une fois l'utilisateur accepte l'invitation et se connecte

    return res.status(200).json({ success: true, message: 'Invitation envoyée avec succès' });

  } catch (error: any) {
    console.error('Erreur inattendue:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
