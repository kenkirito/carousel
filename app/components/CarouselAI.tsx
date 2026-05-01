'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Download,
  Sparkles,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Hash,
  FileText,
  Wand2,
  Camera,
  CheckCircle2,
  Palette,
  Layout,
  Type,
  Share2,
  GripVertical,
  Edit3,
  Save,
  X,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NICHES, TONES, NICHE_TEMPLATES, Slide, Niche, Tone } from '@/app/types';
import { CarouselTemplate } from '@/app/types';

// Watermark component
const Watermark = () => (
  <div
    style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      padding: '8px 16px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      zIndex: 100,
    }}
  >
    <Sparkles style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
    <span
      style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#ffffff',
        letterSpacing: '0.5px',
      }}
    >
      Made with CarouselAI
    </span>
  </div>
);

// Slide Preview Component
const SlidePreview = ({
  slide,
  index,
  total,
  template,
  isFirst,
  isLast,
  username,
}: {
  slide: Slide;
  index: number;
  total: number;
  template: CarouselTemplate;
  isFirst: boolean;
  isLast: boolean;
  username: string;
}) => {
  const { style } = template;
  const isDark = style.background.includes('0a') || style.background.includes('0d') || style.background.includes('0f');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: style.background,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px',
        fontFamily: style.bodyFont,
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: style.decoration === 'gradient-blob'
            ? `radial-gradient(circle at 80% 20%, ${style.accentColor}20 0%, transparent 50%),
               radial-gradient(circle at 20% 80%, ${style.accentColor}10 0%, transparent 40%)`
            : 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: `${style.accentColor}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              border: `2px solid ${style.accentColor}50`,
            }}
          >
            {slide.emoji}
          </div>
          <div>
            <div
              style={{
                color: style.titleColor,
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              @{username}
            </div>
            <div
              style={{
                color: style.accentColor,
                fontSize: '12px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {template.niche}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '8px 16px',
            borderRadius: '50px',
            background: `${style.titleColor}15`,
            border: `1px solid ${style.titleColor}20`,
            color: style.titleColor,
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {index + 1} / {total}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '24px',
          zIndex: 10,
        }}
      >
        {/* Slide type indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: `${style.accentColor}20`,
            width: 'fit-content',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: style.accentColor,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {isFirst ? 'Hook' : isLast ? 'CTA' : 'Value'}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            color: style.titleColor,
            fontSize: isFirst ? '56px' : '44px',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            fontFamily: style.titleFont,
          }}
        >
          {slide.title}
        </h1>

        {/* Accent line */}
        <div
          style={{
            width: '60px',
            height: '4px',
            background: style.accentColor,
            borderRadius: '2px',
          }}
        />

        {/* Content */}
        <div
          style={{
            background: isFirst ? 'transparent' : `${style.titleColor}08`,
            borderRadius: '16px',
            padding: isFirst ? '0' : '24px',
            border: isFirst ? 'none' : `1px solid ${style.titleColor}10`,
          }}
        >
          <p
            style={{
              color: style.bodyColor,
              fontSize: '22px',
              lineHeight: 1.6,
              fontWeight: 400,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {slide.content}
          </p>
        </div>

        {isFirst && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px 28px',
              borderRadius: '50px',
              background: `${style.accentColor}25`,
              border: `2px solid ${style.accentColor}50`,
              color: style.titleColor,
              fontSize: '16px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              width: 'fit-content',
            }}
          >
            <Sparkles style={{ width: '18px', height: '18px' }} />
            Swipe to learn more →
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: style.titleColor,
            opacity: 0.7,
            fontSize: '14px',
          }}
        >
          <Camera style={{ width: '16px', height: '16px' }} />
          <span>@{username}</span>
        </div>

        <div
          style={{
            padding: '14px 28px',
            borderRadius: '50px',
            background: isLast
              ? `linear-gradient(135deg, ${style.accentColor}, ${style.accentColor}90)`
              : `${style.titleColor}12`,
            color: isLast ? (isDark ? '#ffffff' : '#000000') : style.titleColor,
            fontSize: '15px',
            fontWeight: 700,
            border: `2px solid ${isLast ? style.accentColor : `${style.titleColor}20`}`,
            boxShadow: isLast ? `0 8px 24px ${style.accentColor}40` : 'none',
          }}
        >
          {isLast ? '✨ Follow for more' : '💾 Save this post'}
        </div>
      </div>

      {/* Watermark */}
      <Watermark />
    </div>
  );
};

// Sortable Slide Editor Component
const SortableSlideEditor = ({
  slide,
  index,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  editedSlide,
  setEditedSlide,
}: {
  slide: Slide;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  editedSlide: Slide;
  setEditedSlide: (slide: Slide) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isFirst = index === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
    >
      {/* Slide Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-white/40" />
          </button>
          <span className="text-sm font-medium text-white/60">
            Slide {index + 1}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isFirst
                ? 'bg-pink-500/20 text-pink-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {isFirst ? 'Hook' : 'Value'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={onEdit}
                className="p-2 hover:bg-white/10 text-white/60 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-2 hover:bg-white/10 text-white/60 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Slide Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editedSlide.title}
              onChange={(e) =>
                setEditedSlide({ ...editedSlide, title: e.target.value })
              }
              placeholder="Slide title..."
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
            />
            <textarea
              value={editedSlide.content}
              onChange={(e) =>
                setEditedSlide({ ...editedSlide, content: e.target.value })
              }
              placeholder="Slide content..."
              rows={3}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 resize-none"
            />
            <input
              type="text"
              value={editedSlide.emoji}
              onChange={(e) =>
                setEditedSlide({ ...editedSlide, emoji: e.target.value })
              }
              placeholder="Emoji"
              className="w-20 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{slide.emoji}</span>
              <h4 className="text-white font-semibold">{slide.title}</h4>
            </div>
            <p className="text-white/50 text-sm line-clamp-3">{slide.content}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export Limit Counter
const ExportCounter = ({
  count,
  limit = 5,
}: {
  count: number;
  limit?: number;
}) => {
  const remaining = Math.max(0, limit - count);
  const isLimited = remaining === 0;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
        isLimited
          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
          : 'bg-white/10 text-white/80'
      }`}
    >
      <AlertCircle className="w-4 h-4" />
      <span>
        {remaining} / {limit} free exports remaining
      </span>
      {isLimited && (
        <span className="text-xs opacity-70">(Upgrade for unlimited)</span>
      )}
    </div>
  );
};

