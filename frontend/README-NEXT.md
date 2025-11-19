# Hackathon Discovery - Next.js Frontend

Modern React + Next.js frontend with minimalist black design, featuring spiral animations and shader effects.

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   └── ui/
│       ├── spiral-animation.tsx      # Spiral entrance animation
│       ├── shaders-hero-section.tsx  # Shader background hero
│       ├── ruixen-hero-section-02.tsx # Main hero section
│       ├── button.tsx                # Button component
│       └── dot-pattern.tsx           # Dot pattern background
├── lib/
│   └── utils.ts            # Utility functions
└── package.json
```

## Key Dependencies

- **Next.js 14** - React framework
- **GSAP** - Animation library for spiral effects
- **Framer Motion** - Motion library for UI animations
- **@paper-design/shaders-react** - Shader effects
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Features

- **Spiral Animation Entrance** - Mysterious black spiral animation on load
- **Shader Background** - Dynamic mesh gradient backgrounds
- **Minimalist Design** - Black theme with white accents
- **Responsive** - Mobile-first design
- **TypeScript** - Full type safety

## Styling

The design follows a minimalist black aesthetic:
- Background: Pure black (#000000)
- Text: White with varying opacity
- Accents: Subtle white gradients and glows
- Animations: Smooth, mysterious transitions

## Notes

- The spiral animation plays on initial page load
- Click "Enter" to proceed to main content
- All components are optimized for performance
- Shader effects require WebGL support



