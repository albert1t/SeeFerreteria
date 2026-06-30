/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_AZURE_AD_CLIENT_ID?: string;
    readonly VITE_AZURE_AD_TENANT_ID?: string;
    readonly VITE_MSAL_REDIRECT_URI?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
