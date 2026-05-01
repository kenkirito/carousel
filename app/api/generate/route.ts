import { NextRequest, NextResponse } from 'next/server';
import { Niche, Tone, NICHES, TONES } from '@/app/types';

interface GenerateRequest {
  topic: string;
  niche: Niche;
  tone: Tone;
  username: string;
  numSlides?: number;
}

function buildPrompt(topic: string, niche: Niche, tone: Tone, numSlides: number, username: string): string {
  const toneConfig = TONES.find(t => t.id === tone);
  const nicheConfig = NICHES.find(n => n.id === niche);

  const toneModifier = toneConfig?.promptModifier || '';
  const nicheContext = nicheConfig ? `for ${nicheConfig.name} content` : '';

  return `You are an expert Instagram content strategist who creates viral carousel posts.

TOPIC: "${topic}"
NICHE: ${nicheConfig?.name || niche}
TONE: ${toneConfig?.name || tone}
TARGET AUDIENCE: Instagram users interested in ${niche} content

${toneModifier}

STRUCTURE REQUIREMENTS:
Generate EXACTLY ${numSlides} slides with this specific structure:

SLIDE 1 - THE HOOK (Cover):
- Bold, curiosity-driven title (MAX 8 words)
- Pattern: "Nobody tells you this about X" or "The truth about X" or "X things I wish I knew about Y"
- Must make people STOP scrolling and WANT to swipe
- Include a compelling subtitle (1 sentence)

SLIDES 2-${Math.min(numSlides - 1, 6)} - VALUE SLIDES:
- Each slide = ONE clear idea
- Use simple language (Grade 6 readability)
- Break into bullet points with emojis
- Include actionable tips or insights
- NO fluff - every word must earn its place

${numSlides > 7 ? `SLIDE ${numSlides - 1} - KEY TAKEAWAY:
- Summarize the most important point
- Make it memorable
` : ''}

SLIDE ${numSlides} - CALL TO ACTION:
- Strong CTA to follow @${username}
- Encourage saving the post
- Ask a question to drive comments
- Use phrases like "Which tip will you try first?" or "Save this for later"

CONTENT RULES:
- Every slide needs a clear, punchy title (3-6 words)
- Body content should be 2-4 short sentences OR bullet points
- Use relevant emojis throughout (but don't overdo it)
- Write like a human mentor, not a textbook
- Include line breaks for readability
- Challenge common beliefs (especially for controversial tone)
- Be specific, not generic (no "unlock your potential" fluff)

EXAMPLE OUTPUT FORMAT:
[
  {
    "title": "Nobody tells you this about AI",
    "content": "99% of people use ChatGPT wrong.\\n\\nThey're treating it like Google when it's actually a thinking partner.\\n\\nHere's how the top 1% use it differently 👇",
    "emoji": "🤖"
  },
  {
    "title": "Treat it like a teammate",
    "content": "• Ask it to debate your ideas\\n• Have it play devil's advocate\\n• Iterate on drafts together\\n\\nThe magic happens in the back-and-forth.",
    "emoji": "💡"
  }
]

Generate ${numSlides} slides for the topic "${topic}" ${nicheContext}. Return ONLY valid JSON array.`;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { topic, niche, tone, username, numSlides = 7 } = body;

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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured in .env.local' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an elite Instagram content strategist who specializes in creating viral carousel posts. Your content has generated millions of views.

CORE PRINCIPLES:
1. HOOK FIRST - The cover slide must be impossible to ignore
2. VALUE DENSE - Every slide delivers actionable insight
3. SCROLL STOPPING - Use pattern interrupts and curiosity gaps
4. SIMPLE LANGUAGE - Grade 6 readability, no jargon
5. VISUAL THINKING - Content that works as images

You ALWAYS return valid JSON arrays. No markdown, no explanations, just JSON.`;

    const userPrompt = buildPrompt(topic, niche, tone, numSlides, username.replace('@', ''));

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
        // Return mock data for demo/testing
        return NextResponse.json({
          slides: generateMockSlides(topic, numSlides, username),
          meta: {
            topic,
            niche,
            tone,
            slideCount: numSlides,
            mock: true,
          }
        });
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return NextResponse.json(
        { error: `API Error: ${response.status}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    const text = result.content?.[0]?.text || result.completion || result.text || '';

    // Parse AI response
    let slides: Array<{ id: string; title: string; content: string; emoji: string }> = [];

    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        slides = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the whole response as JSON
        slides = JSON.parse(text);
      }
    } catch (e) {
      console.warn('JSON parsing failed, using text parsing fallback');
      slides = parseTextToSlides(text, numSlides, topic, username);
    }

    // Validate and fix slides
    slides = slides.map((slide, index) => ({
      id: `slide-${index + 1}`,
      title: slide.title?.slice(0, 100) || `Slide ${index + 1}`,
      content: slide.content?.slice(0, 500) || 'Content coming soon...',
      emoji: slide.emoji || getDefaultEmoji(index),
    }));

    // Ensure we have exactly numSlides
    while (slides.length < numSlides) {
      const i = slides.length;
      slides.push({
        id: `slide-${i + 1}`,
        title: i === 0 ? 'The Secret' : i === numSlides - 1 ? 'Your Turn' : `Tip #${i}`,
        content: i === numSlides - 1
          ? `Follow @${username} for more tips!\n\nWhich tip will you try first? Comment below 👇`
          : 'More insights coming...',
        emoji: getDefaultEmoji(i),
      });
    }

    if (slides.length > numSlides) {
      slides = slides.slice(0, numSlides);
    }

    return NextResponse.json({
      slides,
      meta: {
        topic,
        niche,
        tone,
        slideCount: slides.length,
      }
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate carousel. Please try again.' },
      { status: 500 }
    );
  }
}

