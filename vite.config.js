import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/** Rewrite clean extensionless routes (/speakers, /memories) in dev & preview to match vercel.json. */
function cleanRouteMiddleware() {
  return {
    name: 'devfest-clean-routes',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/speakers') req.url = '/speakers.html';
        else if (req.url === '/memories') req.url = '/memories.html';
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/speakers') req.url = '/speakers.html';
        else if (req.url === '/memories') req.url = '/memories.html';
        next();
      });
    },
  };
}

/** Inline the tiny ~6KB gzip CSS bundle into production HTML so FCP/LCP suffer zero render-blocking stylesheet RTT. */
function inlineSmallCssPlugin() {
  return {
    name: 'devfest-inline-small-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const cssEntry = Object.entries(bundle).find(
        ([fileName, chunk]) => fileName.endsWith('.css') && chunk.type === 'asset'
      );
      if (!cssEntry) return;
      const [cssFileName, cssAsset] = cssEntry;
      const cssSource = String(cssAsset.source || '');
      const escaped = cssFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const linkRegex = new RegExp(`<link\\b[^>]*rel=["']stylesheet["'][^>]*href=["']/?${escaped}["'][^>]*>`, 'gi');

      let inlinedCount = 0;
      for (const [name, chunk] of Object.entries(bundle)) {
        if (!name.endsWith('.html') || chunk.type !== 'asset') continue;
        const html = String(chunk.source);
        if (linkRegex.test(html)) {
          chunk.source = html.replace(linkRegex, () => `<style>${cssSource}</style>`);
          inlinedCount += 1;
        }
      }
      if (inlinedCount > 0) {
        delete bundle[cssFileName];
      }
    },
  };
}

export default defineConfig({
  plugins: [cleanRouteMiddleware(), inlineSmallCssPlugin()],
  build: {
    target: 'es2022',
    minify: 'oxc',
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        speakers: resolve(import.meta.dirname, 'speakers.html'),
        memories: resolve(import.meta.dirname, 'memories.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/examples/jsm')) return 'gl-addons';
          if (id.includes('node_modules/three')) return 'gl-core';
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion-vendor';
          return undefined;
        },
      },
    },
  },
});
