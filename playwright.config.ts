import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./e2e', fullyParallel:false, workers:1,
  use:{baseURL:'http://127.0.0.1:5173',headless:true,channel:process.platform==='win32'?'msedge':undefined},
  webServer:{command:'npm run dev -- --port 5173 --strictPort',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,env:{VITE_RUNNER_URL:'https://runner.example.test'},timeout:60000},
});
