import { NextRequest, NextResponse } from 'next/server';
import { Niche, Tone, NICHES, TONES, Slide } from '@/app/types';

interface GenerateRequest {
  topic: string;
  niche: Niche;
  tone: Tone;
  username: string;
  numSlides?: number;
}

// Simple in-memory cache (use Redis in production)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(topic: string, niche: Niche, tone: Tone, numSlides: number): string {
  return `${topic}:${niche}:${tone}:${numSlides}`;
}

// NICHE CONTEXT for better prompts
const NICHE_CONTEXT: Record<Niche, { keywords: string[]; painPoints: string[]; powerWords: string[]; audience: string }> = {
  tech: {
    keywords: ['AI', 'automation', 'code', 'startup', 'SaaS', 'API', 'workflow', 'stack', 'developer', 'software'],
    painPoints: ['tutorial hell', 'shiny object syndrome', 'imposter syndrome', 'burnout', 'tech debt', 'debugging'],
    powerWords: ['ship', 'deploy', 'scale', 'iterate', 'build', 'debug', 'optimize', 'hack'],
    audience: 'developers, tech professionals, and startup founders',
  },
  doctor: {
    keywords: ['prevention', 'longevity', 'metabolism', 'immunity', 'recovery', 'sleep', 'stress', 'health'],
    painPoints: ['chronic fatigue', 'poor sleep', 'brain fog', 'inflammation', 'burnout', 'anxiety'],
    powerWords: ['heal', 'prevent', 'optimize', 'balance', 'restore', 'boost', 'transform'],
    audience: 'health-conscious individuals, patients, and wellness seekers',
  },
  festival: {
    keywords: ['tradition', 'celebration', 'family', 'culture', 'ritual', 'gathering', 'festivity'],
    painPoints: ['family pressure', 'budget stress', 'travel chaos', 'gift anxiety', 'planning overwhelm'],
    powerWords: ['honor', 'gather', 'celebrate', 'connect', 'remember', 'share', 'cherish'],
    audience: 'families, cultural enthusiasts, and celebration planners',
  },
  business: {
    keywords: ['revenue', 'profit', 'cash flow', 'LTV', 'CAC', 'scaling', 'systems', 'growth'],
    painPoints: ['cash flow gaps', 'hiring mistakes', 'feature creep', 'shiny object syndrome', 'burnout'],
    powerWords: ['scale', 'profit', 'optimize', 'automate', 'delegate', 'systematize', 'dominate'],
    audience: 'entrepreneurs, business owners, and executives',
  },
  'personal-brand': {
    keywords: ['audience', 'content', 'engagement', 'authority', 'niche', 'monetization', 'growth'],
    painPoints: ['algorithm changes', 'creator burnout', 'imposter syndrome', 'consistency', 'growth plateaus'],
    powerWords: ['grow', 'engage', 'monetize', 'authority', 'influence', 'connect', 'dominate'],
    audience: 'content creators, influencers, and personal brand builders',
  },
};

// TONE PATTERNS for better prompts
const TONE_PATTERNS: Record<Tone, { style: string; hookExamples: string[]; contentStyle: string }> = {
  viral: {
    style: 'Bold, punchy, curiosity-driven. Use pattern interrupts and information gaps.',
    hookExamples: ['The [topic] secret nobody shares', 'Stop doing [topic] wrong', 'What 90% get wrong about [topic]'],
    contentStyle: 'Short punchy sentences. Challenge assumptions. Create urgency.',
  },
  educational: {
    style: 'Clear, structured, evidence-based. Teach something valuable.',
    hookExamples: ['The science behind [topic]', 'How [topic] actually works', '[topic]: Evidence-based approach'],
    contentStyle: 'Structured insights. Practical takeaways. Data-driven.',
  },
  storytelling: {
    style: 'Conversational, relatable, narrative. Personal journey format.',
    hookExamples: ['How I mastered [topic]', 'My [topic] transformation', 'From [pain point] to [topic] expert'],
    contentStyle: 'Personal voice. Relatable experiences. Lessons learned.',
  },
  controversial: {
    style: 'Provocative, challenging, contrarian. Challenge mainstream advice.',
    hookExamples: ['Unpopular opinion: [topic] advice is wrong', '[topic] hype is misleading you', 'The uncomfortable truth about [topic]'],
    contentStyle: 'Bold claims. Challenge norms. Strong opinions. Back it up.',
  },
};

