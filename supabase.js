import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://sldlhompkdzjtthxvlag.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZGxob21wa2R6anR0aHh2bGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTQ2NTIsImV4cCI6MjA4NDY3MDY1Mn0.8ndMqJNkGRQFwiDI8xjrqP3hVdNuloXkDh-0KgEjhxE";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);