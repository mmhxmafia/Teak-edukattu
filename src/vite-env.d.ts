/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_ENDPOINT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_RAZORPAY_KEY_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
