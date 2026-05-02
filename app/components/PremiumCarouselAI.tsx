'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Edit3,
  Save,
  X,
  Trash2,
  Plus,
  Wand2,
  Layout,
  Hash,
  User,
  Type,
  CheckCircle2,
  RefreshCw,
  Palette,
  Zap,
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
import { sessionMemory } from '@/app/lib/content-engine';

// ============================================================================
// GLASSMORPHISM COMPONENTS
// ============================================================================

const GlassCard = ({ children, className = '', hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl
      ${hover ? 'transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10' : ''}
      ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
    {children}
  </motion.div>
);

const GradientButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}) => {
  const variants = {
    primary: 'from-pink-500 via-purple-500 to-indigo-500 hover:shadow-purple-500/25',
    secondary: 'from-white/20 to-white/10 hover:shadow-white/10',
    danger: 'from-red-500 to-red-600 hover:shadow-red-500/25',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white
        bg-gradient-to-r ${variants[variant]} transition-all duration-300
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
        shadow-lg ${className}`}
    >
      <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
      <span className="relative flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
};

const FloatingLabel = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2"
  >
    {children}
  </motion.div>
);

// ============================================================================
// PREMIUM SLIDE PREVIEW
// ============================================================================

const PremiumSlidePreview = ({
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
        padding: '50px',
        fontFamily: style.bodyFont,
      }}
    >
      {/* Animated Background Effects */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-1/2 -right-1/2 w-full h-full opacity-20"
        style={{
          background: `radial-gradient(circle at center, ${style.accentColor}40 0%, transparent 70%)`,
        }}
      />

      {/* Glass Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            style={{
              background: `${style.accentColor}30`,
              border: `2px solid ${style.accentColor}50`,
            }}
          >
            {slide.emoji}
          </motion.div>
          <div>
            <div style={{ color: style.titleColor }} className="font-bold text-sm">@{username}</div>
            <div style={{ color: style.accentColor }} className="text-xs uppercase tracking-wider">{template.niche}</div>
          </div>
        </div>

        <div
          className="px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md"
          style={{
            background: `${style.titleColor}15`,
            border: `1px solid ${style.titleColor}20`,
            color: style.titleColor,
          }}
        >
          {index + 1} / {total}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-5">
        {/* Slide Type Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full w-fit"
          style={{
            background: `${style.accentColor}20`,
            border: `1px solid ${style.accentColor}40`,
          }}
        >
          <span style={{ color: style.accentColor }} className="text-xs font-bold uppercase tracking-wider">
            {isFirst ? 'Hook' : isLast ? 'CTA' : 'Value'}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            color: style.titleColor,
            fontFamily: style.titleFont,
            fontSize: isFirst ? '52px' : '40px',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {slide.title}
        </motion.h1>

        {/* Animated Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="h-1 rounded-full"
          style={{ background: style.accentColor }}
        />

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5 backdrop-blur-sm"
          style={{
            background: isFirst ? 'transparent' : `${style.titleColor}08`,
            border: isFirst ? 'none' : `1px solid ${style.titleColor}15`,
          }}
        >
          <p
            style={{
              color: style.bodyColor,
              fontSize: '20px',
              lineHeight: 1.6,
              fontWeight: 400,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {slide.content}
          </p>
        </motion.div>

        {isFirst && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full w-fit text-sm font-semibold"
            style={{
              background: `${style.accentColor}25`,
              border: `2px solid ${style.accentColor}50`,
              color: style.titleColor,
            }}
          >
            <Sparkles className="w-4 h-4" />
            Swipe to learn more →
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto pt-6 flex items-center justify-between">
        <span style={{ color: style.titleColor }} className="text-sm opacity-70">@{username}</span>
        <div
          className="px-5 py-2 rounded-full text-sm font-bold"
          style={{
            background: isLast ? style.accentColor : `${style.titleColor}15`,
            color: isLast ? '#000' : style.titleColor,
          }}
        >
          {isLast ? '✨ Follow for more' : '💾 Save this'}
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md flex items-center gap-1.5 z-20">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span className="text-xs font-medium text-white">CarouselAI</span>
      </div>
    </div>
  );
};

// ============================================================================
// SORTABLE SLIDE EDITOR
// ============================================================================

const SortableSlideEditor = ({
  slide,
  index,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  editedSlide,
  setEditedSlide,
  isFirst,
  isLast,
}: {
  slide: Slide;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  editedSlide: Slide;
  setEditedSlide: (slide: Slide) => void;
  isFirst: boolean;
  isLast: boolean;
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
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
      className="group"
    >
      <GlassCard className="mb-3" hover>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                {...attributes}
                {...listeners}
                className="p-2 rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors"
              >
                <GripVertical className="w-4 h-4 text-white/40" />
              </button>
              <span className="text-sm font-medium text-white/60">Slide {index + 1}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isFirst
                    ? 'bg-pink-500/20 text-pink-400'
                    : isLast
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {isFirst ? 'Hook' : isLast ? 'CTA' : 'Value'}
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isEditing ? (
                <>
                  <button onClick={onSave} className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={onEdit} className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onEdit} className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedSlide.title}
                onChange={(e) => setEditedSlide({ ...editedSlide, title: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                placeholder="Slide title..."
              />
              <textarea
                value={editedSlide.content}
                onChange={(e) => setEditedSlide({ ...editedSlide, content: e.target.value })}
                rows={3}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none"
                placeholder="Slide content..."
              />
              <input
                type="text"
                value={editedSlide.emoji}
                onChange={(e) => setEditedSlide({ ...editedSlide, emoji: e.target.value })}
                className="w-16 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-center text-lg"
                placeholder="😊"
              />
            </div>
          ) : (
            <div className="space-y-2 cursor-pointer" onClick={onEdit}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{slide.emoji}</span>
                <h4 className="text-white font-semibold text-sm leading-tight">{slide.title}</h4>
              </div>
              <p className="text-white/40 text-xs line-clamp-2 ml-10">{slide.content}</p>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PremiumCarouselAI() {
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
  const [exportCount, setExportCount] = useState(0);
  const [generationMeta, setGenerationMeta] = useState<any>(null);

  // Editing State
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editedSlide, setEditedSlide] = useState<Slide>({ id: '', title: '', content: '', emoji: '' });

  // Templates
  const availableTemplates = NICHE_TEMPLATES[selectedNiche];
  const [selectedTemplate, setSelectedTemplate] = useState(availableTemplates[0]);

  // Refs
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load session memory
  useEffect(() => {
    const userId = 'user_' + (username || 'anonymous');
    const lastGen = sessionMemory.getLastGeneration(userId);
    if (lastGen) {
      setExportCount(lastGen.exportCount || 0);
    }
  }, [username]);

  // Update template when niche changes
  useEffect(() => {
    setSelectedTemplate(availableTemplates[0]);
  }, [selectedNiche, availableTemplates]);

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
          userId: 'user_' + username,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to generate carousel');
        return;
      }

      setSlides(data.slides);
      setGenerationMeta(data.meta);
      setCurrentSlide(0);
      slideRefs.current = new Array(data.slides.length).fill(null);

      // Save to session memory
      sessionMemory.setLastGeneration('user_' + username, {
        topic,
        niche: selectedNiche,
        tone: selectedTone,
        slideCount: numSlides,
      });
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
    setSlides(slides.map((s) => (s.id === editingSlideId ? { ...editedSlide } : s)));
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
    if (exportCount >= 5) {
      alert('Export limit reached! Upgrade for unlimited exports.');
      return;
    }

    setDownloading(true);
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

      const newCount = exportCount + 1;
      setExportCount(newCount);
      sessionMemory.setLastGeneration('user_' + username, {
        exportCount: newCount,
      });
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const regenerateWithVariation = () => {
    generateCarousel();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[200px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 shadow-lg shadow-purple-500/25">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                CarouselAI
              </h1>
              <p className="text-xs text-white/40">Premium Instagram Content Studio</p>
            </div>
          </div>

          {slides && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-white/70">{5 - exportCount} exports left</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {!slides ? (
          // Input Panel
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
                Create Viral Carousels
              </h2>
              <p className="text-white/50 text-lg">AI-powered content that stops the scroll</p>
            </motion.div>

            <GlassCard className="p-8" hover>
              <div className="space-y-6">
                {/* Topic */}
                <div>
                  <FloatingLabel>
                    <Type className="w-4 h-4" />
                    Topic / Idea <span className="text-pink-400">*</span>
                  </FloatingLabel>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., ChatGPT for students, Morning routine tips..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Username */}
                <div>
                  <FloatingLabel>
                    <User className="w-4 h-4" />
                    Instagram Handle <span className="text-pink-400">*</span>
                  </FloatingLabel>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 font-medium">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                      placeholder="yourusername"
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pl-12 pr-5 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Niche Selection */}
                <div>
                  <FloatingLabel>
                    <Layout className="w-4 h-4" />
                    Select Niche
                  </FloatingLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {NICHES.map((niche) => (
                      <motion.button
                        key={niche.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedNiche(niche.id);
                          setSelectedTemplate(NICHE_TEMPLATES[niche.id][0]);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedNiche === niche.id
                            ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/10'
                            : 'border-white/10 bg-black/20 hover:border-white/30'
                        }`}
                      >
                        <div className="text-2xl mb-2">{niche.icon}</div>
                        <div className="text-white text-sm font-medium">{niche.name}</div>
                        <div className="text-white/40 text-xs">{niche.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Tone Selection */}
                <div>
                  <FloatingLabel>
                    <Sparkles className="w-4 h-4" />
                    Content Tone
                  </FloatingLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {TONES.map((tone) => (
                      <motion.button
                        key={tone.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTone(tone.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedTone === tone.id
                            ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                            : 'border-white/10 bg-black/20 hover:border-white/30'
                        }`}
                      >
                        <div className="text-white text-sm font-medium">{tone.name}</div>
                        <div className="text-white/40 text-xs">{tone.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Slides Count */}
                <div>
                  <FloatingLabel>
                    <Hash className="w-4 h-4" />
                    Number of Slides: <span className="text-pink-400 font-semibold">{numSlides}</span>
                  </FloatingLabel>
                  <input
                    type="range"
                    min={3}
                    max={10}
                    value={numSlides}
                    onChange={(e) => setNumSlides(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-2">
                    <span>3</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Generate Button */}
                <GradientButton
                  onClick={generateCarousel}
                  disabled={loading || !topic.trim() || !username.trim()}
                  className="w-full py-4 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating magic...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Carousel
                    </>
                  )}
                </GradientButton>
              </div>
            </GlassCard>
          </div>
        ) : (
          // Editor Panel
          <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
            {/* Left: Preview */}
            <div className="flex flex-col gap-4">
              {/* Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSlides(null);
                    setCurrentSlide(0);
                  }}
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  New Carousel
                </button>

                <div className="flex items-center gap-2">
                  <GradientButton
                    onClick={regenerateWithVariation}
                    disabled={loading}
                    variant="secondary"
                    className="px-4 py-2 text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Variation
                  </GradientButton>

                  <GradientButton
                    onClick={downloadAsImages}
                    disabled={downloading || exportCount >= 5}
                    className="px-4 py-2 text-sm"
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Export
                  </GradientButton>
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

              {/* Main Preview */}
              <GlassCard className="flex-1 p-6 flex items-center justify-center">
                <div className="relative" style={{ width: '100%', maxWidth: '500px', aspectRatio: '1/1' }}>
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}
                  >
                    <div style={{ width: '1000px', height: '1000px' }}>
                      {slides.map((slide, index) => (
                        <div
                          key={slide.id}
                          ref={(el) => {
                            slideRefs.current[index] = el;
                          }}
                          className={index === currentSlide ? 'block' : 'hidden'}
                          style={{ width: '100%', height: '100%' }}
                        >
                          <PremiumSlidePreview
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
                  </div>
                </div>
              </GlassCard>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="p-3 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all border ${
                        index === currentSlide
                          ? 'border-pink-500 bg-pink-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      {slide.emoji}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                  className="p-3 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right: Editor */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Slides
                </h3>
                <GradientButton
                  onClick={handleAddSlide}
                  disabled={slides.length >= 10}
                  variant="secondary"
                  className="px-3 py-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Slide
                </GradientButton>
              </div>

              <div className="flex-1 overflow-hidden">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 h-full overflow-y-auto pr-2">
                      <AnimatePresence>
                        {slides.map((slide, index) => (
                          <SortableSlideEditor
                            key={slide.id}
                            slide={slide}
                            index={index}
                            isEditing={editingSlideId === slide.id}
                            onEdit={() =>
                              editingSlideId === slide.id ? setEditingSlideId(null) : handleEditSlide(slide)
                            }
                            onSave={handleSaveSlide}
                            onDelete={() => handleDeleteSlide(slide.id)}
                            editedSlide={editedSlide}
                            setEditedSlide={setEditedSlide}
                            isFirst={index === 0}
                            isLast={index === slides.length - 1}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Tips */}
              <GlassCard className="p-4 border-l-4 border-l-blue-500">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-400 text-sm font-medium mb-1">Pro Tip</p>
                    <p className="text-white/60 text-sm">
                      Drag to reorder. The hook (first slide) is critical for stopping the scroll.
                      Test different variations for maximum engagement.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
