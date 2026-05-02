// Advanced Content Engine v2 - High-Quality Carousel Generation
// Follows strict rules: max 8 words headline, max 12 words subtext, no fluff

import { Niche, Tone } from '@/app/types';

export interface SlideContent {
  headline: string;
  subtext: string;
  emoji: string;
}

interface NicheIntelligence {
  keywords: string[];
  painPoints: string[];
  commonMyths: string[];
  powerWords: string[];
  examples: string[];
}

const NICHE_INTEL: Record<Niche, NicheIntelligence> = {
  tech: {
    keywords: ['AI', 'automation', 'code', 'startup', 'SaaS', 'API', 'workflow', 'stack'],
    painPoints: ['tutorial hell', 'shiny object syndrome', 'imposter syndrome', 'burnout', 'tech debt'],
    commonMyths: ['you need to know everything', 'more tools = better results', 'coding is only for geniuses'],
    powerWords: ['ship', 'deploy', 'scale', 'iterate', 'build', 'debug', 'optimize'],
    examples: ['Notion', 'Figma', 'Vercel', 'GitHub', 'ChatGPT', 'Claude'],
  },
  doctor: {
    keywords: ['prevention', 'longevity', 'metabolism', 'immunity', 'recovery', 'sleep', 'stress'],
    painPoints: ['chronic fatigue', 'poor sleep', 'brain fog', 'inflammation', 'burnout'],
    commonMyths: ['supplements replace diet', 'cardio is best for fat loss', 'age means decline'],
    powerWords: ['heal', 'prevent', 'optimize', 'balance', 'restore', 'boost'],
    examples: ['intermittent fasting', 'cold therapy', 'zone 2 cardio', 'protein timing'],
  },
  festival: {
    keywords: ['tradition', 'celebration', 'family', 'culture', 'ritual', 'gathering'],
    painPoints: ['family pressure', 'budget stress', 'travel chaos', 'gift anxiety'],
    commonMyths: ['expensive = meaningful', 'traditions cannot change', 'bigger is better'],
    powerWords: ['honor', 'gather', 'celebrate', 'connect', 'remember', 'share'],
    examples: ['handmade gifts', 'virtual gatherings', 'minimal decor', 'experience gifts'],
  },
  business: {
    keywords: ['revenue', 'profit', 'cash flow', 'LTV', 'CAC', 'scaling', 'systems'],
    painPoints: ['cash flow gaps', 'hiring mistakes', 'feature creep', 'shiny object syndrome'],
    commonMyths: ['revenue = profit', 'more hours = more success', 'funding is necessary'],
    powerWords: ['scale', 'profit', 'optimize', 'automate', 'delegate', 'systematize'],
    examples: ['subscription models', 'remote teams', 'no-code tools', 'micro-SaaS'],
  },
  'personal-brand': {
    keywords: ['audience', 'content', 'engagement', 'authority', 'niche', 'monetization'],
    painPoints: ['algorithm changes', 'creator burnout', 'imposter syndrome', 'consistency'],
    commonMyths: ['you need millions of followers', 'viral = valuable', 'posting more = growth'],
    powerWords: ['grow', 'engage', 'monetize', 'authority', 'influence', 'connect'],
    examples: ['newsletter writers', 'LinkedIn creators', 'YouTube educators', 'Twitter threads'],
  },
};

const TONE_PATTERNS: Record<Tone, { style: string; words: string[]; sentenceStyle: string }> = {
  viral: {
    style: 'Bold, punchy, curiosity-driven',
    words: ['secret', 'truth', 'nobody', 'mistake', 'wrong', 'actually', 'real'],
    sentenceStyle: 'Short sentences. Direct statements. Pattern interrupts.',
  },
  educational: {
    style: 'Clear, structured, evidence-based',
    words: ['research', 'study', 'data', 'shows', 'evidence', 'proven', 'science'],
    sentenceStyle: 'Informative. Structured. Practical takeaways.',
  },
  storytelling: {
    style: 'Conversational, relatable, narrative',
    words: ['I learned', 'discovered', 'realized', 'journey', 'experience', 'story'],
    sentenceStyle: 'Personal voice. Relatable experiences. Lessons learned.',
  },
  controversial: {
    style: 'Provocative, challenging, contrarian',
    words: ['unpopular', 'controversial', 'wrong', 'lie', 'myth', 'truth'],
    sentenceStyle: 'Bold claims. Challenges norms. Strong opinions.',
  },
};

