import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY as string);
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL as string,
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
    .select('email,is_active')
    .eq('id', authUser.user.id)
    .single();

  if (requesterProfileError || !requesterProfile?.is_active) {
    return res.status(403).json({ error: 'Compte inactif' });
  }

  const { to, prenom, subject, messageBody } = req.body;

  if (!to || !prenom || !subject || !messageBody) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (to !== requesterProfile.email) {
    return res.status(403).json({ error: 'Destinataire non autorisé' });
  }

  try {
    // Envoyer l'email de rappel
    await resend.emails.send({
      from: 'ScholarTrack <onboarding@resend.dev>', // Doit être vérifié ou onboarding@resend.dev en test
      to, // L'adresse de l'utilisateur
      subject,
      text: messageBody, // Envoi en texte brut pour respecter le formatage original
      html: `<div style="font-family: monospace; white-space: pre-wrap; color: #333; line-height: 1.5;">${messageBody.replace(/\n/g, '<br/>')}</div>`
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Erreur envoi email rappel (Resend):', error);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email.' });
  }
}
