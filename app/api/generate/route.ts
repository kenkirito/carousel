import { NextRequest, NextResponse } from 'next/server';
import { Niche, Tone, NICHES, TONES, Slide } from '@/app/types';
import { generateCarouselV2, validateCarousel } from '@/app/lib/content-engine-v2';

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

    // Generate carousel using content-engine-v2
    const handle = username.replace('@', '');
    const slideContents = generateCarouselV2(topic, niche, tone, handle, numSlides);

    // Validate the generated content
    const validation = validateCarousel(slideContents);
    if (!validation.valid) {
      console.warn('Carousel validation issues:', validation.issues);
    }

    // Convert SlideContent to Slide format
    const slides: Slide[] = slideContents.map((slide, index) => ({
      id: `slide-${index + 1}`,
      title: slide.headline,
      content: slide.subtext,
      emoji: slide.emoji,
      tag: index === 0 ? 'HOOK' : index === slideContents.length - 1 ? 'CTA' : 'VALUE',
    }));

    const responseData = {
      slides,
      meta: {
        topic,
        niche,
        tone,
        slideCount: slides.length,
        valid: validation.valid,
        issues: validation.issues,
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

