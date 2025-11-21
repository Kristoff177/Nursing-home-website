/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_MAKE_WEBHOOK_URL: string;
  readonly VITE_API_TOKEN: string;
  readonly VITE_TIMEOUT_MS: string;
  readonly VITE_MAX_TEXT_LENGTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
