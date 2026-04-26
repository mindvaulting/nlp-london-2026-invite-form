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
    friend1_name, friend1_phone, friend1_email,
    friend2_name, friend2_phone, friend2_email,
    friend3_name, friend3_phone, friend3_email,
    friend4_name, friend4_phone, friend4_email,
    friend5_name, friend5_phone, friend5_email,
  } = req.body;

  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
  const isValidPhone = v => {
    const digits = (v || '').replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
  };

  if (!yourPhone) return res.status(400).json({ error: 'Phone number is required.' });
  if (!isValidPhone(yourPhone)) return res.status(400).json({ error: 'Invalid phone number format.' });
  if (!yourEmail) return res.status(400).json({ error: 'Email is required.' });
  if (!isValidEmail(yourEmail)) return res.status(400).json({ error: 'Invalid email address.' });
  if (!friend1_name) return res.status(400).json({ error: 'Friend #1 name is required.' });

  const friendPhones = [friend1_phone, friend2_phone, friend3_phone, friend4_phone, friend5_phone];
  const friendEmails = [friend1_email, friend2_email, friend3_email, friend4_email, friend5_email];

  for (let i = 0; i < 5; i++) {
    if (friendPhones[i] && !isValidPhone(friendPhones[i]))
      return res.status(400).json({ error: `Friend #${i + 1} has an invalid phone number.` });
    if (friendEmails[i] && !isValidEmail(friendEmails[i]))
      return res.status(400).json({ error: `Friend #${i + 1} has an invalid email address.` });
  }

  const { data, error } = await supabase.from('submissions').insert([{
    your_name:  yourName  || null,
    your_phone: yourPhone,
    your_email: yourEmail,
    friend1_name,  friend1_phone,  friend1_email,
    friend2_name,  friend2_phone,  friend2_email,
    friend3_name,  friend3_phone,  friend3_email,
    friend4_name,  friend4_phone,  friend4_email,
    friend5_name,  friend5_phone,  friend5_email,
  }]).select('id').single();

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to save submission.', detail: error.message, code: error.code });
  }

  res.json({ success: true, id: data.id });
};
