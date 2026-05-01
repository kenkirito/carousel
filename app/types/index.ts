// CarouselAI Types

export type Niche = 'tech' | 'doctor' | 'festival' | 'business' | 'personal-brand';
export type Tone = 'viral' | 'educational' | 'storytelling' | 'controversial';

export interface Slide {
  id: string;
  title: string;
  content: string;
  emoji: string;
  tag?: string;
}

export interface Profile {
  username: string;
  fullName: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  niche: string;
}

export interface CarouselTemplate {
  id: string;
  name: string;
  description: string;
  niche: Niche;
  style: {
    background: string;
    titleFont: string;
    bodyFont: string;
    titleColor: string;
    bodyColor: string;
    accentColor: string;
    decoration: 'minimal' | 'geometric' | 'gradient-blob' | 'noise' | 'mesh' | 'none';
  };
}

export interface NicheConfig {
  id: Niche;
  name: string;
  description: string;
  icon: string;
  defaultTemplate: string;
}

export interface ToneConfig {
  id: Tone;
  name: string;
  description: string;
  promptModifier: string;
}

export const NICHES: NicheConfig[] = [
  {
    id: 'tech',
    name: 'Tech & AI',
    description: 'Dark themes with neon accents for tech content',
    icon: '💻',
    defaultTemplate: 'tech-neon',
  },
  {
    id: 'doctor',
    name: 'Health & Medical',
    description: 'Clean white and blue for health tips',
    icon: '🏥',
    defaultTemplate: 'doctor-clean',
  },
  {
    id: 'festival',
    name: 'Festivals & Culture',
    description: 'Bright, colorful for celebrations',
    icon: '🎉',
    defaultTemplate: 'festival-bright',
  },
  {
    id: 'business',
    name: 'Business & Finance',
    description: 'Black and gold professional look',
    icon: '💼',
    defaultTemplate: 'business-luxe',
  },
  {
    id: 'personal-brand',
    name: 'Personal Branding',
    description: 'Modern gradients for personal growth',
    icon: '✨',
    defaultTemplate: 'personal-gradient',
  },
];

export const TONES: ToneConfig[] = [
  {
    id: 'viral',
    name: 'Viral',
    description: 'Attention-grabbing, punchy, designed to spread',
    promptModifier: 'Make it viral-worthy: use bold statements, curiosity gaps, and pattern interrupts. Write like you\'re exposing a secret.',
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Clear, structured, value-packed teaching',
    promptModifier: 'Focus on clear education: break down complex ideas simply. Use step-by-step explanations. Be the teacher who actually explains.',
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Narrative-driven, emotional, relatable',
    promptModifier: 'Use storytelling: frame as a journey with highs and lows. Make it personal and relatable. Show, don\'t just tell.',
  },
  {
    id: 'controversial',
    name: 'Controversial',
    description: 'Challenges norms, sparks debate',
    promptModifier: 'Be provocative: challenge conventional wisdom. Say what others won\'t. Create healthy controversy. Make people stop and think.',
  },
];

