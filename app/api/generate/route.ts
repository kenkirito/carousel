import { NextRequest, NextResponse } from 'next/server';
import { Niche, Tone, NICHES, TONES, Slide } from '@/app/types';

// Mark as Edge Runtime for better performance
export const runtime = 'edge';
export const maxDuration = 60;

interface GenerateRequest {
  topic: string;
  niche: Niche;
  tone: Tone;
  username: string;
  numSlides?: number;
}

// NICHE CONTEXT - curated high-quality templates
const NICHE_INTEL: Record<Niche, {
  hooks: string[][];
  insights: string[][];
  ctas: string[][];
  emojis: string[];
}> = {
  tech: {
    hooks: [
      ['The AI secret nobody shares', 'This changes everything 👇', '🔥'],
      ['Stop building AI wrong', 'Most devs waste months here', '⚠️'],
      ['ChatGPT is tutorial hell 2.0', 'Build APIs instead', '🤖'],
      ['Your AI workflow is broken', 'Fix this one thing today', '🔧'],
      ['Context beats prompt engineering', 'Feed code, not prompts', '🧠'],
    ],
    insights: [
      ['Ship today, perfect later', 'Deployed beats perfect every time', '⚡'],
      ['Automate the boring 80%', 'Script once, run forever', '🤖'],
      ['Stop learning, start building', 'Execution beats theory', '🚀'],
      ['Your stack is too complex', 'Fewer tools, more shipping', '🛠️'],
      ['Debug with AI at 3am', 'Never get stuck again', '🌙'],
      ['Build systems, not features', 'Compound your efforts', '⚙️'],
      ['API first, interface later', 'Start with the contract', '📋'],
    ],
    ctas: [
      ['Which tip will you use?', 'Follow @%s for more 🔥'],
      ['Save this before it is gone', 'Follow @%s for daily tips 💾'],
      ['Tag a dev who needs this', 'Follow @%s for threads 👇'],
    ],
    emojis: ['💡', '⚡', '🚀', '🤖', '🔧', '🧠', '⚙️', '🌙'],
  },
  doctor: {
    hooks: [
      ['I suffered chronic fatigue', 'This one change fixed everything', '🔥'],
      ['Your sleep is killing you', 'Science says fix this first', '⚠️'],
      ['Doctors do not talk about this', 'Prevention beats prescriptions', '🏥'],
      ['My brain fog finally lifted', 'After three years of suffering', '💭'],
      ['The metabolism secret', 'What 90% get wrong', '🔬'],
    ],
    insights: [
      ['Fix your sleep first', 'Everything else follows', '😴'],
      ['Walk 8k steps daily', 'Movement is medicine', '🚶'],
      ['Drop bedroom temp 4 degrees', 'Sleep through the night', '🌡️'],
      ['Eat protein within 30 min', 'Wake up with energy', '🥚'],
      ['Morning sun resets cortisol', 'Fix your circadian rhythm', '☀️'],
      ['Your gut controls your mood', 'Heal from the inside', '🦠'],
      ['Cold showers boost immunity', 'Start with 30 seconds', '🚿'],
    ],
    ctas: [
      ['Ready to optimize your health?', 'Follow @%s for daily tips 🏥'],
      ['Which habit will you start?', 'Follow @%s for more 💪'],
      ['Tag someone who needs this', 'Follow @%s for health threads 👇'],
    ],
    emojis: ['💪', '🧬', '❤️', '🥗', '😴', '🌿', '⚡', '🔬'],
  },
  business: {
    hooks: [
      ['Revenue is vanity, profit is sanity', 'Focus on what matters', '💰'],
      ['Your startup is dying', 'Fix cash flow today', '🚨'],
      ['I fired my first client', 'Best decision I ever made', '✂️'],
      ['Scale through systems', 'Not through hustle', '⚙️'],
      ['The 80/20 rule for business', '20%% effort, 80%% results', '📊'],
    ],
    insights: [
      ['Hire slow, fire fast', 'One bad hire kills culture', '👥'],
      ['Say no to grow', 'Focus beats scattered efforts', '🎯'],
      ['Raise prices 30%% today', 'Premium clients, less stress', '💎'],
      ['Automate invoicing first', 'Cash flow matters most', '📧'],
      ['Document every process', 'Build a sellable business', '📚'],
      ['One channel, go deep', 'Stop chasing shiny objects', '🎣'],
      ['Delegate or drown', 'You cannot scale alone', '🏊'],
    ],
    ctas: [
      ['Which tactic will you try?', 'Follow @%s for more 💰'],
      ['Save this for later', 'Follow @%s for business tips 💼'],
      ['Share with a founder', 'Follow @%s for growth threads 👇'],
    ],
    emojis: ['📈', '💰', '🎯', '💼', '📊', '🚀', '⚡', '💎'],
  },
  festival: {
    hooks: [
      ['Traditions evolve, values remain', 'Modern celebrations matter too', '✨'],
      ['I stopped buying gifts', 'Family loved this instead', '🎁'],
      ['Virtual Diwali changed everything', 'Distance cannot break bonds', '🪔'],
      ['Minimal decor, maximum joy', 'Less really is more', '🌸'],
      ['The festival secret', 'Presence over presents', '🎉'],
    ],
    insights: [
      ['Handmade beats expensive', 'Thought matters most', '🎨'],
      ['Cook together, eat slow', 'Memories over menus', '🍲'],
      ['Call distant relatives', 'Voice beats text', '📞'],
      ['Share stories, not stuff', 'Legacy lives on', '📖'],
      ['Dress up, feel special', 'Tradition creates belonging', '👗'],
      ['Light diyas at home', 'Small rituals, big meaning', '🕯️'],
      ['Give experiences, not things', 'Joy lasts longer', '🎭'],
    ],
    ctas: [
      ['How do you celebrate?', 'Follow @%s for more traditions 🎉'],
      ['Save for next festival', 'Follow @%s for ideas 💾'],
      ['Tag your festival crew', 'Follow @%s for culture threads 👇'],
    ],
    emojis: ['🎉', '✨', '🪔', '🎊', '🌸', '🕯️', '🎁', '🎭'],
  },
  'personal-brand': {
    hooks: [
      ['I grew to 100k in 6 months', 'This is what worked', '🚀'],
      ['Your content is invisible', 'Fix this one thing', '👁️'],
      ['Stop posting, start engaging', 'Community beats audience', '💬'],
      ['The creator economy lie', 'You do not need millions', '💰'],
      ['Authenticity is your algorithm hack', 'Be real, grow fast', '🔥'],
    ],
    insights: [
      ['Reply to every comment', 'Engagement compounds faster', '💬'],
      ['Niche down to blow up', 'Specificity wins', '🎯'],
      ['Document, do not create', 'Share the journey', '📝'],
      ['Post when they scroll', 'Timing matters more', '⏰'],
      ['One platform, master it', 'Before expanding elsewhere', '📱'],
      ['Tell stories, not facts', 'Emotion drives shares', '📖'],
      ['Consistency beats virality', 'Show up daily', '📅'],
    ],
    ctas: [
      ['What will you create today?', 'Follow @%s for more tips 🚀'],
      ['Save this before it is gone', 'Follow @%s for growth 💾'],
      ['Tag an aspiring creator', 'Follow @%s for threads 👇'],
    ],
    emojis: ['🚀', '💬', '📈', '✨', '🎯', '📱', '🔥', '💎'],
  },
};

