/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_URL?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_FINANCEIRO_FATURAS_LINKS_JSON_URL?: string;
  readonly VITE_FINANCEIRO_FATURAS_XML_ZIP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'bootstrap/dist/js/bootstrap.bundle.min.js';