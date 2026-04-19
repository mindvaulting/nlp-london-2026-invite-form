const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const {
    yourName, yourPhone, yourEmail,
    friend1_name, friend1_phone, friend1_email,
    friend2_name, friend2_phone, friend2_email,
    friend3_name, friend3_phone, friend3_email,
    friend4_name, friend4_phone, friend4_email,
    friend5_name, friend5_phone, friend5_email,
  } = req.body;

  if (!yourPhone || !yourEmail) {
    return res.status(400).json({ error: 'Phone and email are required.' });
  }

  if (!friend1_name) {
    return res.status(400).json({ error: 'Friend #1 name is required.' });
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
    return res.status(500).json({ error: 'Failed to save submission.' });
  }

  res.json({ success: true, id: data.id });
};