// Main Component
export default function CarouselAI() {
  // Form State
  const [topic, setTopic] = useState('');
  const [username, setUsername] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<Niche>('tech');
  const [selectedTone, setSelectedTone] = useState<Tone>('viral');
  const [numSlides, setNumSlides] = useState(7);

  // App State
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [exportCount, setExportCount] = useState(0);

  // Editing State
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editedSlide, setEditedSlide] = useState<Slide>({
    id: '',
    title: '',
    content: '',
    emoji: '',
  });

  // Refs
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get templates for selected niche
  const availableTemplates = NICHE_TEMPLATES[selectedNiche];
  const [selectedTemplate, setSelectedTemplate] = useState(availableTemplates[0]);

  // Update template when niche changes
  useState(() => {
    setSelectedTemplate(availableTemplates[0]);
  });

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const generateCarousel = async () => {
    if (!topic.trim() || !username.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          niche: selectedNiche,
          tone: selectedTone,
          username: username.replace('@', ''),
          numSlides,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to generate carousel');
        return;
      }

      setSlides(data.slides);
      setCurrentSlide(0);
      slideRefs.current = new Array(data.slides.length).fill(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && slides) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);
      setSlides(arrayMove(slides, oldIndex, newIndex));
    }
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlideId(slide.id);
    setEditedSlide({ ...slide });
  };

  const handleSaveSlide = () => {
    if (!slides || !editingSlideId) return;

    setSlides(
      slides.map((s) => (s.id === editingSlideId ? { ...editedSlide } : s))
    );
    setEditingSlideId(null);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (!slides) return;
    if (slides.length <= 3) {
      alert('Minimum 3 slides required');
      return;
    }
    setSlides(slides.filter((s) => s.id !== slideId));
  };

  const handleAddSlide = () => {
    if (!slides) return;
    if (slides.length >= 10) {
      alert('Maximum 10 slides allowed');
      return;
    }
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: 'New Slide',
      content: 'Add your content here...',
      emoji: '💡',
    };
    setSlides([...slides, newSlide]);
    slideRefs.current.push(null);
  };

  const downloadAsImages = async () => {
    if (!slides || slides.length === 0) return;

    // Check export limit
    const limit = 5;
    if (exportCount >= limit) {
      alert('Export limit reached! Upgrade to premium for unlimited exports.');
      return;
    }

    setDownloading(true);
    setDownloadSuccess(false);

    try {
      for (let i = 0; i < slides.length; i++) {
        const element = slideRefs.current[i];
        if (!element) continue;

        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });

        const link = document.createElement('a');
        link.download = `carousel-${username || 'slide'}-${i + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      setExportCount((prev) => prev + 1);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                CarouselAI
              </h1>
              <p className="text-xs text-white/40">AI-powered Instagram carousels</p>
            </div>
          </div>
          {slides && (
            <ExportCounter count={exportCount} />
          )}
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {!slides ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Create Viral Carousels
              </h2>
              <p className="text-white/50">
                AI-powered content that stops the scroll
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
              {/* Topic */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                  <Type className="w-4 h-4" />
                  Topic / Idea <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., ChatGPT for students, Morning routine tips..."
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
                />
              </div>

              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                  <User className="w-4 h-4" />
                  Instagram Handle <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-medium">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace('@', ''))
                    }
                    placeholder="yourusername"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Niche Selector */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                  <Layout className="w-4 h-4" />
                  Niche
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {NICHES.map((niche) => (
                    <button
                      key={niche.id}
                      onClick={() => {
                        setSelectedNiche(niche.id);
                        setSelectedTemplate(NICHE_TEMPLATES[niche.id][0]);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedNiche === niche.id
                          ? 'border-pink-500 bg-pink-500/10'
                          : 'border-white/10 bg-black/20 hover:border-white/30'
                      }`}
                    >
                      <div className="text-2xl mb-1">{niche.icon}</div>
                      <div className="text-white text-sm font-medium">
                        {niche.name}
                      </div>
                      <div className="text-white/40 text-xs">
                        {niche.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selector */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedTone === tone.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-black/20 hover:border-white/30'
                      }`}
                    >
                      <div className="text-white text-sm font-medium">
                        {tone.name}
                      </div>
                      <div className="text-white/40 text-xs">
                        {tone.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slides count */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                  <Hash className="w-4 h-4" />
                  Slides: <span className="text-pink-400 font-semibold">{numSlides}</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={numSlides}
                  onChange={(e) => setNumSlides(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1.5">
                  <span>3</span>
                  <span>10</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateCarousel}
                disabled={loading || !topic.trim() || !username.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating carousel...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Carousel
                  </>
                )}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: Sparkles, label: 'AI Content', desc: 'Hook-first structure' },
                { icon: ImageIcon, label: 'HD Export', desc: 'Ready to post' },
                { icon: Share2, label: 'Viral Ready', desc: 'Optimized formats' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="text-center p-4 bg-white/5 rounded-xl border border-white/5"
                >
                  <feature.icon className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                  <div className="text-white font-medium text-sm">
                    {feature.label}
                  </div>
                  <div className="text-white/40 text-xs">{feature.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* Left: Preview */}
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setSlides(null);
                    setCurrentSlide(0);
                  }}
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Create New
                </button>

                <div className="flex items-center gap-2">
                  {downloadSuccess && (
                    <span className="flex items-center gap-1.5 text-green-400 text-sm mr-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Downloaded!
                    </span>
                  )}
                  <button
                    onClick={downloadAsImages}
                    disabled={downloading || exportCount >= 5}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm hover:opacity-90 transition-all disabled:opacity-40"
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Export PNG
                  </button>
                </div>
              </div>

              {/* Template Selector */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <Palette className="w-4 h-4 text-white/40 flex-shrink-0" />
                {availableTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                      selectedTemplate.id === template.id
                        ? 'border-pink-500 text-white bg-pink-500/20'
                        : 'border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>

              {/* Slide Navigation */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="p-2.5 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-white/80 font-medium text-sm">
                  {currentSlide + 1} / {slides.length}
                </div>

                <button
                  onClick={() =>
                    setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
                  }
                  disabled={currentSlide === slides.length - 1}
                  className="p-2.5 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Main Preview */}
              <div className="relative bg-white/5 rounded-2xl p-4 border border-white/10">
                <div
                  className="overflow-hidden rounded-xl mx-auto"
                  style={{
                    width: '100%',
                    maxWidth: '540px',
                    aspectRatio: '1/1',
                  }}
                >
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      ref={(el) => {
                        slideRefs.current[index] = el;
                      }}
                      className={index === currentSlide ? 'block' : 'hidden'}
                      style={{
                        width: '1080px',
                        height: '1080px',
                        transform: 'scale(0.5)',
                        transformOrigin: 'top left',
                      }}
                    >
                      <SlidePreview
                        slide={slide}
                        index={index}
                        total={slides.length}
                        template={selectedTemplate}
                        isFirst={index === 0}
                        isLast={index === slides.length - 1}
                        username={username}
                      />
                    </div>
                  ))}
                </div>

                {/* Thumbnails */}
                <div className="flex items-center justify-center gap-2 overflow-x-auto py-4 mt-4 border-t border-white/10">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(index)}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-lg transition-all border-2 ${
                        index === currentSlide
                          ? 'border-pink-500 bg-pink-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      {slide.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Slides
                </h3>
                <button
                  onClick={handleAddSlide}
                  disabled={slides.length >= 10}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                  Add Slide
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={slides.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {slides.map((slide, index) => (
                      <SortableSlideEditor
                        key={slide.id}
                        slide={slide}
                        index={index}
                        isEditing={editingSlideId === slide.id}
                        onEdit={() =>
                          editingSlideId === slide.id
                            ? setEditingSlideId(null)
                            : handleEditSlide(slide)
                        }
                        onSave={handleSaveSlide}
                        onDelete={() => handleDeleteSlide(slide.id)}
                        editedSlide={editedSlide}
                        setEditedSlide={setEditedSlide}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Tip */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-400 text-sm">
                  <span className="font-semibold">Pro tip:</span> Drag slides to
                  reorder. Click the edit button to modify content. The hook
                  (first slide) is most important for stopping the scroll!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
