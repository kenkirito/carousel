import { NextRequest, NextResponse } from 'next/server';
import { Niche, Tone, Slide } from '@/app/types';

export const runtime = 'edge';

interface ConvertRequest {
  content: string;
  niche: Niche;
  tone: Tone;
  username: string;
}

// Slide type definitions for structured content
interface SlideTemplate {
  type: 'hook' | 'point' | 'list' | 'quote' | 'stat' | 'myth' | 'tip' | 'cta';
  title: string;
  content: string;
  emoji: string;
}

// Parse user content into structured slides using Claude
async function parseContentWithClaude(
  content: string,
  niche: Niche,
  tone: Tone,
  username: string,
  apiKey: string
): Promise<Slide[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const nicheContext: Record<Niche, { audience: string; focus: string }> = {
    tech: {
      audience: 'developers, tech professionals, startup founders',
      focus: 'technical insights, coding tips, AI tools, productivity hacks',
    },
    doctor: {
      audience: 'health-conscious individuals, patients, wellness seekers',
      focus: 'health tips, prevention, wellness advice, medical myths',
    },
    festival: {
      audience: 'families, cultural enthusiasts, celebration planners',
      focus: 'traditions, celebrations, family gatherings, cultural insights',
    },
    business: {
      audience: 'entrepreneurs, business owners, executives',
      focus: 'business strategies, growth tips, revenue advice, productivity',
    },
    'personal-brand': {
      audience: 'content creators, influencers, personal brand builders',
      focus: 'content strategy, growth tips, engagement, monetization',
    },
  };

  const toneInstructions: Record<Tone, string> = {
    viral: 'Make it punchy, curiosity-driven, with pattern interrupts. Use bold statements.',
    educational: 'Focus on clear teaching, evidence-based points, practical takeaways.',
    storytelling: 'Use personal narrative, relatable experiences, lessons learned.',
    controversial: 'Challenge assumptions, be provocative, back up strong opinions.',
  };

  const system = `You are an expert Instagram carousel creator. Convert user content into structured slides.

RULES:
- Extract 3-7 key points from the content
- Slide 1: HOOK - grab attention (max 8 words)
- Slides 2-6: VALUE - one clear point per slide
- Last Slide: CTA - call to action
- Headlines: MAX 8 words
- Subtext: MAX 12 words
- Use appropriate emojis
- Return ONLY valid JSON`;

  const user = `Convert this content into carousel slides for ${niche} audience.

USER CONTENT:
"""
${content}
"""

TONE: ${toneInstructions[tone]}

Create 5-7 slides total. Each slide should have:
- type: "hook" | "point" | "list" | "quote" | "myth" | "tip" | "cta"
- headline: punchy title (max 8 words)
- subtext: supporting text (max 12 words)
- emoji: relevant emoji

AVAILABLE SLIDE TYPES:
- hook: Attention-grabbing opening
- point: Single key insight
- list: Bulleted items (use "•" in content)
- quote: Quote or testimonial
- myth: Myth-busting format
- tip: Actionable tip
- cta: Call to action

OUTPUT FORMAT (JSON array only):
[
  {"type": "hook", "headline": "...", "subtext": "...", "emoji": "🔥"},
  {"type": "point", "headline": "...", "subtext": "...", "emoji": "💡"},
  ...
]

Make it engaging and specific to: ${nicheContext[niche].focus}`;

  const response = await fetch('https://api.code.umans.ai/v1/messages', {
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

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();
  let text = '';
  if (Array.isArray(result.content)) {
    const textBlock = result.content.find((b: any) => b.type === 'text');
    if (textBlock) text = textBlock.text;
  }

  // Parse JSON response
  const jsonMatch = text.match(/\[[\s\S]*?\]/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed)) {
    throw new Error('Response is not an array');
  }

  // Convert to Slide format
  return parsed.map((slide: any, index: number) => ({
    id: `slide-${index + 1}`,
    title: slide.headline?.slice(0, 60) || slide.title?.slice(0, 60) || `Slide ${index + 1}`,
    content: slide.subtext?.slice(0, 80) || slide.content?.slice(0, 80) || '',
    emoji: slide.emoji || '💡',
    tag: slide.type?.toUpperCase() || (index === 0 ? 'HOOK' : index === parsed.length - 1 ? 'CTA' : 'VALUE'),
  }));
}

// Fallback: Simple parsing without Claude
function parseContentSimple(content: string, username: string): Slide[] {
  // Split content by sentences or paragraphs
  const chunks = content
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.length < 200);

  const slides: Slide[] = [];

  // Hook slide
  const firstChunk = chunks[0] || 'Key insights you need';
  const hookTitle = firstChunk.split(' ').slice(0, 6).join(' ');
  slides.push({
    id: 'slide-1',
    title: hookTitle.charAt(0).toUpperCase() + hookTitle.slice(1),
    content: 'Swipe to see what I learned 👇',
    emoji: '🔥',
    tag: 'HOOK',
  });

  // Value slides - take up to 5 meaningful chunks
  const valueChunks = chunks.slice(1, 6);
  const emojis = ['💡', '⚡', '🎯', '🚀', '💎', '✨', '📊', '🔬'];

  valueChunks.forEach((chunk, i) => {
    const words = chunk.split(' ');
    const title = words.slice(0, 7).join(' ');
    const body = words.slice(7, 15).join(' ');

    slides.push({
      id: `slide-${i + 2}`,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      content: body || 'Key insight to remember',
      emoji: emojis[i % emojis.length],
      tag: 'VALUE',
    });
  });

  // CTA slide
  slides.push({
    id: `slide-${slides.length + 1}`,
    title: 'Which point hit hardest?',
    content: `Follow @${username.replace('@', '')} for more 🔥`,
    emoji: '👇',
    tag: 'CTA',
  });

  return slides;
}

export async function POST(req: NextRequest) {
  try {
    const body: ConvertRequest = await req.json();
    const { content, niche, tone, username } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required.' },
        { status: 400 }
      );
    }

    if (!username?.trim()) {
      return NextResponse.json(
        { error: 'Username is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let slides: Slide[];
    let source = 'simple';

    if (apiKey) {
      try {
        slides = await parseContentWithClaude(content, niche, tone, username, apiKey);
        source = 'claude';
      } catch (error) {
        console.log('Claude parsing failed, using simple parser:', error);
        slides = parseContentSimple(content, username);
      }
    } else {
      slides = parseContentSimple(content, username);
    }

    return NextResponse.json({
      slides,
      meta: {
        slideCount: slides.length,
        niche,
        tone,
        source,
      }
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert content. Please try again.' },
      { status: 500 }
    );
  }
}
