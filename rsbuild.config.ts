import { defineConfig } from '@rsbuild/core';
import { pluginAssetsRetry } from '@rsbuild/plugin-assets-retry';
import { pluginReact } from '@rsbuild/plugin-react';
import CompressionPlugin from 'compression-webpack-plugin';

export default defineConfig({
  plugins: [pluginReact(), pluginAssetsRetry()],
  tools: {
    // В прод-сборке готовим .gz-версии текстовых ассетов заранее:
    // nginx (gzip_static) отдаёт их сразу, без сжатия на каждый запрос.
    rspack: (config, { isProd }) => {
      if (isProd) {
        config.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(?:js|css|html|svg)$/,
            threshold: 1024,
            minRatio: 0.8,
            deleteOriginalAssets: false,
          }),
        );
      }
      return config;
    },
  },
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
      '/api': 'https://my-finance.site',
    },
  },
  html: {
    template: './public/index.html',
    title: 'Мои финансы',
  },
  performance: {
    // В отчёте о размерах показываем только оригиналы:
    // их gzip-размер и так выводится в колонке Gzip
    printFileSize: {
      exclude: (asset) =>
        /\.(?:map|LICENSE\.txt|d\.(?:ts|mts|cts)|gz)$/.test(asset.name),
    },
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
