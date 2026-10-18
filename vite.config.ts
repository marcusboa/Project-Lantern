import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { createCardApi } from './server/cardApi'
import { openCardStore } from './server/cardStore'

/** Serves the Studio card API from the dev and preview servers, so one command runs everything. */
function cardApi(): Plugin {
  return {
    name: 'lantern-card-api',
    configureServer(server) {
      server.middlewares.use('/api', createCardApi(openCardStore()))
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api', createCardApi(openCardStore()))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cardApi()],
})