function getDefaultEmoji(index: number): string {
  const emojis = ['🔥', '💡', '⚡', '🚀', '💎', '🎯', '✨', '💰', '📈', '🎉', '🤖', '🏆'];
  return emojis[index % emojis.length];
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

    // Skip code blocks and JSON brackets
    if (trimmed.startsWith('```') || trimmed === '[' || trimmed === ']') continue;

    // Check for new slide indicators
    const slideMatch = trimmed.match(/^(?:Slide\s*)?(\d+)[.:)]\s*(.+)/i);

    if (slideMatch) {
      // Save previous slide if exists
      if (currentSlide.title) {
        slides.push({
          id: `slide-${slides.length + 1}`,
          title: currentSlide.title,
          content: currentSlide.content.join('\n'),
          emoji: currentSlide.emoji || getDefaultEmoji(slides.length),
        });
      }

      // Start new slide
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

  // Don't forget the last slide
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

// Generate mock slides when API is unavailable
function generateMockSlides(topic: string, numSlides: number, username: string) {
  const topicName = topic.length > 30 ? topic.slice(0, 30) + '...' : topic;

  const slides: Array<{ id: string; title: string; content: string; emoji: string }> = [
    {
      id: 'slide-1',
      title: `Nobody talks about ${topicName}`,
      content: `99% of people get this wrong.\n\nI spent years figuring out what actually works.\n\nHere is the truth nobody tells you 👇`,
      emoji: '🔥',
    },
    {
      id: 'slide-2',
      title: 'Stop doing what everyone does',
      content: `The mainstream advice is outdated.\n\n• It wastes your time\n• It gives average results\n• It ignores the real problem\n\nThere is a better way.`,
      emoji: '⚠️',
    },
    {
      id: 'slide-3',
      title: 'The insider secret',
      content: `Top performers use a different approach:\n\n• Focus on high-leverage actions\n• Ignore the noise\n• Double down on what works\n\nSimple but not easy.`,
      emoji: '💎',
    },
    {
      id: 'slide-4',
      title: 'Your action plan',
      content: `Here is exactly what to do:\n\n1. Audit your current approach\n2. Cut what is not working\n3. Apply this framework\n4. Measure the results\n\nStart today.`,
      emoji: '🎯',
    },
    {
      id: 'slide-5',
      title: 'Your turn',
      content: `Follow @${username} for more insights.\n\nWhich tip will you try first?\n\nComment below 👇`,
      emoji: '👇',
    },
  ];

  // Adjust to requested number of slides
  if (numSlides < 5) {
    return slides.slice(0, numSlides - 1).concat(slides.slice(-1));
  } else if (numSlides > 5) {
    while (slides.length < numSlides) {
      slides.splice(slides.length - 1, 0, {
        id: `slide-${slides.length}`,
        title: `Pro tip #${slides.length - 2}`,
        content: `Implement this strategy consistently.\n\nSmall daily improvements compound into massive results over time.`,
        emoji: getDefaultEmoji(slides.length - 1),
      });
    }
  }

  return slides;
}
