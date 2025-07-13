const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function storeSummary(url, summary) {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .insert([{ url, summary, created_at: new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }) }])
      .select();
    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }
    console.log('Summary stored in Supabase');
    return data;
  } catch (error) {
    console.error('Failed to store summary:', error.message);
    throw new Error(`Failed to store summary: ${error.message}`);
  }
}

module.exports = { storeSummary };