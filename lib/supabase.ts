import { createClient } from '@supabase/supabase-js';

// Замени эти данные на свои из настроек Supabase (Project Settings -> API)
const supabaseUrl = 'https://ptqeoadgvadhkvyehspo.supabase.co';
const supabaseAnonKey = 'sb_publishable_8inpT1zO309ZmoU6sayzgw_c8TGSurY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);