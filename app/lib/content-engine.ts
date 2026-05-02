// Dynamic Content Engine for CarouselAI
// Multi-layer system for generating unique, context-aware content

import { Niche, Tone } from '@/app/types';

// ============================================================================
// LAYER 1: INPUT ENRICHMENT
// ============================================================================

interface EnrichedInput {
  topic: string;
  expandedTopics: string[];
  useCases: string[];
  problemsSolved: string[];
  misconceptions: string[];
  trends: string[];
  targetAudience: string;
  painPoints: string[];
}

export function enrichInput(topic: string, niche: Niche): EnrichedInput {
  const expansions = getTopicExpansions(topic, niche);

  return {
    topic,
    expandedTopics: expansions.expanded,
    useCases: expansions.useCases,
    problemsSolved: expansions.problems,
    misconceptions: expansions.misconceptions,
    trends: expansions.trends,
    targetAudience: expansions.audience,
    painPoints: expansions.painPoints,
  };
}

function getTopicExpansions(topic: string, niche: Niche) {
  const baseExpansions: Record<Niche, any> = {
    tech: {
      expanded: [`${topic} tools`, `${topic} techniques`, `${topic} trends 2025`],
      useCases: ['Automation', 'Productivity boost', 'Learning acceleration', 'Side hustle'],
      problems: ['Outdated methods', 'Information overload', 'Tool confusion', 'Analysis paralysis'],
      misconceptions: ['It replaces humans', 'It\'s too complex', 'It\'s expensive', 'It\'s just hype'],
      trends: ['AI integration', 'No-code tools', 'Remote work tools', 'Privacy-first'],
      audience: 'Tech-savvy professionals and early adopters',
      painPoints: ['Staying updated', 'Tool fatigue', 'Learning curve', 'Integration issues'],
    },
    doctor: {
      expanded: [`${topic} symptoms`, `${topic} prevention`, `${topic} facts`],
      useCases: ['Daily wellness', 'Preventive care', 'Patient education', 'Myth busting'],
      problems: ['Misinformation', 'Delayed care', 'Self-diagnosis', 'Ignoring symptoms'],
      misconceptions: ['Home remedies cure everything', 'Symptoms are normal', 'Young people are immune', 'Medicines are harmful'],
      trends: ['Telemedicine', 'Preventive healthcare', 'Mental wellness', 'Personalized medicine'],
      audience: 'Health-conscious individuals and patients',
      painPoints: ['Conflicting advice', 'Long wait times', 'Medical costs', 'Health anxiety'],
    },
    festival: {
      expanded: [`${topic} traditions`, `${topic} recipes`, `${topic} celebrations`],
      useCases: ['Family gatherings', 'Cultural education', 'Social sharing', 'Gift ideas'],
      problems: ['Lost traditions', 'Commercialization', 'Distance from family', 'Budget constraints'],
      misconceptions: ['It\'s only for religious people', 'Modern celebrations lose meaning', 'Expensive gifts required', 'Old traditions are outdated'],
      trends: ['Sustainable celebrations', 'Virtual gatherings', 'DIY decorations', 'Fusion traditions'],
      audience: 'Cultural enthusiasts and families',
      painPoints: ['Time management', 'Budget planning', 'Family expectations', 'Travel logistics'],
    },
    business: {
      expanded: [`${topic} strategies`, `${topic} growth`, `${topic} mistakes`],
      useCases: ['Revenue growth', 'Cost reduction', 'Team scaling', 'Market expansion'],
      problems: ['Cash flow', 'Customer acquisition', 'Talent retention', 'Market competition'],
      misconceptions: ['More hours = more success', 'You need funding to start', 'One big client is enough', 'Copy competitors'],
      trends: ['AI automation', 'Remote teams', 'Sustainability', 'Creator economy'],
      audience: 'Entrepreneurs and business leaders',
      painPoints: ['Scaling challenges', 'Decision fatigue', 'Resource constraints', 'Market uncertainty'],
    },
    'personal-brand': {
      expanded: [`${topic} growth`, `${topic} content`, `${topic} strategy`],
      useCases: ['Career advancement', 'Thought leadership', 'Side income', 'Networking'],
      problems: ['Imposter syndrome', 'Content consistency', 'Algorithm changes', 'Engagement drops'],
      misconceptions: ['You need millions of followers', 'It\'s too late to start', 'Posting more = better', 'Copy successful creators'],
      trends: ['Micro-communities', 'Authentic content', 'Multi-platform', 'Video-first'],
      audience: 'Aspiring creators and professionals',
      painPoints: ['Time management', 'Content ideas', 'Algorithm anxiety', 'Comparison trap'],
    },
  };

  return baseExpansions[niche];
}

// ============================================================================
// LAYER 2: CONTEXT INJECTION - Dynamic Data Sources
// ============================================================================

