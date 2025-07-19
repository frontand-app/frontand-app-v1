export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "https://klethzffhbnkpflbfufs.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZXRoemZmaGJua3BmbGJmdWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzA5NTIsImV4cCI6MjA2NzkwNjk1Mn0.ojgULbT0x-x-3iTOwYRhs4ERkOxp8Lh225ENpuufSqM"
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8000"
  },
  environment: import.meta.env.VITE_ENVIRONMENT || "development"
}; 