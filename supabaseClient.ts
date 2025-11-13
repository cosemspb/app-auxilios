import { createClient } from '@supabase/supabase-js';

// As credenciais do seu projeto Supabase.
// É seguro expor a chave 'anon' (pública) em um aplicativo de navegador (client-side).
// A segurança é garantida pelas Políticas de Nível de Linha (RLS) no seu banco de dados.
const supabaseUrl = 'https://azrdhrpajkmqurutnbdu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmRocnBhamttcXVydXRuYmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTI5MDgsImV4cCI6MjA3ODU2ODkwOH0.FEjfB0-sTkFBreWvGPNIimCJr5RGUlEJfJu48OJj4zI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