// Build optimized prompt for Claude
function buildClaudePrompt(topic: string, niche: Niche, tone: Tone, numSlides: number, username: string): { system: string; user: string } {
  const context = NICHE_CONTEXT[niche];
  const tonePattern = TONE_PATTERNS[tone];
  const numValueSlides = numSlides - 2;

  const system = `You are an expert Instagram carousel creator who writes scroll-stopping, viral-worthy content.

STRICT FORMAT RULES (NEVER BREAK THESE):
- Headline: MAXIMUM 8 words, ideally 5-7 words
- Subtext: MAXIMUM 12 words, ideally 8-10 words
- One idea per slide - clear and punchy
- No fluff words like "unlock", "game-changer", "skyrocket", "secret sauce"
- No paragraphs - only short, punchy sentences
- Every word must earn its place

AUDIENCE: ${context.audience}
TONE: ${tonePattern.style}`;

  const user = `Create a ${numSlides}-slide Instagram carousel about "${topic}" for ${niche} audience.

STRUCTURE:
Slide 1 (HOOK): ${tonePattern.hookExamples.join(' OR ')}
Slides 2-${numSlides - 1} (VALUE): Specific, actionable insights about ${topic}
Slide ${numSlides} (CTA): Call-to-action to follow @${username}

NICHE CONTEXT:
- Keywords: ${context.keywords.slice(0, 6).join(', ')}
- Pain points: ${context.painPoints.slice(0, 4).join(', ')}
- Power words: ${context.powerWords.slice(0, 5).join(', ')}

CONTENT STYLE: ${tonePattern.contentStyle}

EXAMPLE OF PERFECT OUTPUT:
Slide 1: "The AI secret nobody talks about" / "This changes everything 👇" / emoji: 🔥
Slide 2: "ChatGPT is just the beginning" / "Real power is in custom GPTs" / emoji: 🤖
Slide 3: "Stop learning, start building" / "Execution beats theory every time" / emoji: ⚡

REQUIRED OUTPUT FORMAT - RETURN ONLY THIS JSON:
[
  {"headline": "...", "subtext": "...", "emoji": "🔥"},
  {"headline": "...", "subtext": "...", "emoji": "💡"},
  ...
]

RULES:
1. Headlines max 8 words
2. Subtext max 12 words
3. Each slide ONE clear idea
4. Topic-specific, not generic
5. No bullet points in subtext`;

  return { system, user };
}

// Parse Claude response
function parseClaudeResponse(text: string, numSlides: number): Array<{ headline: string; subtext: string; emoji: string }> {
  try {
    // Try to extract JSON array
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.map((slide: any) => ({
          headline: (slide.headline || slide.title || '').slice(0, 60),
          subtext: (slide.subtext || slide.content || '').slice(0, 80),
          emoji: slide.emoji || '💡',
        }));
      }
    }
  } catch (e) {
    console.warn('JSON parsing failed, using text fallback');
  }

  // Text fallback
  const slides: Array<{ headline: string; subtext: string; emoji: string }> = [];
  const lines = text.split('\n').filter(l => l.trim());
  const emojis = ['🔥', '💡', '⚡', '🚀', '💎', '🎯', '✨', '🤯', '📈', '👇'];

  for (let i = 0; i < numSlides && i < lines.length; i++) {
    const line = lines[i].replace(/^\d+\.\s*/, '').replace(/^slide\s*\d+[:\.]\s*/i, '');
    const parts = line.split(/[|\/]/).map(p => p.trim());
    slides.push({
      headline: parts[0]?.slice(0, 60) || `Slide ${i + 1}`,
      subtext: parts[1]?.slice(0, 80) || '',
      emoji: parts[2] || emojis[i % emojis.length],
    });
  }

  return slides;
}

