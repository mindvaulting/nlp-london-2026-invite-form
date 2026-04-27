const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const {
    yourName, yourPhone, yourEmail,
    friend1_name, friend1_phone, friend1_whatsapp, friend1_email,
    friend2_name, friend2_phone, friend2_whatsapp, friend2_email,
    friend3_name, friend3_phone, friend3_whatsapp, friend3_email,
    friend4_name, friend4_phone, friend4_whatsapp, friend4_email,
    friend5_name, friend5_phone, friend5_whatsapp, friend5_email,
  } = req.body;

  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());

  const isValidPhone = v => {
    const d = (v || '').replace(/\D/g, '');
    return d.length === 10 || (d.length === 11 && d.startsWith('1'));
  };

  const isValidWhatsApp = v => {
    const d = (v || '').replace(/\D/g, '');
    const isCanadian = d.length === 10 || (d.length === 11 && d.startsWith('1'));
    const isNigerian = (d.length === 13 && d.startsWith('234')) ||
                       (d.length === 11 && d.startsWith('0')) ||
                       d.length === 10;
    return isCanadian || isNigerian;
  };

  if (!yourPhone) return res.status(400).json({ error: 'Phone number is required.' });
  if (!isValidPhone(yourPhone)) return res.status(400).json({ error: 'Invalid phone number format.' });
  if (!yourEmail) return res.status(400).json({ error: 'Email is required.' });
  if (!isValidEmail(yourEmail)) return res.status(400).json({ error: 'Invalid email address.' });
  if (!friend1_name) return res.status(400).json({ error: 'Friend #1 name is required.' });

  const friends = [
    { name: friend1_name, phone: friend1_phone, whatsapp: friend1_whatsapp, email: friend1_email },
    { name: friend2_name, phone: friend2_phone, whatsapp: friend2_whatsapp, email: friend2_email },
    { name: friend3_name, phone: friend3_phone, whatsapp: friend3_whatsapp, email: friend3_email },
    { name: friend4_name, phone: friend4_phone, whatsapp: friend4_whatsapp, email: friend4_email },
    { name: friend5_name, phone: friend5_phone, whatsapp: friend5_whatsapp, email: friend5_email },
  ];

  for (let i = 0; i < 5; i++) {
    const { name, phone, whatsapp, email } = friends[i];
    if (name) {
      if (!phone && !whatsapp)
        return res.status(400).json({ error: `Friend #${i + 1} requires a phone or WhatsApp number.` });
    }
    if (phone && !isValidPhone(phone))
      return res.status(400).json({ error: `Friend #${i + 1} has an invalid phone number.` });
    if (whatsapp && !isValidWhatsApp(whatsapp))
      return res.status(400).json({ error: `Friend #${i + 1} has an invalid WhatsApp number.` });
    if (email && !isValidEmail(email))
      return res.status(400).json({ error: `Friend #${i + 1} has an invalid email address.` });
  }

  const { data, error } = await supabase.from('submissions').insert([{
    your_name:  yourName  || null,
    your_phone: yourPhone,
    your_email: yourEmail,
    friend1_name, friend1_phone, friend1_whatsapp, friend1_email,
    friend2_name, friend2_phone, friend2_whatsapp, friend2_email,
    friend3_name, friend3_phone, friend3_whatsapp, friend3_email,
    friend4_name, friend4_phone, friend4_whatsapp, friend4_email,
    friend5_name, friend5_phone, friend5_whatsapp, friend5_email,
  }]).select('id').single();

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to save submission.', detail: error.message, code: error.code });
  }

  res.json({ success: true, id: data.id });
};