interface DynamicContext {
  trendingTopics: string[];
  statistics: string[];
  quotes: string[];
  insights: string[];
  examples: string[];
  recentNews: string[];
}

export async function fetchDynamicContext(niche: Niche): Promise<DynamicContext> {
  // In production, these would be real API calls
  // For now, using curated rotating datasets
  return {
    trendingTopics: getTrendingTopics(niche),
    statistics: getStatistics(niche),
    quotes: getQuotes(niche),
    insights: getInsights(niche),
    examples: getExamples(niche),
    recentNews: getRecentNews(niche),
  };
}

function getTrendingTopics(niche: Niche): string[] {
  const trends: Record<Niche, string[]> = {
    tech: ['AI agents', 'Claude 4', 'Local LLMs', 'Vibe coding', 'AI-powered IDEs', 'Agentic workflows'],
    doctor: ['Longevity science', 'Gut-brain connection', 'Sleep optimization', 'Wearable health tech', 'Microbiome health'],
    festival: ['Sustainable gifts', 'Virtual celebrations', 'Cultural fusion', 'DIY traditions', 'Experience-based gifting'],
    business: ['Revenue-based financing', 'AI operations', 'Micro-SaaS', 'Community-led growth', 'Creator economy'],
    'personal-brand': ['Authentic storytelling', 'Niche communities', 'Newsletter renaissance', 'Video podcasts', 'Micro-content'],
  };
  return getRandomItems(trends[niche], 3);
}

function getStatistics(niche: Niche): string[] {
  const stats: Record<Niche, string[]> = {
    tech: ['73% of developers use AI daily', 'AI market to reach $407B by 2027', '92% of companies investing in AI'],
    doctor: ['80% of diseases are preventable', '7-9 hours sleep improves performance by 30%', 'Walking 8k steps reduces mortality by 51%'],
    festival: ['67% prefer experiences over gifts', 'Sustainable celebrations up 45%', 'Virtual gatherings increased 300%'],
    business: ['90% of startups fail within 5 years', 'Customer retention costs 5x less', 'Remote teams are 20% more productive'],
    'personal-brand': ['Creators earn $10B+ annually', 'Micro-influencers have 60% higher engagement', 'Personal branding increases income by 20%'],
  };
  return getRandomItems(stats[niche], 2);
}

function getQuotes(niche: Niche): string[] {
  const quotes: Record<Niche, string[]> = {
    tech: ['"Software is eating the world" - Marc Andreessen', '"AI is the new electricity" - Andrew Ng'],
    doctor: ['"Prevention is better than cure" - Desiderius Erasmus', '"Let food be thy medicine" - Hippocrates'],
    festival: ['"The more you praise and celebrate your life, the more there is in life to celebrate" - Oprah Winfrey'],
    business: ['"Revenue is vanity, profit is sanity" - Unknown', '"Your network is your net worth" - Porter Gale'],
    'personal-brand': ['"Your personal brand is what people say about you when you leave the room" - Jeff Bezos'],
  };
  return getRandomItems(quotes[niche], 1);
}

function getInsights(niche: Niche): string[] {
  const insights: Record<Niche, string[]> = {
    tech: ['The best tool is the one you actually use', 'Automation amplifies intent, not replaces it', 'Learning curves are temporary, skills are forever'],
    doctor: ['Small daily habits compound into lifelong health', 'Mental health is physical health', 'Prevention costs less than treatment'],
    festival: ['Traditions evolve but values remain', 'Presence matters more than presents', 'Cultural bridges build understanding'],
    business: ['Cash flow is more important than revenue', 'Your first customer teaches more than any book', 'Speed of execution beats perfect planning'],
    'personal-brand': ['Consistency beats virality', 'Your story is your differentiator', 'Community over audience'],
  };
  return getRandomItems(insights[niche], 3);
}

function getExamples(niche: Niche): string[] {
  const examples: Record<Niche, string[]> = {
    tech: ['Notion AI revolutionizing docs', 'Claude coding entire apps', 'Midjourney changing design'],
    doctor: ['Intermittent fasting protocols', 'Cold plunge benefits', 'Sleep hygiene optimization'],
    festival: ['Eco-friendly Diwali celebrations', 'Virtual family reunions', 'Cultural recipe exchanges'],
    business: ['Bootstrapped $1M ARR stories', 'Remote-first unicorns', 'Community-led product launches'],
    'personal-brand': ['Newsletter writers earning 6 figures', 'LinkedIn creators getting hired', 'YouTubers building empires'],
  };
  return getRandomItems(examples[niche], 2);
}

