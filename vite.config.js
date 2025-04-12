import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  define: {
    'process.env.KENDO_LICENSE_KEY': JSON.stringify('141j044b041h541j4i1d542e582i511k0b1i111c121f0i1b121e152301275331162f592d5g2j591i552i5g2e5i250d1c0g1i0h1d0k1h0h1g1721072d513718305b27612h5b1c4k214g1k5g2b571f4d34564a504b53464k4b523j4h3a5g1f083k582g61275c2g561h571g4c33554b4k4a5447504a513k4g395f1g093j571g53236024541d572b122h0a2j0b2e0e2i0b30062718235723011e311d3157355d0k1d0f550a530f1d11573658482k0953091f321f381h351i0k1h341d38573j6048561b4i05295c182437290431023a16551e3e00380g47134d402f464j3613')
  },
  resolve: {
    alias: {
      '@progress/kendo-licensing': '@progress/kendo-licensing'
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://stinsondemo.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});