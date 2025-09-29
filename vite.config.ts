import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast `process` to `any` to resolve TypeScript error on `process.cwd()`.
  // This is a common workaround when Node.js types are not properly configured in tsconfig.json.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    // Để triển khai trên tên miền riêng (ví dụ: detin.leminhdang.com),
    // đường dẫn cơ sở (base path) phải là '/'.
    base: '/', 
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})