// Generate fallback content if API fails
function generateFallbackContent(topic: string, niche: Niche, tone: Tone, numSlides: number, username: string): Slide[] {
  const context = NICHE_CONTEXT[niche];
  const tonePattern = TONE_PATTERNS[tone];

  // Pick a hook based on tone
  const hook = tonePattern.hookExamples[Math.floor(Math.random() * tonePattern.hookExamples.length)].replace('[topic]', topic);

  const slides: Slide[] = [
    {
      id: 'slide-1',
      title: hook.charAt(0).toUpperCase() + hook.slice(1),
      content: 'This changes everything 👇',
      emoji: '🔥',
      tag: 'HOOK',
    },
  ];

  // Value slides
  const valueTemplates = [
    { title: `Most people overcomplicate ${topic}`, content: 'The simple approach always wins', emoji: '💡' },
    { title: `${context.powerWords[0]} your systems first`, content: 'Tools matter less than strategy', emoji: '⚡' },
    { title: `Stop ${context.painPoints[0]} forever`, content: 'One shift changes everything', emoji: '🎯' },
    { title: `${context.keywords[0]} is just the start`, content: 'Master the fundamentals first', emoji: '🚀' },
    { title: `Your ${context.painPoints[1]} ends today`, content: 'Take action, see results', emoji: '💎' },
  ];

  for (let i = 0; i < numSlides - 2 && i < valueTemplates.length; i++) {
    slides.push({
      id: `slide-${i + 2}`,
      title: valueTemplates[i].title,
      content: valueTemplates[i].content,
      emoji: valueTemplates[i].emoji,
      tag: 'VALUE',
    });
  }

  // CTA slide
  const ctas = [
    { title: 'Which tip hit hardest?', content: `Follow @${username} for more 🔥`, emoji: '👇' },
    { title: 'Save this thread', content: `Follow @${username} before it's gone 💾`, emoji: '💾' },
    { title: 'Want more insights?', content: `Follow @${username} for daily tips 📚`, emoji: '📚' },
    { title: 'Share your thoughts', content: `Comment below 👇 Follow @${username}`, emoji: '💬' },
  ];
  const cta = ctas[Math.floor(Math.random() * ctas.length)];

  slides.push({
    id: `slide-${numSlides}`,
    title: cta.title,
    content: cta.content,
    emoji: cta.emoji,
    tag: 'CTA',
  });

  return slides;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const {
      topic,
      niche,
      tone,
      username,
      numSlides = 5
    } = body;

    // Validation
    if (!topic?.trim()) {
      return NextResponse.json(
        { error: 'Topic is required.' },
        { status: 400 }
      );
    }

    if (!username?.trim()) {
      return NextResponse.json(
        { error: 'Username is required.' },
        { status: 400 }
      );
    }

    if (!niche || !NICHES.find(n => n.id === niche)) {
      return NextResponse.json(
        { error: 'Valid niche is required.' },
        { status: 400 }
      );
    }

    if (!tone || !TONES.find(t => t.id === tone)) {
      return NextResponse.json(
        { error: 'Valid tone is required.' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = getCacheKey(topic, niche, tone, numSlides);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached result');
      return NextResponse.json({
        ...cached.data,
        cached: true,
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not configured, using fallback');
      const fallbackSlides = generateFallbackContent(topic, niche, tone, numSlides, username.replace('@', ''));
      return NextResponse.json({
        slides: fallbackSlides,
        meta: { topic, niche, tone, slideCount: fallbackSlides.length, source: 'fallback' }
      });
    }

    // Build optimized prompt
    const { system, user } = buildClaudePrompt(topic, niche, tone, numSlides, username.replace('@', ''));

    // Call Claude API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response;
    try {
      response = await fetch('https://api.code.umans.ai/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          temperature: 0.7,
          system,
          messages: [{ role: 'user', content: user }]
        })
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('API call failed:', fetchError.message);
      const fallbackSlides = generateFallbackContent(topic, niche, tone, numSlides, username.replace('@', ''));
      return NextResponse.json({
        slides: fallbackSlides,
        meta: { topic, niche, tone, slideCount: fallbackSlides.length, source: 'fallback', error: 'api_timeout' }
      });
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', response.status, errorText);
      const fallbackSlides = generateFallbackContent(topic, niche, tone, numSlides, username.replace('@', ''));
      return NextResponse.json({
        slides: fallbackSlides,
        meta: { topic, niche, tone, slideCount: fallbackSlides.length, source: 'fallback', error: response.status }
      });
    }

    const result = await response.json();
    let text = '';
    if (Array.isArray(result.content)) {
      const textBlock = result.content.find((block: any) => block.type === 'text');
      if (textBlock) text = textBlock.text;
    }
    text = text || result.completion || result.text || '';

    // Parse response
    const parsedSlides = parseClaudeResponse(text, numSlides);

    // Convert to Slide format
    const slides: Slide[] = parsedSlides.map((slide, index) => ({
      id: `slide-${index + 1}`,
      title: slide.headline,
      content: slide.subtext,
      emoji: slide.emoji,
      tag: index === 0 ? 'HOOK' : index === parsedSlides.length - 1 ? 'CTA' : 'VALUE',
    }));

    // Fill missing slides if needed
    while (slides.length < numSlides) {
      const i = slides.length;
      slides.push({
        id: `slide-${i + 1}`,
        title: `Pro tip #${i}`,
        content: 'Small improvements compound over time',
        emoji: '💎',
        tag: 'VALUE',
      });
    }
    if (slides.length > numSlides) {
      slides.splice(numSlides);
    }

    const responseData = {
      slides,
      meta: {
        topic,
        niche,
        tone,
        slideCount: slides.length,
        source: 'claude',
      }
    };

    // Cache the result
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate carousel. Please try again.' },
      { status: 500 }
    );
  }
}
