# Installation Guide

## Quick Start

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

Visit http://localhost:3000

## Required Dependencies

All dependencies are listed in `package.json`. Key packages:

- `next` - React framework
- `react` & `react-dom` - React library
- `gsap` - Animation library for spiral effects
- `framer-motion` - Motion animations
- `@paper-design/shaders-react` - Shader effects (if not available, fallback is provided)
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `typescript` - Type safety

## Note on @paper-design/shaders-react

If the `@paper-design/shaders-react` package is not available on npm, you can:

1. Use the fallback components in `components/ui/shaders-fallback.tsx`
2. Update the import in `components/ui/shaders-hero-section.tsx` to use fallbacks:
   ```tsx
   // Replace this:
   import { PulsingBorder, MeshGradient } from "@paper-design/shaders-react"
   
   // With this:
   import { PulsingBorder, MeshGradient } from "@/components/ui/shaders-fallback"
   ```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   └── ui/                 # UI components
│       ├── spiral-animation.tsx
│       ├── shaders-hero-section.tsx
│       ├── ruixen-hero-section-02.tsx
│       ├── button.tsx
│       ├── dot-pattern.tsx
│       └── shaders-fallback.tsx
├── lib/
│   └── utils.ts            # Utility functions
└── package.json
```

## Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Module not found errors
- Make sure all dependencies are installed: `npm install`
- Clear `.next` folder and reinstall: `rm -rf .next node_modules && npm install`

### Shader components not working
- Check if `@paper-design/shaders-react` is installed
- If not, use the fallback components (see note above)

### TypeScript errors
- Run `npm install` to ensure all type definitions are installed
- Check `tsconfig.json` configuration



