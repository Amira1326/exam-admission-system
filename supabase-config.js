// ============================================================
// إعدادات الاتصال بقاعدة البيانات (Supabase)
// ضع هنا القيم من: Supabase Dashboard > Project Settings > API
// ============================================================
const SUPABASE_URL = "https://hkijyxarwkmjnnyskojs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhraWp5eGFyd2ttam5ueXNrb2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMTkzNjEsImV4cCI6MjA5OTg5NTM2MX0.4aOjh7YaRgq9Le1vKbks0Zn3391RKiGqRk64HpnqNOw";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
