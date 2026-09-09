import { defineConfig } from '@rsbuild/core';
import { pluginAssetsRetry } from '@rsbuild/plugin-assets-retry';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact(), pluginAssetsRetry()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  server: {
    port: Number(process.env.DEV_PORT) || 3001,
    open: true,
    // В dev запросы фронтенда идут на тот же путь /api/v1, что и в проде,
    // а прокси отдают локальный Express (server/, npm run dev там же).
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
  html: {
    template: './public/index.html',
    title: 'Мой бюджет',
  },
  splitChunks: {
    preset: 'default',
    cacheGroups: {
      reactQuery: {
        test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
        name: 'react-query',
        chunks: 'all',
        priority: 0,
        enforce: true,
      },
      jotai: {
        test: /[\\/]node_modules[\\/]jotai[\\/]/,
        name: 'jotai',
        chunks: 'all',
        priority: 0,
        enforce: true,
      },
    },
  },
});
