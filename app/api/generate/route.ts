import { NextRequest, NextResponse } from 'next/server';
import { Niche, Tone, NICHES, TONES } from '@/app/types';
import { buildDynamicPrompt, trackGeneration, generateVariation } from '@/app/lib/content-engine';

interface GenerateRequest {
  topic: string;
  niche: Niche;
  tone: Tone;
  username: string;
  numSlides?: number;
  variationSeed?: number;
  userId?: string;
}

// Simple in-memory cache (use Redis in production)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(topic: string, niche: Niche, tone: Tone, numSlides: number): string {
  return `${topic}:${niche}:${tone}:${numSlides}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const {
      topic,
      niche,
      tone,
      username,
      numSlides = 7,
      variationSeed,
      userId = 'anonymous'
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
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured in .env.local' },
        { status: 500 }
      );
    }

    // Build dynamic prompt with multi-layer system
    const { prompt: userPrompt, systemPrompt, config } = await buildDynamicPrompt(
      topic,
      niche,
      tone,
      numSlides,
      username.replace('@', ''),
      userId
    );

    // Create abort controller for timeout
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
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        })
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('API request timed out after 30s');
        const mockData = generateDynamicMockSlides(topic, numSlides, username, config);
        trackGeneration(userId, mockData);
        return NextResponse.json({
          ...mockData,
          meta: {
            topic,
            niche,
            tone,
            slideCount: numSlides,
            variation: config,
            mock: true,
            timeout: true,
          }
        });
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      // Return enhanced mock data on API error
      const mockData = generateDynamicMockSlides(topic, numSlides, username, config);
      trackGeneration(userId, mockData);
      return NextResponse.json({
        ...mockData,
        meta: {
          topic,
          niche,
          tone,
          slideCount: numSlides,
          variation: config,
          mock: true,
          apiError: response.status,
        }
      });
    }

    const result = await response.json();
    const text = result.content?.[0]?.text || result.completion || result.text || '';

    // Parse AI response
    let slides: Array<{ id: string; title: string; content: string; emoji: string }> = [];

    try {
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        slides = JSON.parse(jsonMatch[0]);
      } else {
        slides = JSON.parse(text);
      }
    } catch (e) {
      console.warn('JSON parsing failed, using text parsing fallback');
      slides = parseTextToSlides(text, numSlides, topic, username);
    }

    // Validate and enhance slides
    slides = slides.map((slide, index) => ({
      id: `slide-${index + 1}`,
      title: slide.title?.slice(0, 100) || generateUniqueTitle(index, numSlides, config),
      content: slide.content?.slice(0, 500) || 'Content coming soon...',
      emoji: slide.emoji || getDefaultEmoji(index),
    }));

    // Ensure we have exactly numSlides
    while (slides.length < numSlides) {
      const i = slides.length;
      slides.push({
        id: `slide-${i + 1}`,
        title: generateUniqueTitle(i, numSlides, config),
        content: generateUniqueContent(i, numSlides, username, config),
        emoji: getDefaultEmoji(i),
      });
    }

    if (slides.length > numSlides) {
      slides = slides.slice(0, numSlides);
    }

    const responseData = {
      slides,
      meta: {
        topic,
        niche,
        tone,
        slideCount: slides.length,
        variation: config,
      }
    };

    // Cache the result
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    // Track generation for anti-repetition
    trackGeneration(userId, responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate carousel. Please try again.' },
      { status: 500 }
    );
  }
}

function getDefaultEmoji(index: number): string {
  const emojis = ['🔥', '💡', '⚡', '🚀', '💎', '🎯', '✨', '💰', '📈', '🎉', '🤖', '🏆', '🔮', '🌟', '🎨'];
  return emojis[index % emojis.length];
}

function generateUniqueTitle(index: number, total: number, config: any): string {
  const hooks = [
    'What nobody tells you',
    'The uncomfortable truth',
    'Stop believing this',
    'The real secret',
    'Why most people fail',
    'The hidden pattern',
    'Unpopular opinion',
    'Evidence vs hype',
  ];

  if (index === 0) {
    return hooks[Math.floor(Math.random() * hooks.length)];
  }
  if (index === total - 1) {
    return 'Your move';
  }
  return `Insight #${index}`;
}

function generateUniqueContent(index: number, total: number, username: string, config: any): string {
  if (index === total - 1) {
    const ctas = [
      `Follow @${username} for more unconventional insights.\n\nWhich point hit hardest? Comment 👇`,
      `Save this before it gets buried.\n\nFollow @${username} for the full series.`,
      `Tag someone who needs to see this 👇\n\nFollow @${username} for daily threads.`,
    ];
    return ctas[Math.floor(Math.random() * ctas.length)];
  }

  return 'Dive deeper into this concept. The nuances matter more than the basics.';
}