// Simple hash function for deterministic selection
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Generate carousel using curated templates + AI-style variation
function generateCarousel(topic: string, niche: Niche, tone: Tone, username: string, numSlides: number): Slide[] {
  const intel = NICHE_INTEL[niche];
  const hash = hashString(`${topic}:${tone}:${Date.now()}`);

  // Select hook based on hash for variety
  const hookIndex = hash % intel.hooks.length;
  const hook = intel.hooks[hookIndex];

  const slides: Slide[] = [
    {
      id: 'slide-1',
      title: hook[0],
      content: hook[1],
      emoji: hook[2],
      tag: 'HOOK',
    },
  ];

  // Select value slides - use different indices for variety
  const numValueSlides = numSlides - 2;
  const usedIndices = new Set<number>();

  for (let i = 0; i < numValueSlides; i++) {
    let idx = (hash + i * 7) % intel.insights.length;
    while (usedIndices.has(idx)) {
      idx = (idx + 1) % intel.insights.length;
    }
    usedIndices.add(idx);

    const insight = intel.insights[idx];
    // Personalize the insight with the topic
    const title = insight[0].includes('%s')
      ? insight[0].replace('%s', topic)
      : insight[0];

    slides.push({
      id: `slide-${i + 2}`,
      title,
      content: insight[1],
      emoji: intel.emojis[idx % intel.emojis.length],
      tag: 'VALUE',
    });
  }

  // Select CTA
  const ctaIndex = hash % intel.ctas.length;
  const cta = intel.ctas[ctaIndex];

  slides.push({
    id: `slide-${numSlides}`,
    title: cta[0],
    content: cta[1].replace('%s', username.replace('@', '')),
    emoji: '👇',
    tag: 'CTA',
  });

  return slides;
}

