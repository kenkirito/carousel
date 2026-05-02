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
  const topicName = topic.length > 40 ? topic.slice(0, 40) : topic;
  const hookStyle = config.hookStyle || 'curiosity';

  // TOPIC-SPECIFIC content generators
  const hooks: Record<string, Array<{ title: string; content: string; emoji: string }>> = {
    curiosity: [
      {
        title: `I spent 100 hours testing ${topicName}`,
        content: `The results shocked me.\n\nEverything I thought I knew was wrong.\n\nHere is what actually works 👇`,
        emoji: '🤯'
      },
      {
        title: `The ${topicName} secret nobody shares`,
        content: `I analyzed the top 1% to find patterns.\n\nOne strategy emerged that changes everything.\n\nThread 🧵👇`,
        emoji: '🔍'
      },
      {
        title: `${topicName}: What 90% get wrong`,
        content: `Most people approach this backwards.\n\nHere is the framework that actually delivers results.`,
        emoji: '💡'
      },
    ],
    fear: [
      {
        title: `Stop wasting time on ${topicName}`,
        content: `You are doing it wrong.\n\nAnd it is costing you more than you realize.\n\nHere is the fix 👇`,
        emoji: '⚠️'
      },
      {
        title: `${topicName} mistakes killing your progress`,
        content: `These 3 errors are silent killers.\n\nFix them today or stay stuck.`,
        emoji: '🚨'
      },
    ],
    contrarian: [
      {
        title: `Unpopular opinion: ${topicName} hype is wrong`,
        content: `Everyone is chasing the wrong thing.\n\nHere is what actually moves the needle.`,
        emoji: '🎯'
      },
      {
        title: `${topicName} advice that harms you`,
        content: `Mainstream tips are outdated.\n\nDo this instead for 10x results.`,
        emoji: '📊'
      },
    ],
    list: [
      {
        title: `5 ${topicName} truths I wish I knew`,
        content: `Learned the hard way so you do not have to.\n\nSave this thread 👇`,
        emoji: '🧵'
      },
      {
        title: `3 ${topicName} mistakes to avoid`,
        content: `These cost me years of progress.\n\nDo not repeat them.`,
        emoji: '⚡'
      },
    ],
    story: [
      {
        title: `How I mastered ${topicName}`,
        content: `From complete beginner to expert.\n\nHere is the exact playbook I used 👇`,
        emoji: '🚀'
      },
      {
        title: `${topicName} changed my life`,
        content: `One year ago, I was clueless.\n\nHere is what happened next.`,
        emoji: '💎'
      },
    ],
    question: [
      {
        title: `Struggling with ${topicName}?`,
        content: `You are not alone.\n\nHere is the system that finally worked for me.`,
        emoji: '❓'
      },
      {
        title: `Why is ${topicName} so hard?`,
        content: `It is not your fault.\n\nYou were taught the wrong approach.`,
        emoji: '🤔'
      },
    ],
  };

  const hookVariations = hooks[hookStyle] || hooks.curiosity;
  const hook = hookVariations[Math.floor(Math.random() * hookVariations.length)];

  const slides: Array<{ id: string; title: string; content: string; emoji: string }> = [
    {
      id: 'slide-1',
      ...hook,
    },
  ];

  // TOPIC-SPECIFIC value slides
  const valueSlides = [
    {
      title: 'Myth #1: It takes years to learn',
      content: `Reality: ${topicName} mastery comes from smart practice, not time.\n\n• Focus on high-impact skills first\n• Use the 80/20 principle\n• Practice with real projects\n\nQuality > Quantity`,
      emoji: '💡'
    },
    {
      title: 'The tool stack that actually works',
      content: `Stop chasing every new tool for ${topicName}.\n\n• Pick 2-3 core tools\n• Master them completely\n• Ignore the shiny distractions\n\nDepth beats breadth every time.`,
      emoji: '🛠️'
    },
    {
      title: 'The 5-minute daily habit',
      content: `Consistency beats intensity for ${topicName}.\n\n• 5 minutes every day beats 2 hours once a week\n• Compound growth is real\n• Small wins build momentum\n\nStart today.`,
      emoji: '⚡'
    },
    {
      title: 'What the top 1% do differently',
      content: `They do not work harder on ${topicName}.\n\n• They systematize their approach\n• They learn from feedback loops\n• They iterate rapidly\n\nWork smart, not just hard.`,
      emoji: '🎯'
    },
    {
      title: 'Common beginner mistake',
      content: `Trying to learn ${topicName} all at once.\n\n• Start with one concept\n• Master it completely\n• Then move to the next\n\nSequential > Parallel learning`,
      emoji: '🚨'
    },
    {
      title: 'The framework that works',
      content: `My 3-step process for ${topicName}:\n\n1. Learn the fundamentals deeply\n2. Build real projects immediately\n3. Teach others to solidify\n\nRinse and repeat.`,
      emoji: '🔄'
    },
  ];

  // Select appropriate number of value slides
  const numValueSlides = numSlides - 2; // minus hook and CTA
  const selectedValueSlides = valueSlides.slice(0, numValueSlides);

  selectedValueSlides.forEach((slide, idx) => {
    slides.push({
      id: `slide-${idx + 2}`,
      ...slide,
    });
  });

  // TOPIC-SPECIFIC CTA slide
  const ctas = [
    {
      title: 'Your turn',
      content: `I post ${topicName} insights daily.\n\nFollow @${username} so you do not miss the next thread.\n\nWhich tip will you try first? 👇`,
      emoji: '👇'
    },
    {
      title: 'Save this thread',
      content: `${topicName} mastery takes time.\n\nSave this for reference.\n\nFollow @${username} for more actionable tips 🙏`,
      emoji: '💾'
    },
    {
      title: 'Share with a friend',
      content: `Know someone struggling with ${topicName}?\n\nTag them below 👇\n\nFollow @${username} for weekly deep dives`,
      emoji: '📤'
    },
  ];

  slides.push({
    id: `slide-${numSlides}`,
    ...ctas[Math.floor(Math.random() * ctas.length)],
  });

  return { slides };
}
