# CarouselAI

An AI-powered tool to generate high-converting Instagram carousel posts for different niches including Tech, Health/Medical, Festivals, Business, and Personal Branding.

![CarouselAI](https://img.shields.io/badge/CarouselAI-AI%20Powered-orange)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

### Core Features
- **AI Content Generation**: Uses Claude API to generate hook-first carousel content
- **Niche-Specific Themes**: 5 niches with multiple templates each
  - Tech & AI (Dark + Neon themes)
  - Health & Medical (Clean white + blue)
  - Festivals & Culture (Bright + colorful)
  - Business & Finance (Black + Gold)
  - Personal Branding (Modern gradients)
- **Tone Selection**: Viral, Educational, Storytelling, Controversial
- **Editable Slides**: Edit any slide's title, content, and emoji
- **Drag & Drop Reordering**: Reorder slides with smooth drag-and-drop
- **HD Export**: Download slides as PNG images (1080x1080)
- **Watermark**: "Made with CarouselAI" branding on exports
- **Export Limits**: Free tier limited to 5 exports/day

### Content Structure
1. **Slide 1 (Hook)**: Bold, curiosity-driven, max 8 words
2. **Slides 2-6 (Value)**: Clear, concise points, one idea per slide
3. **Slide 7 (CTA)**: Follow, Save, Comment hooks

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui compatible
- **Animation**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Image Export**: html2canvas
- **AI**: Anthropic Claude API

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd carousel-gen
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:
```bash
npm run build
```

The static export will be in the `dist` folder.

### Deployment

This app is configured for static export. You can deploy to:
- **Vercel**: Connect your GitHub repo and deploy
- **Netlify**: Drag and drop the `dist` folder
- **Any static host**: Upload the `dist` folder contents

## Project Structure

```
carousel-gen/
├── app/
│   ├── api/
│   │   └── generate/        # AI generation API route
│   │       └── route.ts
│   ├── components/
│   │   └── CarouselAI.tsx   # Main application component
│   ├── types/
│   │   └── index.ts         # TypeScript types and configurations
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── public/                  # Static assets
├── dist/                    # Build output
├── next.config.ts           # Next.js configuration
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

### AI Generation Flow
1. User inputs topic, selects niche and tone
2. API constructs optimized prompt for Claude
3. AI generates structured content (Hook → Value → CTA)
4. Content returned as JSON with slide data

### Slide Structure
Each slide contains:
- `id`: Unique identifier
- `title`: Slide heading (3-8 words for hook)
- `content`: Body text with line breaks
- `emoji`: Visual indicator

### Theme System
Themes are defined by niche in `types/index.ts`:
```typescript
NICHE_TEMPLATES: Record<Niche, CarouselTemplate[]>
```

Each template specifies:
- Background gradient/colors
- Title and body fonts
- Title, body, and accent colors
- Decoration style

## Customization

### Adding New Niches
1. Add niche to `NICHES` array in `types/index.ts`
2. Add templates to `NICHE_TEMPLATES` record
3. Update API prompt if needed

### Adding New Templates
1. Define template in `NICHE_TEMPLATES[niche]`
2. Specify colors, fonts, and decoration
3. Template will automatically appear in selector

### Modifying AI Prompts
Edit the `buildPrompt()` function in `app/api/generate/route.ts` to customize content generation.

## Growth Features

- **Watermark**: "Made with CarouselAI" appears on all exported images
- **Export Limits**: Counter tracks usage, upgrade prompt at limit
- **Shareability**: Optimized 1080x1080 format for Instagram

## Phase 2 Roadmap

- [ ] Auto emoji suggestions
- [ ] Hashtag generator
- [ ] Caption generator
- [ ] Viral score prediction
- [ ] Save drafts locally
- [ ] Templates marketplace
- [ ] Premium subscription tier

## License

MIT License - feel free to use for personal or commercial projects.

---

Built with Next.js, Tailwind CSS, and Claude AI.
