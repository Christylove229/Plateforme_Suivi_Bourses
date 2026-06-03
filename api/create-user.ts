import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialiser le client Supabase avec la clé SERVICE ROLE pour avoir les droits d'admin
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const resend = new Resend(process.env.RESEND_API_KEY as string);

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

  const { prenom, nom, email, domaine, appUrl } = req.body;

  if (!prenom || !nom || !email || !domaine) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Générer un mot de passe temporaire
    const tempPass = 'Bourse_' + Math.floor(1000 + Math.random() * 9000);

    // 2. Créer l'utilisateur dans Supabase Auth (Ceci va déclencher le trigger pour créer le profil)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPass,
      email_confirm: true, // Pas besoin de confirmation email pour l'instant
      user_metadata: {
        prenom,
        nom,
        domaine_etudes: domaine,
        role: 'USER',
      },
    });

    if (authError) {
      console.error('Erreur création Supabase:', authError);
      return res.status(400).json({ error: authError.message });
    }

    // Le trigger dans Supabase (défini dans le SQL) va créer l'entrée dans public.profiles.
    // Pas besoin de le faire manuellement ici.

    // 3. Envoyer l'email d'invitation avec Resend
    // Si pas de domaine vérifié, envoyer uniquement au propriétaire du compte Resend (onboarding@resend.dev)
    try {
      await resend.emails.send({
        from: 'ScholarTrack <onboarding@resend.dev>', // Adresse d'envoi (doit être vérifiée sur Resend ou onboarding@resend.dev pour les tests)
        to: email, // L'adresse de l'utilisateur (Attention: en mode test Resend, ça ne marche que vers VOTRE email)
        subject: `🎒 Votre accès à la Plateforme de Bourses : ${prenom} ${nom}`,
        html: `
          <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 12px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e2e8f0;border-radius:22px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.08);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#020617,#1e293b);padding:28px 32px;">
                        <div style="display:inline-block;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);color:#f59e0b;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                          ScholarTrack
                        </div>
                        <h1 style="margin:18px 0 0;font-size:26px;line-height:1.25;color:#ffffff;font-weight:800;">
                          Votre accès à la plateforme est prêt
                        </h1>
                        <p style="margin:10px 0 0;color:#cbd5e1;font-size:14px;line-height:1.7;">
                          Suivi confidentiel et recommandations de bourses d'études internationales.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px;">
                        <p style="margin:0 0 16px;font-size:17px;line-height:1.6;color:#0f172a;">
                          Bonjour <strong>${prenom} ${nom}</strong>,
                        </p>
                        <p style="margin:0 0 22px;font-size:14px;line-height:1.8;color:#475569;">
                          Votre compte ScholarTrack a été créé par l'administration. Vous pouvez maintenant accéder à votre espace sécurisé pour suivre vos opportunités de bourses et recevoir des recommandations.
                        </p>
                        ${appUrl ? `
                          <div style="margin:26px 0;text-align:center;">
                            <a href="${appUrl}" target="_blank" style="display:inline-block;background:#f59e0b;color:#111827;text-decoration:none;font-size:14px;font-weight:800;padding:14px 22px;border-radius:14px;box-shadow:0 10px 22px rgba(245,158,11,0.28);">
                              Se connecter à ScholarTrack
                            </a>
                            <p style="margin:12px 0 0;font-size:12px;color:#64748b;word-break:break-all;">
                              ${appUrl}
                            </p>
                          </div>
                        ` : ''}
                        <div style="margin:26px 0;padding:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
                          <p style="margin:0 0 8px;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
                            Mot de passe temporaire
                          </p>
                          <div style="font-family:'Courier New',Courier,monospace;font-size:22px;letter-spacing:0.08em;font-weight:800;color:#0f172a;background:#ffffff;border:1px dashed #cbd5e1;border-radius:12px;padding:14px 16px;text-align:center;">
                            ${tempPass}
                          </div>
                        </div>
                        <div style="margin:24px 0 0;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:14px;color:#92400e;font-size:13px;line-height:1.7;">
                          <strong>Important :</strong> pour protéger votre compte, ce mot de passe devra être modifié lors de votre première connexion.
                        </div>
                        <p style="margin:28px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
                          Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email ou contacter l'administration.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                        <p style="margin:0;font-size:12px;color:#94a3b8;">
                          ScholarTrack — Plateforme académique de suivi de bourses
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Erreur envoi email (Resend):', emailError);
      // On ne bloque pas si l'email échoue (souvent dû aux restrictions du domaine de test), on prévient juste
      return res.status(200).json({ 
        success: true, 
        tempPass, 
        warning: "Le compte a été créé, mais l'envoi de l'email a échoué (vérifiez votre domaine Resend)." 
      });
    }

    return res.status(200).json({ success: true, tempPass });

  } catch (error: any) {
    console.error('Erreur inattendue:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
