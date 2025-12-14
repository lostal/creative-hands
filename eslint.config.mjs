import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    // Ignorar carpetas de build y cliente (que tiene su propio eslint)
    { ignores: ["dist/", "client/", "coverage/", "node_modules/", "client/dist/"] },

    // Configuración base
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.node } },

    // Reglas recomendadas
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,

    // Reglas personalizadas para backend
    {
        rules: {
            "no-console": "warn", // Warn en console.log para evitar dejar logs de debug
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "caughtErrorsIgnorePattern": "^_"
                }
            ],
            "@typescript-eslint/no-explicit-any": "warn"
        }
    }
];
