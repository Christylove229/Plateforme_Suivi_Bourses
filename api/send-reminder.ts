// This file is deprecated - Resend has been replaced with Supabase Auth
export default async function handler(req: any, res: any) {
  return res.status(501).json({ error: 'This endpoint is deprecated' });
}
