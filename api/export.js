const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to fetch submissions.' });
  }

  const columns = [
    'id', 'created_at',
    'your_name', 'your_phone', 'your_email',
    'friend1_name', 'friend1_phone', 'friend1_email',
    'friend2_name', 'friend2_phone', 'friend2_email',
    'friend3_name', 'friend3_phone', 'friend3_email',
    'friend4_name', 'friend4_phone', 'friend4_email',
    'friend5_name', 'friend5_phone', 'friend5_email',
  ];

  const escape = (val) => {
    if (val == null) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const csv = [
    columns.join(','),
    ...data.map(row => columns.map(col => escape(row[col])).join(',')),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
  res.send(csv);
};
