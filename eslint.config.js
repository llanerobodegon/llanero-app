// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Las Edge Functions de Supabase son Deno, no parte de la app.
    ignores: ['dist/*', 'supabase/functions/*'],
  },
]);
