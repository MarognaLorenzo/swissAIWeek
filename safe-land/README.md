# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

# SafeLand Risk Assessment

A React application for assessing flood and landslide risks for any location. Enter a location and get detailed risk information including risk scores and assessment descriptions.

## Features

- 🔍 Location-based search
- 🌊 Flood risk assessment (0-5 scale)
- 🏔️ Landslide risk assessment (0-5 scale)
- 📋 Detailed risk descriptions
- 📱 Responsive design
- ⚡ Real-time risk evaluation

## Tech Stack

- React 19.1.1
- TypeScript
- Vite
- CSS3 with modern design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

## Usage

1. Enter a location in the search bar (e.g., "Zurich", "Bern", "Geneva")
2. Click "Search" or press Enter
3. View the flood and landslide risk scores (0-5 scale)
4. Read the detailed assessment description

## Risk Scale

- **0.0 - 1.4**: Low Risk (Green)
- **1.5 - 2.9**: Moderate Risk (Yellow)
- **3.0 - 3.9**: High Risk (Orange)
- **4.0 - 5.0**: Very High Risk (Red)

## Backend Integration

Currently uses mock data for demonstration. To integrate with a real backend:

1. Replace the `fetchRiskData` function in `src/App.tsx`
2. Update the API endpoint to your backend service
3. Modify the `RiskData` interface if needed to match your API response

## Build for Production

```bash
npm run build
```

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