// Generate insights based on topic and niche
function generateInsights(topic: string, niche: Niche, count: number): string[] {
  const intel = NICHE_INTEL[niche];
  const normalizedTopic = topic.toLowerCase();

  // Core insight templates - short and punchy (max 20 words total for headline + subtext)
  const insightTemplates = [
    // Myth-busting insights (headline max 8 words, subtext max 12 words)
    `${intel.commonMyths[0]}|Stop believing this myth about ${normalizedTopic}`,
    `The ${intel.painPoints[0]} problem is real|Fix it with one simple change`,
    `You do not need more ${intel.keywords[0]}|Focus on systems that actually work`,

    // Action-oriented insights
    `Start with ${intel.keywords[1]} first|Master this before anything else matters`,
    `The 80/20 rule applies here|20%% effort drives 80%% of results`,
    `Stop overcomplicating your ${normalizedTopic}|Do less, but do it better`,

    // Mindset insights
    `${normalizedTopic} is a skill|Built through daily practice, not born talent`,
    `Consistency beats intensity every time|Small daily actions compound into massive results`,
    `Top performers focus on ${intel.keywords[2]}|Ignore the shiny distractions around you`,

    // Practical insights
    `Stop learning, start doing now|Execution beats theory every single time`,
    `Perfectionism kills all progress|Ship before you feel ready today`,
    `Your environment determines your success|Willpower alone will never be enough`,

    // Advanced insights
    `${intel.examples[0]} changed everything|See how it applies to your approach`,
    `Level up by letting go|Release habits that no longer serve you`,
    `Master ${intel.keywords[3]} first|Ignore everything else until you do`,
  ];

  // Shuffle and take required number
  return insightTemplates
    .sort(() => 0.5 - Math.random())
    .slice(0, count - 2); // -2 for hook and CTA
}

// Convert insight into headline (max 8 words) and subtext (max 12 words)
function formatSlide(insight: string, index: number, tone: Tone): SlideContent {
  // Split by pipe delimiter: headline|subtext
  const parts = insight.split('|');
  let headline = parts[0]?.trim() || 'Key Insight';
  let subtext = parts[1]?.trim() || 'Apply this to see results';

  // Enforce max 8 words for headline
  const headlineWords = headline.split(' ');
  if (headlineWords.length > 8) {
    headline = headlineWords.slice(0, 8).join(' ');
  }
  // Enforce max 40 chars for safety
  if (headline.length > 45) {
    headline = headline.substring(0, 45).split(' ').slice(0, -1).join(' ');
  }

  // Enforce max 12 words for subtext
  const subtextWords = subtext.split(' ');
  if (subtextWords.length > 12) {
    subtext = subtextWords.slice(0, 12).join(' ');
  }
  // Enforce max 60 chars for safety
  if (subtext.length > 65) {
    subtext = subtext.substring(0, 65).split(' ').slice(0, -1).join(' ');
  }

  // Ensure no trailing periods on headline
  headline = headline.replace(/\.$/, '');

  // Select emoji based on content sentiment
  const emojis = ['💡', '⚡', '🎯', '🚀', '💎', '🔥', '✨', '⚠️', '🤯', '📈'];
  const emoji = emojis[index % emojis.length];

  return { headline, subtext, emoji };
}

// Generate hook slide
function generateHook(topic: string, niche: Niche, tone: Tone): SlideContent {
  const intel = NICHE_INTEL[niche];
  const hooks: Record<Tone, string[]> = {
    viral: [
      `The ${topic} secret nobody shares`,
      `Stop doing ${topic} the wrong way`,
      `What 90%% get wrong about ${topic}`,
      `${topic} myths waste your time`,
      `I tested ${topic} for 100 hours`,
    ],
    educational: [
      `The science behind ${topic} success`,
      `How ${topic} actually works`,
      `${topic}: Evidence-based approach`,
      `Research-backed ${topic} strategies`,
      `Understanding ${topic} fundamentals`,
    ],
    storytelling: [
      `How I mastered ${topic}`,
      `My ${topic} transformation journey`,
      `${topic} lessons learned hard way`,
      `From ${intel.painPoints[0]} to ${topic} expert`,
      `What ${topic} taught me`,
    ],
    controversial: [
      `Unpopular opinion: ${topic} advice is wrong`,
      `${topic} hype is misleading you`,
      `Stop believing ${topic} myths`,
      `The uncomfortable truth about ${topic}`,
      `${topic} industry does not want this known`,
    ],
  };

  const hookList = hooks[tone] || hooks.viral;
  const headline = hookList[Math.floor(Math.random() * hookList.length)];

  const subtexts = [
    'Swipe to see what actually works 👇',
    'Here is what I discovered 👇',
    'Save this before it is gone 👇',
    'This changes everything 👇',
    'Thread 🧵👇',
  ];

  return {
    headline,
    subtext: subtexts[Math.floor(Math.random() * subtexts.length)],
    emoji: '🔥',
  };
}