function parseTextToSlides(
  text: string,
  count: number,
  topic: string,
  username: string
): Array<{ id: string; title: string; content: string; emoji: string }> {
  const slides: Array<{ id: string; title: string; content: string; emoji: string }> = [];
  const lines = text.split('\n').filter(l => l.trim());

  let currentSlide: { title: string; content: string[]; emoji: string } = { title: '', content: [], emoji: '' };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```') || trimmed === '[' || trimmed === ']') continue;

    const slideMatch = trimmed.match(/^(?:Slide\s*)?(\d+)[.:)]\s*(.+)/i);

    if (slideMatch) {
      if (currentSlide.title) {
        slides.push({
          id: `slide-${slides.length + 1}`,
          title: currentSlide.title,
          content: currentSlide.content.join('\n'),
          emoji: currentSlide.emoji || getDefaultEmoji(slides.length),
        });
      }

      currentSlide = {
        title: slideMatch[2].slice(0, 100),
        content: [],
        emoji: '',
      };
    } else if (trimmed.startsWith('"title":') || trimmed.startsWith('title:')) {
      const match = trimmed.match(/title["']?\s*:\s*["'](.+?)["']/);
      if (match) currentSlide.title = match[1].slice(0, 100);
    } else if (trimmed.startsWith('"content":') || trimmed.startsWith('content:')) {
      const match = trimmed.match(/content["']?\s*:\s*["'](.+?)["']/);
      if (match) currentSlide.content.push(match[1]);
    } else if (trimmed.startsWith('"emoji":') || trimmed.startsWith('emoji:')) {
      const match = trimmed.match(/emoji["']?\s*:\s*["'](.+?)["']/);
      if (match) currentSlide.emoji = match[1];
    } else if (currentSlide.title) {
      currentSlide.content.push(trimmed);
    }

    if (slides.length >= count) break;
  }

  if (currentSlide.title && slides.length < count) {
    slides.push({
      id: `slide-${slides.length + 1}`,
      title: currentSlide.title,
      content: currentSlide.content.join('\n').slice(0, 500),
      emoji: currentSlide.emoji || getDefaultEmoji(slides.length),
    });
  }

  return slides;
}

function generateDynamicMockSlides(topic: string, numSlides: number, username: string, config: any) {
  const variations: Record<string, Array<{ title: string; content: string; emoji: string }>> = {
    curiosity: [
      { title: 'What 90% get wrong about this', content: 'The mainstream narrative is backwards.\n\nWhat if everything you believed was actually holding you back?\n\nHere is what the data actually shows 👇', emoji: '🤯' },
      { title: 'The pattern nobody discusses', content: 'I analyzed 1000+ cases.\n\nA hidden pattern emerged that contradicts popular advice.\n\nThis changes everything.', emoji: '🔍' },
    ],
    fear: [
      { title: 'Warning: Stop doing this today', content: 'This common habit is costing you more than you realize.\n\nEvery day you wait compounds the problem.\n\nHere is what to do instead 👇', emoji: '⚠️' },
      { title: 'The silent killer of progress', content: 'It creeps up slowly.\n\nBy the time you notice, the damage is done.\n\nProtect yourself now.', emoji: '🚨' },
    ],
    contrarian: [
      { title: 'Unpopular opinion: The hype is wrong', content: 'Everyone is chasing the wrong metric.\n\nThe real winners focus on something completely different.\n\nHere is the uncomfortable truth 👇', emoji: '🎯' },
      { title: 'Evidence > opinions', content: 'Trends come and go.\n\nData reveals what actually works.\n\nFollow the evidence, not the crowd.', emoji: '📊' },
    ],
  };

  const hookStyle = config.hookStyle || 'curiosity';
  const hookVariations = variations[hookStyle] || variations.curiosity;
  const hook = hookVariations[Math.floor(Math.random() * hookVariations.length)];

  const slides: Array<{ id: string; title: string; content: string; emoji: string }> = [
    {
      id: 'slide-1',
      ...hook,
    },
  ];

  // Generate varied middle slides
  for (let i = 1; i < numSlides - 1; i++) {
    const templates = [
      { title: `Myth #${i}`, content: `Common belief: "You need more time/resources/skill"\n\nReality: You need better systems.\n\n• Prioritize ruthlessly\n• Eliminate before optimizing\n• Focus on high-leverage actions`, emoji: '💡' },
      { title: 'The 80/20 rule', content: '80% of results come from 20% of efforts.\n\nIdentify your high-impact activities:\n\n• Audit your current approach\n• Double down on what works\n• Eliminate the rest', emoji: '🎯' },
      { title: 'Pattern interrupt', content: 'Break the cycle with one small change.\n\n• Start with 5 minutes daily\n• Track one metric only\n• Build momentum through consistency\n\nSmall wins compound.', emoji: '⚡' },
    ];
    slides.push({
      id: `slide-${i + 1}`,
      ...templates[i % templates.length],
    });
  }

  // CTA slide
  const ctas = [
    { title: 'Your move', content: `Follow @${username} for evidence-based insights.\n\nWhich myth did you believe? Comment below 👇`, emoji: '👇' },
    { title: 'Save this', content: `This thread took hours to research.\n\nFollow @${username} before it gets buried.\n\nShare with someone who needs this 🙏`, emoji: '💾' },
  ];
  slides.push({
    id: `slide-${numSlides}`,
    ...ctas[Math.floor(Math.random() * ctas.length)],
  });

  return { slides };
}