function getRecentNews(niche: Niche): string[] {
  // Simulated recent news - in production, fetch from news APIs
  const news: Record<Niche, string[]> = {
    tech: ['Major AI model releases', 'New startup funding rounds', 'Breakthrough research papers'],
    doctor: ['New health study findings', 'Medical technology advances', 'Public health updates'],
    festival: ['Cultural celebration trends', 'Festival tourism growth', 'Traditional craft revival'],
    business: ['Market volatility updates', 'Startup acquisition news', 'Industry disruption stories'],
    'personal-brand': ['Platform algorithm changes', 'Creator economy reports', 'New monetization features'],
  };
  return getRandomItems(news[niche], 2);
}

// ============================================================================
// LAYER 3: VARIATION ENGINE
// ============================================================================

export interface VariationConfig {
  hookStyle: 'curiosity' | 'fear' | 'contrarian' | 'list' | 'story' | 'question';
  slideStructure: 'problem-solution' | 'listicle' | 'story' | 'myth-fact' | 'before-after';
  toneIntensity: number; // 1-10
  ctaType: 'engagement' | 'follow' | 'save' | 'comment' | 'share';
}

export function generateVariation(seed?: number): VariationConfig {
  const hookStyles: VariationConfig['hookStyle'][] =
    ['curiosity', 'fear', 'contrarian', 'list', 'story', 'question'];
  const structures: VariationConfig['slideStructure'][] =
    ['problem-solution', 'listicle', 'story', 'myth-fact', 'before-after'];
  const ctas: VariationConfig['ctaType'][] =
    ['engagement', 'follow', 'save', 'comment', 'share'];

  const rng = seed ? () => mulberry32(seed)() : Math.random;

  return {
    hookStyle: hookStyles[Math.floor(rng() * hookStyles.length)],
    slideStructure: structures[Math.floor(rng() * structures.length)],
    toneIntensity: Math.floor(rng() * 5) + 5, // 5-10
    ctaType: ctas[Math.floor(rng() * ctas.length)],
  };
}

function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// LAYER 4: ANTI-REPETITION LOGIC
// ============================================================================

interface GenerationHistory {
  hooks: string[];
  phrases: Set<string>;
  structures: string[];
  timestamps: number[];
}

// In-memory storage (use Redis in production)
const generationHistory: Map<string, GenerationHistory> = new Map();

export function trackGeneration(userId: string, content: any) {
  if (!generationHistory.has(userId)) {
    generationHistory.set(userId, {
      hooks: [],
      phrases: new Set(),
      structures: [],
      timestamps: [],
    });
  }

  const history = generationHistory.get(userId)!;

  // Add hook
  if (content.slides?.[0]?.title) {
    history.hooks.push(content.slides[0].title);
    if (history.hooks.length > 10) history.hooks.shift();
  }

  // Add timestamp
  history.timestamps.push(Date.now());
  if (history.timestamps.length > 10) history.timestamps.shift();

  // Store in localStorage for frontend persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem(`carousel_history_${userId}`, JSON.stringify({
      hooks: history.hooks,
      structures: history.structures,
      timestamps: history.timestamps,
    }));
  }
}

export function getUsedHooks(userId: string): string[] {
  const history = generationHistory.get(userId);
  return history?.hooks || [];
}

export function getAvoidancePrompt(userId: string): string {
  const hooks = getUsedHooks(userId);
  if (hooks.length === 0) return '';

  return `\n\nIMPORTANT - AVOID REPETITION:\nDo NOT use these recently used hooks or similar phrases:\n${hooks.map(h => `- "${h}"`).join('\n')}\n\nCreate something completely fresh and different.`;
}

// ============================================================================
// MASTER PROMPT BUILDER
// ============================================================================

