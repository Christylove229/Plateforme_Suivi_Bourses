import { createClient } from '@supabase/supabase-js';

// Initialiser le client Supabase avec la clé SERVICE ROLE pour avoir les droits d'admin
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'DELETE') {
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

  try {
    // Delete from Supabase Auth (this will cascade delete from profiles, scholarships, recommendations)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);

    if (authError) {
      return res.status(500).json({ error: authError.message });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression compte:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de votre compte.' });
  }
}
