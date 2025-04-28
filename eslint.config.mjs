import globals from "globals";
import angularEslintTemplate from "@angular-eslint/eslint-plugin-template";
import parser from "@angular-eslint/template-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    {
        ignores: ["nginx/**/*", '**/eslint.config.mjs', "apps/common-lib/.storybook/main.ts", "apps/clients/*", ".angular/*"],
    },
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                document: true,
                window: true,
            },
            ecmaVersion: 5,
            sourceType: "commonjs",
            parserOptions: {
                project: "tsconfig.json",
                tsconfigRootDir: __dirname,
            },
        },
    },
    ...compat.extends("plugin:storybook/recommended").map(config => ({
        ...config,
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                document: true,
                window: true,
            },
        },
    })),
    ...compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates"
    ).map(config => ({
        ...config,
        files: ["**/*.ts"],
    })),
    {
        files: ["**/*.ts"],

        languageOptions: {
            sourceType: "script",
            parserOptions: {
                project: true,
                createDefaultProgram: true,
                tsconfigRootDir: __dirname,
            },
        },

        rules: {
            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    "selector": "method",
                    "format": ["camelCase"],
                    "leadingUnderscore": "allow"
                  }

            ],
            "@angular-eslint/prefer-standalone": "off",

            "no-irregular-whitespace": ["error", {
                skipComments: true,
            }],

            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", {
              args: "all",
              caughtErrors: "all",
              ignoreRestSiblings: true,
              argsIgnorePattern: "^_",
            }],
        },
    },
    ...compat.extends("plugin:@angular-eslint/template/recommended").map(config => ({
        ...config,
        files: ["**/*.html"],
    })),
    {
        files: ["**/*.html"],
        plugins: {
            "@angular-eslint/template": angularEslintTemplate,
        },

        languageOptions: {
            parser: parser,
        },

        rules: {
            "@angular-eslint/template/prefer-self-closing-tags": "error",
            "@angular-eslint/template/prefer-control-flow": "warn"
        },
    },
    {
        files: ["**/*.html"],
        rules: {
            "@typescript-eslint/ban-ts-comment": "off",
        }
    }

];
