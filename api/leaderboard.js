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
    .select('your_name, your_email, friend1_name, friend2_name, friend3_name, friend4_name, friend5_name')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }

  // Group by normalised name, accumulate friend counts across all submissions
  const map = {};
  for (const row of data) {
    const nameRaw = (row.your_name || '').trim();
    const key = nameRaw.toLowerCase() || (row.your_email || '').toLowerCase().trim();
    if (!key) continue;

    const friendCount = [
      row.friend1_name,
      row.friend2_name,
      row.friend3_name,
      row.friend4_name,
      row.friend5_name,
    ].filter(n => n && n.trim() !== '').length;

    if (!map[key]) {
      map[key] = {
        name: nameRaw || row.your_email,
        email: row.your_email,
        friends: 0,
        submissions: 0,
      };
    }
    map[key].friends += friendCount;
    map[key].submissions += 1;
  }

  const ranked = Object.values(map)
    .sort((a, b) => b.friends - a.friends)
    .map((entry, i) => ({ rank: i + 1, ...entry }));

  res.json(ranked);
};