// Generate CTA slide
function generateCTA(topic: string, handle: string, tone: Tone): SlideContent {
  const ctas: Record<Tone, SlideContent[]> = {
    viral: [
      { headline: 'Which tip hit hardest?', subtext: `Follow @${handle} for more 🔥`, emoji: '👇' },
      { headline: 'Save this thread', subtext: `Follow @${handle} before it is gone 💾`, emoji: '💾' },
    ],
    educational: [
      { headline: 'Want more insights?', subtext: `Follow @${handle} for weekly research 📚`, emoji: '📚' },
      { headline: 'Questions? Drop them below', subtext: `I reply to every comment 👇`, emoji: '💬' },
    ],
    storytelling: [
      { headline: 'Part 2 tomorrow', subtext: `Follow @${handle} so you do not miss it 🔔`, emoji: '🔔' },
      { headline: 'Share your story below', subtext: `I read every reply 💙`, emoji: '💙' },
    ],
    controversial: [
      { headline: 'Agree or disagree?', subtext: `Comment below. Let us discuss 👇`, emoji: '⚡' },
      { headline: 'Share if you dare', subtext: `Follow @${handle} for unpopular opinions 🔥`, emoji: '📤' },
    ],
  };

  const ctaList = ctas[tone] || ctas.viral;
  return ctaList[Math.floor(Math.random() * ctaList.length)];
}

// Main generation function
export function generateCarouselV2(
  topic: string,
  niche: Niche,
  tone: Tone,
  handle: string,
  slideCount: number
): SlideContent[] {
  const slides: SlideContent[] = [];

  // Slide 1: Hook
  slides.push(generateHook(topic, niche, tone));

  // Generate unique insights
  const insights = generateInsights(topic, niche, slideCount);

  // Slides 2 to slideCount-1: Value slides
  for (let i = 0; i < slideCount - 2 && i < insights.length; i++) {
    slides.push(formatSlide(insights[i], i, tone));
  }

  // Fill remaining slots if needed
  while (slides.length < slideCount - 1) {
    const fillerIndex = slides.length - 1;
    slides.push({
      headline: `Pro tip #${fillerIndex}`,
      subtext: 'Small improvements compound over time. Start today.',
      emoji: '💎',
    });
  }

  // Final slide: CTA
  slides.push(generateCTA(topic, handle, tone));

  return slides;
}

// Validation
export function validateCarousel(slides: SlideContent[]): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for duplicates
  const headlines = slides.map(s => s.headline.toLowerCase());
  const uniqueHeadlines = new Set(headlines);
  if (uniqueHeadlines.size !== headlines.length) {
    issues.push('Duplicate headlines detected');
  }

  // Check word counts
  slides.forEach((slide, i) => {
    const headlineWords = slide.headline.split(' ').length;
    const subtextWords = slide.subtext.split(' ').length;

    if (headlineWords > 8) {
      issues.push(`Slide ${i + 1}: Headline too long (${headlineWords} words)`);
    }
    if (subtextWords > 12) {
      issues.push(`Slide ${i + 1}: Subtext too long (${subtextWords} words)`);
    }
  });

  // Check for generic phrases
  const genericPhrases = ['unlock potential', 'game changer', 'skyrocket', 'secret sauce'];
  const allText = slides.map(s => `${s.headline} ${s.subtext}`).join(' ').toLowerCase();
  genericPhrases.forEach(phrase => {
    if (allText.includes(phrase)) {
      issues.push(`Generic phrase detected: "${phrase}"`);
    }
  });

  return { valid: issues.length === 0, issues };
}