export async function buildDynamicPrompt(
  topic: string,
  niche: Niche,
  tone: Tone,
  numSlides: number,
  username: string,
  userId: string = 'anonymous'
): Promise<{ prompt: string; systemPrompt: string; config: VariationConfig }> {

  // Layer 1: Enrich input
  const enriched = enrichInput(topic, niche);

  // Layer 2: Fetch dynamic context
  const context = await fetchDynamicContext(niche);

  // Layer 3: Generate variation
  const config = generateVariation();

  // Layer 4: Anti-repetition
  const avoidancePrompt = getAvoidancePrompt(userId);

  const systemPrompt = `You are an elite viral content strategist who creates unique, engaging Instagram carousels.
Your content has generated millions of views across niches.

CORE PRINCIPLES:
1. HOOK-FIRST - First 3 seconds determine success
2. SPECIFICITY WINS - Generic advice is ignored
3. PATTERN INTERRUPTS - Break expectations
4. EMOTIONAL DRIVE - Trigger curiosity, fear, or aspiration
5. ACTIONABLE - Every slide delivers value

VARIATION STYLE: ${config.hookStyle} hook, ${config.slideStructure} structure, intensity ${config.toneIntensity}/10

STRICT RULES:
- NEVER use generic phrases like "unlock potential" or "game changer"
- Each slide must have a unique angle
- Use specific examples, not vague advice
- Vary sentence structure between slides
- Include at least one surprising fact or stat

Return ONLY valid JSON array.`;

  const userPrompt = `Create a ${numSlides}-slide viral Instagram carousel.

TOPIC: ${topic}
NICHE: ${niche}
TONE: ${tone}
VARIATION: ${config.hookStyle} hook style, ${config.slideStructure} structure

EXPANDED CONTEXT:
Use Cases: ${enriched.useCases.join(', ')}
Problems Solved: ${enriched.problemsSolved.join(', ')}
Misconceptions to Bust: ${enriched.misconceptions.join(', ')}
Trending Topics: ${context.trendingTopics.join(', ')}

INSIGHTS TO INCLUDE:
${context.insights.join('\n')}

STATISTICS (use 1-2):
${context.statistics.join('\n')}

EXAMPLES FOR INSPIRATION:
${context.examples.join('\n')}

STRUCTURE REQUIREMENTS:
SLIDE 1 (HOOK): Use ${config.hookStyle} style. Make it impossible to ignore. Max 8 words.
${getHookInstructions(config.hookStyle)}

SLIDES 2-${numSlides - 1} (VALUE): ${getStructureInstructions(config.slideStructure)}

SLIDE ${numSlides} (CTA): ${getCTAInstructions(config.ctaType, username)}

${avoidancePrompt}

OUTPUT: Return JSON array with ${numSlides} slides. Each slide: {title, content, emoji}${getAvoidedPhrasesPrompt()}`;

  return { prompt: userPrompt, systemPrompt, config };
}

function getHookInstructions(style: VariationConfig['hookStyle']): string {
  const instructions: Record<VariationConfig['hookStyle'], string> = {
    curiosity: 'Create an information gap. "Nobody tells you..." or "The real reason..." or "What X doesn\'t want you to know"',
    fear: 'Highlight a risk or pain point. "Stop doing this..." or "You\'re losing X by..." or "Warning: ..."',
    contrarian: 'Challenge conventional wisdom. "Unpopular opinion..." or "This is controversial but..." or "Everyone is wrong about..."',
    list: 'Promise specific value. "5 things I wish..." or "The 3 mistakes..." or "7 signs you..."',
    story: 'Open with intrigue. "In 2020, I was..." or "This changed everything for me..." or "I was today years old when..."',
    question: 'Ask a thought-provoking question. "Why do 90% of people...?" or "What if I told you...?"',
  };
  return instructions[style];
}

function getStructureInstructions(structure: VariationConfig['slideStructure']): string {
  const instructions: Record<VariationConfig['slideStructure'], string> = {
    'problem-solution': 'Present a problem → Show the solution → Give implementation steps',
    listicle: 'Numbered points with specific, actionable advice. No filler.',
    story: 'Setup → Conflict → Resolution. Make it personal and relatable.',
    'myth-fact': 'Common myth → Reality check → Evidence → Action',
    'before-after': 'Before state → Transformation → After state → How to replicate',
  };
  return instructions[structure];
}

function getCTAInstructions(ctaType: VariationConfig['ctaType'], username: string): string {
  const instructions: Record<VariationConfig['ctaType'], string> = {
    engagement: `Ask a question. "Which tip will you try first? Comment 👇" or "Tag someone who needs this"`,
    follow: `Follow @${username} for more. "Follow for part 2 tomorrow" or "Daily tips at @${username}"`,
    save: `Encourage saving. "Save this for later" or "Bookmark this thread"`,
    comment: `Drive comments. "Comment 'YES' if you agree" or "Drop a 💯 if this helped"`,
    share: `Encourage sharing. "Share with someone who needs this" or "RT to help others"`,
  };
  return instructions[ctaType];
}

function getAvoidedPhrasesPrompt(): string {
  return `

AVOID THESE OVERUSED PHRASES:
- "game changer"
- "unlock your potential"
- "skyrocket your results"
- "secret sauce"
- "hidden gem"
- "you won't believe"
- "mind-blowing"
- "revolutionary"
- "transform your life"
- "ultimate guide"`;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Session memory for user preferences
export const sessionMemory = {
  getPreferences(userId: string) {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`carousel_prefs_${userId}`);
    return stored ? JSON.parse(stored) : null;
  },

  setPreferences(userId: string, prefs: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`carousel_prefs_${userId}`, JSON.stringify(prefs));
  },

  getLastGeneration(userId: string) {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`carousel_last_${userId}`);
    return stored ? JSON.parse(stored) : null;
  },

  setLastGeneration(userId: string, data: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`carousel_last_${userId}`, JSON.stringify({
      ...data,
      timestamp: Date.now(),
    }));
  },
};
