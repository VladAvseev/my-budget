import { defineConfig } from '@rsbuild/core';
import { pluginAssetsRetry } from '@rsbuild/plugin-assets-retry';
import { pluginReact } from '@rsbuild/plugin-react';
import CompressionPlugin from 'compression-webpack-plugin';

export default defineConfig({
  plugins: [pluginReact(), pluginAssetsRetry()],
  tools: {
    // .gz заранее: nginx gzip_static отдаёт без сжатия на запрос.
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
    // Dev-прокси /api → локальный Express (DEV_API_URL, по умолчанию localhost:5001).
    proxy: {
      '/api': process.env.DEV_API_URL || 'http://localhost:5001',
    },
  },
  html: {
    template: './public/index.html',
    title: 'Мои финансы',
  },
  performance: {
    // В отчёте размеров — только оригиналы (gzip виден в колонке Gzip).
    printFileSize: {
      exclude: (asset) => /\.(?:map|LICENSE\.txt|d\.(?:ts|mts|cts)|gz)$/.test(asset.name),
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