// Optional: Enhance with Claude if available
async function enhanceWithClaude(
  topic: string,
  niche: Niche,
  tone: Tone,
  slides: Slide[],
  apiKey: string
): Promise<Slide[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s max

    const nicheContext: Record<Niche, string> = {
      tech: 'tech professionals, developers, startup founders',
      doctor: 'health-conscious individuals, patients, wellness seekers',
      festival: 'families, cultural enthusiasts, celebration planners',
      business: 'entrepreneurs, business owners, executives',
      'personal-brand': 'content creators, influencers, personal brand builders',
    };

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
        max_tokens: 1024,
        temperature: 0.7,
        system: `You improve Instagram carousel content. Make it punchier and more specific to "${topic}".

RULES:
- Headlines: MAX 8 words
- Subtext: MAX 12 words
- Topic-specific, not generic
- Keep the same structure (Hook, Value, CTA)`,
        messages: [{
          role: 'user',
          content: `Improve these slides for ${niche} audience about "${topic}".
Current slides:
${slides.map((s, i) => `${i + 1}. ${s.title} / ${s.content}`).join('\n')}

Return EXACTLY ${slides.length} slides as JSON:
[{"headline":"...","subtext":"...","emoji":"🔥"}]

Make headlines punchier and subtext more specific to ${topic}.`
        }]
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
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length >= slides.length) {
        return parsed.slice(0, slides.length).map((slide: any, index: number) => ({
          id: `slide-${index + 1}`,
          title: (slide.headline || slide.title || slides[index].title).slice(0, 60),
          content: (slide.subtext || slide.content || slides[index].content).slice(0, 80),
          emoji: slide.emoji || slides[index].emoji,
          tag: slides[index].tag,
        }));
      }
    }
  } catch (error) {
    console.log('Claude enhancement failed, using curated content');
  }

  return slides;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { topic, niche, tone, username, numSlides = 5 } = body;

    // Validation
    if (!topic?.trim()) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }
    if (!username?.trim()) {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }
    if (!niche || !NICHES.find(n => n.id === niche)) {
      return NextResponse.json({ error: 'Valid niche is required.' }, { status: 400 });
    }
    if (!tone || !TONES.find(t => t.id === tone)) {
      return NextResponse.json({ error: 'Valid tone is required.' }, { status: 400 });
    }

    // Generate curated content first (fast)
    let slides = generateCarousel(topic, niche, tone, username.replace('@', ''), numSlides);

    // Try to enhance with Claude if available (async, won't block)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const enhanced = await enhanceWithClaude(topic, niche, tone, slides, apiKey);
        slides = enhanced;
      } catch (e) {
        // Keep curated content if enhancement fails
      }
    }

    return NextResponse.json({
      slides,
      meta: {
        topic,
        niche,
        tone,
        slideCount: slides.length,
        source: apiKey ? 'enhanced' : 'curated',
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
