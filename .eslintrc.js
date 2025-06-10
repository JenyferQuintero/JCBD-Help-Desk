{
  "extends": [
    "react-app",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": ["jsx-a11y", "react-hooks"],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    // Reglas generales de ESLint
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always"
      }
    ],
    "no-param-reassign": [
      "error",
      {
        "props": true,
        "ignorePropertyModificationsFor": ["state"]
      }
    ],

    // Reglas de React
    "react/jsx-uses-react": "error",
    "react/react-in-jsx-scope": "error",
    "react/jsx-uses-vars": "error",
    "react/jsx-filename-extension": ["warn", { "extensions": [".js", ".jsx", ".tsx"] }],
    "react/jsx-props-no-spreading": "off",
    "react/function-component-definition": [
      "warn",
      {
        "namedComponents": "arrow-function",
        "unnamedComponents": "arrow-function"
      }
    ],
    "react/jsx-indent": ["error", 2],
    "react/jsx-indent-props": ["error", 2],
    "react/jsx-closing-bracket-location": ["error", "line-aligned"],
    "react/jsx-tag-spacing": ["error", {
      "closingSlash": "never",
      "beforeSelfClosing": "always",
      "afterOpening": "never",
      "beforeClosing": "never"
    }],
    "react/self-closing-comp": "error",
    "react/require-default-props": "warn",
    "react/no-unused-prop-types": "warn",
    "react/prefer-stateless-function": ["warn", {
      "ignorePureComponents": true
    }],
    "react/jsx-max-props-per-line": ["error", {
      "maximum": 1,
      "when": "multiline"
    }],
    "react/jsx-sort-props": ["warn", {
      "callbacksLast": true,
      "shorthandFirst": true,
      "ignoreCase": true
    }],
    "react/prop-types": "off",
    "react/display-name": "off",

    // Reglas de React Hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Reglas de accesibilidad (jsx-a11y)
    "jsx-a11y/alt-text": "warn",
    "jsx-a11y/anchor-is-valid": "warn",
    "jsx-a11y/label-has-associated-control": "warn",

    // Reglas de TypeScript (si usas TS)
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}