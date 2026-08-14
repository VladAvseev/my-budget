import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginAssetsRetry } from '@rsbuild/plugin-assets-retry';
import { pluginReact } from '@rsbuild/plugin-react';

const { parsed: env } = loadEnv();

const runtimeEnvKeys = ['API_BASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];

const define = Object.fromEntries(
  runtimeEnvKeys.filter((key) => env[key] != null).flatMap((key) => [
    [`process.env.${key}`, JSON.stringify(env[key])],
    [`import.meta.env.${key}`, JSON.stringify(env[key])],
  ]),
);

export default defineConfig({
  plugins: [pluginReact(), pluginAssetsRetry()],
  source: {
    define,
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
  server: {
    port: Number(process.env.DEV_PORT) || 3001,
    open: true,
  },
  html: {
    template: './public/index.html',
    title: process.env.APP_TITLE || 'React rsbuild base',
  },
  splitChunks: {
    preset: 'default',
    cacheGroups: {
      supabase: {
        test: /[\\/]node_modules[\\/]@supabase[\\/]/,
        name: 'supabase',
        chunks: 'all',
        priority: 0,
        enforce: true,
      },
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