// Templates organized by niche
export const NICHE_TEMPLATES: Record<Niche, CarouselTemplate[]> = {
  tech: [
    {
      id: 'tech-neon',
      name: 'Neon Dark',
      description: 'Dark background with neon accents',
      niche: 'tech',
      style: {
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        titleFont: 'system-ui, -apple-system, sans-serif',
        bodyFont: 'system-ui, -apple-system, sans-serif',
        titleColor: '#00f5ff',
        bodyColor: '#e2e8f0',
        accentColor: '#ff00ff',
        decoration: 'mesh',
      },
    },
    {
      id: 'tech-cyber',
      name: 'Cyber Grid',
      description: 'Matrix-inspired green on black',
      niche: 'tech',
      style: {
        background: 'linear-gradient(145deg, #0d1117 0%, #161b22 100%)',
        titleFont: 'system-ui, sans-serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#39d353',
        bodyColor: '#8b949e',
        accentColor: '#39d353',
        decoration: 'geometric',
      },
    },
    {
      id: 'tech-purple',
      name: 'Deep Purple',
      description: 'Rich purple gradient',
      niche: 'tech',
      style: {
        background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 50%, #1a0b2e 100%)',
        titleFont: 'system-ui, sans-serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#c084fc',
        bodyColor: '#ddd6fe',
        accentColor: '#a855f7',
        decoration: 'gradient-blob',
      },
    },
  ],
  doctor: [
    {
      id: 'doctor-clean',
      name: 'Clean Blue',
      description: 'Professional white and blue',
      niche: 'doctor',
      style: {
        background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)',
        titleFont: 'Georgia, serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#0369a1',
        bodyColor: '#475569',
        accentColor: '#0ea5e9',
        decoration: 'minimal',
      },
    },
    {
      id: 'doctor-medical',
      name: 'Medical Cross',
      description: 'Trust-inspiring medical theme',
      niche: 'doctor',
      style: {
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        titleFont: 'system-ui, sans-serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#0c4a6e',
        bodyColor: '#334155',
        accentColor: '#0284c7',
        decoration: 'minimal',
      },
    },
  ],
  festival: [
    {
      id: 'festival-bright',
      name: 'Celebration',
      description: 'Vibrant festival colors',
      niche: 'festival',
      style: {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)',
        titleFont: 'Georgia, serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#2d3436',
        bodyColor: '#2d3436',
        accentColor: '#ffffff',
        decoration: 'gradient-blob',
      },
    },
    {
      id: 'festival-diwali',
      name: 'Diwali Lights',
      description: 'Warm golds and oranges',
      niche: 'festival',
      style: {
        background: 'linear-gradient(135deg, #1a0a00 0%, #4a1a00 50%, #8b4513 100%)',
        titleFont: 'Georgia, serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#ffd700',
        bodyColor: '#ffec8b',
        accentColor: '#ff8c00',
        decoration: 'gradient-blob',
      },
    },
    {
      id: 'festival-holi',
      name: 'Holi Splash',
      description: 'Colorful powder explosion feel',
      niche: 'festival',
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%)',
        titleFont: 'system-ui, sans-serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#ffffff',
        bodyColor: '#fef3c7',
        accentColor: '#fcd34d',
        decoration: 'gradient-blob',
      },
    },
  ],
  business: [
    {
      id: 'business-luxe',
      name: 'Black Gold',
      description: 'Premium black and gold',
      niche: 'business',
      style: {
        background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
        titleFont: 'Georgia, serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#ffd700',
        bodyColor: '#d4d4d4',
        accentColor: '#daa520',
        decoration: 'minimal',
      },
    },
    {
      id: 'business-navy',
      name: 'Executive Navy',
      description: 'Professional navy and silver',
      niche: 'business',
      style: {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        titleFont: 'Georgia, serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        accentColor: '#94a3b8',
        decoration: 'minimal',
      },
    },
  ],
  'personal-brand': [
    {
      id: 'personal-gradient',
      name: 'Sunset Vibes',
      description: 'Warm personal branding',
      niche: 'personal-brand',
      style: {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
        titleFont: 'Georgia, serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#2d3436',
        bodyColor: '#2d3436',
        accentColor: '#ffffff',
        decoration: 'gradient-blob',
      },
    },
    {
      id: 'personal-cream',
      name: 'Soft Cream',
      description: 'Gentle, approachable aesthetic',
      niche: 'personal-brand',
      style: {
        background: 'linear-gradient(135deg, #faf3e0 0%, #f5e6d3 50%, #faf3e0 100%)',
        titleFont: 'Georgia, serif',
        bodyFont: 'system-ui, sans-serif',
        titleColor: '#4a4a4a',
        bodyColor: '#6b6b6b',
        accentColor: '#d4a574',
        decoration: 'minimal',
      },
    },
  ],
};

// Get all templates as flat array for backwards compatibility
export const ALL_TEMPLATES = Object.values(NICHE_TEMPLATES).flat();
