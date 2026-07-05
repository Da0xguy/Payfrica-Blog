import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Post, Comment } from '../types';
import { authors, categories } from '../data';
import { 
  ArrowLeft, Calendar, Clock, Eye, ThumbsUp, Bookmark, 
  Share2, Twitter, Linkedin, Facebook, Link as LinkIcon, 
  Plus, Minus, BookOpen, Send, User, MessageSquare, 
  Sparkles, CheckCircle2, BookmarkCheck, CornerDownRight
} from 'lucide-react';

interface PostDetailProps {
  post: Post;
  posts: Post[]; // All posts, to find related ones
  onBack: () => void;
  onNavigateToPost: (slug: string) => void;
  onCategorySelect: (categorySlug: string) => void;
  onAuthorSelect: (authorName: string) => void;
}

export default function PostDetail({
  post,
  posts,
  onBack,
  onNavigateToPost,
  onCategorySelect,
  onAuthorSelect
}: PostDetailProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [claps, setClaps] = useState(post.claps);
  const [clappedTimes, setClappedTimes] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentEmail, setNewCommentEmail] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [commentReplyId, setCommentReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showCommentSuccess, setShowCommentSuccess] = useState(false);

  const articleRef = useRef<HTMLDivElement>(null);

  // Look up author
  const authorDetail = authors.find(a => a.name === post.author);
  // Look up category
  const categoryDetail = categories.find(c => c.slug === post.category) || {
    name: post.category,
    color: 'bg-gray-100',
    textColor: 'text-gray-700'
  };

  // Load and sync bookmark state, claps, views, and comments on mount
  useEffect(() => {
    // 1. Increment views on mount
    try {
      const storedPosts: Post[] = JSON.parse(localStorage.getItem('bridge_posts') || '[]');
      const updatedPosts = storedPosts.map(p => {
        if (p.id === post.id) {
          const newViews = p.views + 1;
          return { ...p, views: newViews };
        }
        return p;
      });
      localStorage.setItem('bridge_posts', JSON.stringify(updatedPosts));
      // Trigger simple state modification for views
      post.views += 1; 
    } catch (e) {
      console.error(e);
    }

    // 2. Load Bookmarks
    const bookmarks: string[] = JSON.parse(localStorage.getItem('bridge_bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(post.id));

    // 3. Load Claps
    const storedClaps: Record<string, number> = JSON.parse(localStorage.getItem('bridge_user_claps') || '{}');
    setClappedTimes(storedClaps[post.id] || 0);

    const postDb: Post[] = JSON.parse(localStorage.getItem('bridge_posts') || '[]');
    const matchingPost = postDb.find(p => p.id === post.id);
    if (matchingPost) {
      setClaps(matchingPost.claps);
    }

    // 4. Load Comments
    const allComments: Record<string, Comment[]> = JSON.parse(localStorage.getItem('bridge_comments') || '{}');
    setComments(allComments[post.id] || []);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [post.id]);

  // Handle Scroll progress and sticky table of contents active highlighting
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const element = articleRef.current;
      const totalHeight = element.clientHeight - window.innerHeight;
      const rect = element.getBoundingClientRect();
      const scrolledFromTop = -rect.top;

      if (totalHeight > 0) {
        const progress = Math.min(Math.max((scrolledFromTop / totalHeight) * 100, 0), 100);
        setScrollProgress(progress);
      }

      // Dynamic table of contents heading spy
      const headingElements = element.querySelectorAll('h1, h2, h3');
      let currentActiveId = '';
      for (let i = 0; i < headingElements.length; i++) {
        const el = headingElements[i];
        const headingRect = el.getBoundingClientRect();
        // If the heading is in the upper part of the screen, mark it active
        if (headingRect.top >= 0 && headingRect.top <= 180) {
          currentActiveId = el.textContent || '';
          break;
        } else if (headingRect.top < 0) {
          currentActiveId = el.textContent || '';
        }
      }
      if (currentActiveId) {
        setActiveHeadingId(currentActiveId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse Table of Contents headers
  const tableOfContents = useMemo(() => {
    const headers: { text: string; level: number }[] = [];
    const lines = post.content.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        headers.push({ text: trimmed.replace('# ', ''), level: 1 });
      } else if (trimmed.startsWith('## ')) {
        headers.push({ text: trimmed.replace('## ', ''), level: 2 });
      } else if (trimmed.startsWith('### ')) {
        headers.push({ text: trimmed.replace('### ', ''), level: 3 });
      }
    });
    return headers;
  }, [post.content]);

  // Handle Bookmarking
  const toggleBookmark = () => {
    const bookmarks: string[] = JSON.parse(localStorage.getItem('bridge_bookmarks') || '[]');
    let updated: string[];
    if (isBookmarked) {
      updated = bookmarks.filter(id => id !== post.id);
      setIsBookmarked(false);
    } else {
      updated = [...bookmarks, post.id];
      setIsBookmarked(true);
    }
    localStorage.setItem('bridge_bookmarks', JSON.stringify(updated));
  };

  // Handle Clapping
  const handleClap = () => {
    if (clappedTimes >= 50) return; // Medium limit

    const newClaps = claps + 1;
    const newClapped = clappedTimes + 1;

    setClaps(newClaps);
    setClappedTimes(newClapped);

    // Save post claps to posts db
    const storedPosts: Post[] = JSON.parse(localStorage.getItem('bridge_posts') || '[]');
    const updatedPosts = storedPosts.map(p => {
      if (p.id === post.id) {
        return { ...p, claps: newClaps };
      }
      return p;
    });
    localStorage.setItem('bridge_posts', JSON.stringify(updatedPosts));
    post.claps = newClaps; // sync reference

    // Save individual user claps limit
    const storedClaps: Record<string, number> = JSON.parse(localStorage.getItem('bridge_user_claps') || '{}');
    storedClaps[post.id] = newClapped;
    localStorage.setItem('bridge_user_claps', JSON.stringify(storedClaps));
  };

  // Copy share link
  const handleCopyLink = () => {
    const text = window.location.href;
    navigator.clipboard.writeText(text).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    });
  };

  // Share via Web Share API
  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this article: "${post.title}" on Payfrica Blog`,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Handle posting a comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentEmail.trim() || !newCommentText.trim()) return;

    const newComment: Comment = {
      id: 'cmt_' + Math.random().toString(36).substr(2, 9),
      authorName: newCommentName,
      authorEmail: newCommentEmail,
      content: newCommentText,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      replies: []
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);

    // Save to localStorage comments database
    const allComments: Record<string, Comment[]> = JSON.parse(localStorage.getItem('bridge_comments') || '{}');
    allComments[post.id] = updatedComments;
    localStorage.setItem('bridge_comments', JSON.stringify(allComments));

    // Clear inputs
    setNewCommentName('');
    setNewCommentEmail('');
    setNewCommentText('');
    setShowCommentSuccess(true);
    setTimeout(() => setShowCommentSuccess(false), 3000);
  };

  // Handle posting a reply
  const handlePostReply = (commentId: string) => {
    if (!replyText.trim()) return;

    const newReply: Comment = {
      id: 'rpl_' + Math.random().toString(36).substr(2, 9),
      authorName: newCommentName || 'Anonymous Builder',
      authorEmail: newCommentEmail || 'anonymous@builder.com',
      content: replyText,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      return comment;
    });

    setComments(updatedComments);

    const allComments: Record<string, Comment[]> = JSON.parse(localStorage.getItem('bridge_comments') || '{}');
    allComments[post.id] = updatedComments;
    localStorage.setItem('bridge_comments', JSON.stringify(allComments));

    setReplyText('');
    setCommentReplyId(null);
  };

  // Calculate related posts
  const relatedPosts = useMemo(() => {
    return posts
      .filter(p => p.isPublished && p.id !== post.id && p.category === post.category)
      .slice(0, 3);
  }, [posts, post.category, post.id]);

  // Render markdown parser
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    let insideTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    let insideList = false;
    let listItems: string[] = [];
    let insidePre = false;
    let preContent: string[] = [];

    const nodes: React.ReactNode[] = [];

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        nodes.push(
          <ul key={`ul-${key}`} className="list-disc pl-6 mb-6 space-y-2">
            {listItems.map((item, i) => (
              <li key={i} className="text-gray-700 leading-relaxed text-[1.05rem]" dangerouslySetInnerHTML={{ __html: parseInlineStyles(item) }}></li>
            ))}
          </ul>
        );
        listItems = [];
        insideList = false;
      }
    };

    const flushTable = (key: string) => {
      if (tableRows.length > 0) {
        nodes.push(
          <div key={`table-wrapper-${key}`} className="overflow-x-auto w-full border border-gray-100 rounded-xl mb-8">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-brand-navy uppercase bg-gray-50 border-b border-gray-100 font-display">
                <tr>
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="px-6 py-4 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-gray-50/50 bg-white">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-6 py-4 font-medium text-gray-700" dangerouslySetInnerHTML={{ __html: parseInlineStyles(cell) }}></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
        insideTable = false;
      }
    };

    const flushPre = (key: string) => {
      if (preContent.length > 0) {
        nodes.push(
          <div key={`code-block-${key}`} className="relative group bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8 font-mono text-xs overflow-x-auto text-slate-200">
            <div className="absolute top-3 right-3 text-[10px] text-gray-500 uppercase tracking-widest font-semibold bg-gray-800 px-2.5 py-1 rounded-md">
              Code Setup
            </div>
            <pre>
              <code className="block leading-relaxed">{preContent.join('\n')}</code>
            </pre>
          </div>
        );
        preContent = [];
        insidePre = false;
      }
    };

    // Helper to replace standard Markdown inline features (**bold**, `code`, [link](url)) with HTML
    const parseInlineStyles = (s: string) => {
      let html = s;
      
      // Escape HTML entities to avoid issues
      html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Render bold (**bold**)
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Render inline code (`code`)
      html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 text-gray-900 text-sm font-mono px-1.5 py-0.5 rounded-md font-semibold">$1</code>');

      // Render links ([text](url))
      html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-brand-green-dark hover:text-brand-green underline font-semibold transition-colors">$1</a>');

      return html;
    };

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const trimmed = line.trim();

      // Handle blockquotes
      if (trimmed.startsWith('> ')) {
        flushList(`bq-${index}`);
        flushTable(`bq-${index}`);
        flushPre(`bq-${index}`);
        const content = trimmed.substring(2);
        nodes.push(
          <blockquote key={`bq-${index}`} className="border-l-4 border-brand-green pl-6 py-2 my-8 font-display italic text-gray-600 text-lg">
            <p className="m-0 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInlineStyles(content) }}></p>
          </blockquote>
        );
        continue;
      }

      // Handle Code Blocks
      if (trimmed.startsWith('```')) {
        if (insidePre) {
          flushPre(`pre-${index}`);
        } else {
          flushList(`pre-${index}`);
          flushTable(`pre-${index}`);
          insidePre = true;
        }
        continue;
      }

      if (insidePre) {
        preContent.push(line);
        continue;
      }

      // Handle Headings
      if (trimmed.startsWith('# ')) {
        flushList(`h1-${index}`);
        flushTable(`h1-${index}`);
        const textContent = trimmed.replace('# ', '');
        nodes.push(
          <h1 key={`h1-${index}`} id={textContent} className="font-display font-extrabold text-3xl sm:text-4xl text-brand-navy mt-12 mb-6 tracking-tight leading-tight">
            {textContent}
          </h1>
        );
        continue;
      }

      if (trimmed.startsWith('## ')) {
        flushList(`h2-${index}`);
        flushTable(`h2-${index}`);
        const textContent = trimmed.replace('## ', '');
        nodes.push(
          <h2 key={`h2-${index}`} id={textContent} className="font-display font-bold text-2xl sm:text-3xl text-brand-navy mt-10 mb-4 tracking-tight border-b border-gray-100 pb-2">
            {textContent}
          </h2>
        );
        continue;
      }

      if (trimmed.startsWith('### ')) {
        flushList(`h3-${index}`);
        flushTable(`h3-${index}`);
        const textContent = trimmed.replace('### ', '');
        nodes.push(
          <h3 key={`h3-${index}`} id={textContent} className="font-display font-bold text-xl text-brand-navy mt-8 mb-3">
            {textContent}
          </h3>
        );
        continue;
      }

      // Handle bullet lists
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        flushTable(`list-${index}`);
        insideList = true;
        listItems.push(trimmed.substring(2));
        continue;
      }

      // Handle numbered lists (simplified as paragraphs for layout safety)
      if (/^\d+\.\s/.test(trimmed)) {
        flushList(`num-${index}`);
        flushTable(`num-${index}`);
        const content = trimmed.replace(/^\d+\.\s/, '');
        nodes.push(
          <div key={`num-${index}`} className="flex items-start space-x-3.5 mb-5 pl-1">
            <span className="font-mono font-bold text-brand-green-dark bg-brand-green-light px-2 py-0.5 rounded-md text-xs mt-0.5">{trimmed.match(/^\d+/)?.[0]}</span>
            <p className="m-0 text-gray-700 leading-relaxed text-[1.05rem]" dangerouslySetInnerHTML={{ __html: parseInlineStyles(content) }}></p>
          </div>
        );
        continue;
      }

      // Handle tables
      if (trimmed.startsWith('|')) {
        flushList(`tab-${index}`);
        insideTable = true;
        const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
        
        // Skip separator line | :--- | :--- |
        if (trimmed.includes('---')) {
          continue;
        }

        if (tableHeaders.length === 0) {
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        continue;
      }

      // If we find an empty line, flush blocks
      if (trimmed === '') {
        flushList(`empty-${index}`);
        flushTable(`empty-${index}`);
        continue;
      }

      // Default paragraph text
      if (!insideList && !insideTable && !insidePre) {
        nodes.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-6 text-[1.05rem]" dangerouslySetInnerHTML={{ __html: parseInlineStyles(trimmed) }}></p>
        );
      }
    }

    // Flush any remaining blocks
    flushList('end');
    flushTable('end');
    flushPre('end');

    return nodes;
  };

  const handleScrollToHeading = (text: string) => {
    const element = document.getElementById(text);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative space-y-8">
      
      {/* Dynamic Reading Progress Bar */}
      <div 
        className="fixed top-20 left-0 h-1 bg-brand-green z-50 transition-all duration-100 shadow-sm"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* Floating Clap/Share Toaster */}
      {showShareToast && (
        <div className="fixed bottom-8 right-8 bg-brand-navy border border-brand-navy-light text-white font-medium text-xs rounded-2xl px-5 py-3.5 shadow-2xl flex items-center space-x-2.5 z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-brand-green" />
          <span>Article link copied to clipboard!</span>
        </div>
      )}

      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-brand-navy cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog feed</span>
        </button>

        {/* Read controls: Font size */}
        <div className="flex items-center space-x-4 bg-white border border-gray-100 rounded-xl p-1.5 shadow-sm">
          {/* Size Adjuster */}
          <div className="flex items-center space-x-2 text-gray-500">
            <button 
              onClick={() => setFontSize('normal')}
              className={`p-1.5 rounded-md cursor-pointer ${fontSize === 'normal' ? 'bg-gray-100 text-brand-navy font-bold' : 'hover:bg-gray-50'}`}
              title="Normal Text"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold tracking-wider font-mono text-gray-400 uppercase">Size</span>
            <button 
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'extra-large')}
              className={`p-1.5 rounded-md cursor-pointer ${fontSize !== 'normal' ? 'bg-gray-100 text-brand-navy font-bold' : 'hover:bg-gray-50'}`}
              title="Larger Text"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Body Layout: Sideboards and Article */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Hand: Social Interactions & Stats (1 Column - Desktop Stickied) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-32 flex flex-col items-center space-y-6">
            
            {/* Clap Button */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={handleClap}
                disabled={clappedTimes >= 50}
                className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer relative group ${
                  clappedTimes > 0
                    ? 'bg-brand-green-light border-brand-green/30 text-brand-green-dark shadow-md'
                    : 'bg-white border-gray-200 text-gray-400 hover:text-brand-navy hover:border-gray-300'
                }`}
                title={`Clap for this post (${clappedTimes}/50 claps)`}
              >
                <ThumbsUp className={`w-5 h-5 ${clappedTimes > 0 ? 'scale-110 fill-brand-green' : 'group-hover:scale-110'}`} />
                
                {clappedTimes > 0 && (
                  <span className="absolute -top-3 -right-3 bg-brand-green-dark text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    +{clappedTimes}
                  </span>
                )}
              </button>
              <span className="text-[10px] text-gray-400 font-bold font-mono uppercase tracking-wider">{claps}</span>
            </div>

            {/* Bookmark button */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={toggleBookmark}
                className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-50 border-brand-gold/30 text-brand-gold-dark shadow-md'
                    : 'bg-white border-gray-200 text-gray-400 hover:text-brand-navy hover:border-gray-300'
                }`}
                title={isBookmarked ? 'Bookmarked' : 'Bookmark article'}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-brand-gold' : ''}`} />
              </button>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Save</span>
            </div>

            {/* Native Share button */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={handleWebShare}
                className="w-11 h-11 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green hover:bg-brand-green hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow"
                title="Share Article"
              >
                <Share2 className="w-5 h-5 animate-pulse" />
              </button>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Share</span>
            </div>

            <div className="w-px h-10 bg-gray-100"></div>

            {/* Social Sharing Icons */}
            <button 
              onClick={handleCopyLink} 
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 hover:border-gray-200 text-gray-400 hover:text-brand-navy flex items-center justify-center transition-all cursor-pointer" 
              title="Copy Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 hover:border-gray-200 text-gray-400 hover:text-brand-navy flex items-center justify-center transition-all"
              title="Share on X"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 hover:border-gray-200 text-gray-400 hover:text-brand-navy flex items-center justify-center transition-all"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>

          </div>
        </div>

        {/* Center Field: Deep Long-Form Article (8 Columns) */}
        <div className="lg:col-span-8 bg-white border border-gray-100/60 rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm space-y-10">
          
          {/* Article Header Metadata */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onCategorySelect(post.category)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide cursor-pointer ${categoryDetail.color} ${categoryDetail.textColor}`}
              >
                {categoryDetail.name}
              </button>

              <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{post.readTime} reading time</span>
              </div>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-brand-navy leading-none tracking-tight">
              {post.title}
            </h1>

            {/* Author card row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-y border-gray-50 py-4">
              <button
                onClick={() => onAuthorSelect(post.author)}
                className="flex items-center space-x-3 text-left cursor-pointer hover:opacity-85"
              >
                <img
                  src={authorDetail?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80"}
                  alt={post.author}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div>
                  <span className="block text-sm font-bold text-gray-800">{post.author}</span>
                  <span className="block text-xs text-gray-400 font-medium">{authorDetail?.role}</span>
                </div>
              </button>

              <div className="flex items-center space-x-4 text-xs font-mono text-gray-400">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-300" />
                  <span>{post.date}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                <span className="flex items-center space-x-1" title="Views">
                  <Eye className="w-3.5 h-3.5 text-gray-300" />
                  <span>{post.views} views</span>
                </span>
              </div>
            </div>
          </div>

          {/* Cover image banner */}
          <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-50 shadow-inner">
            <img
              src={post.coverImage}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Core Post Body Markdown content */}
          <div 
            ref={articleRef}
            className={`markdown-body font-sans ${
              fontSize === 'large' ? 'text-lg' : fontSize === 'extra-large' ? 'text-xl' : 'text-base'
            }`}
          >
            {renderMarkdown(post.content)}
          </div>

          {/* Social icons row for mobile users */}
          <div className="lg:hidden flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleClap}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-brand-green-light border border-brand-green/20 text-brand-green-dark text-xs font-bold"
              >
                <ThumbsUp className="w-4 h-4 fill-brand-green" />
                <span>{claps} claps</span>
              </button>

              <button
                onClick={toggleBookmark}
                className={`p-2.5 rounded-xl border ${isBookmarked ? 'bg-amber-50 text-brand-gold-dark border-brand-gold/30' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-brand-gold' : ''}`} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={handleWebShare} 
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-brand-green text-white hover:bg-brand-green-dark transition-colors text-xs font-bold shadow-sm cursor-pointer"
                title="Share Article"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
              <button onClick={handleCopyLink} className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-navy border border-gray-100" title="Copy Link"><LinkIcon className="w-4 h-4" /></button>
              <a href={`https://twitter.com/intent/tweet?text=${post.title}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-navy border border-gray-100" title="Share on X"><Twitter className="w-4 h-4" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-navy border border-gray-100" title="Share on LinkedIn"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Author Profile Bio Box */}
          {authorDetail && (
            <div className="p-8 bg-gray-50 border border-gray-100 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-12">
              <img
                src={authorDetail.avatar}
                alt={authorDetail.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md shrink-0"
              />
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-brand-green-dark uppercase tracking-widest">ABOUT THE AUTHOR</span>
                <h3 className="font-display font-bold text-lg text-brand-navy leading-none">{authorDetail.name}</h3>
                <span className="block text-xs font-medium text-gray-400">{authorDetail.role}</span>
                <p className="text-sm text-gray-500 leading-relaxed">{authorDetail.bio}</p>
                <div className="flex space-x-3 pt-1">
                  {authorDetail.twitter && (
                    <a href={`https://twitter.com/${authorDetail.twitter}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-gray-400 hover:text-brand-navy flex items-center space-x-1">
                      <Twitter className="w-3.5 h-3.5" />
                      <span>@{authorDetail.twitter}</span>
                    </a>
                  )}
                  {authorDetail.linkedin && (
                    <a href={`https://linkedin.com/in/${authorDetail.linkedin}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-gray-400 hover:text-brand-navy flex items-center space-x-1">
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>{authorDetail.name}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Comments Section */}
          <section className="pt-10 border-t border-gray-100 space-y-8">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-brand-navy" />
              <h3 className="font-display font-bold text-lg text-brand-navy">Discussion ({comments.length})</h3>
            </div>

            {/* Comments Thread */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-6 text-center text-sm text-gray-400">
                  No comments yet. Start the conversation below!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-4">
                    <div className="bg-gray-50/60 rounded-2xl p-5 border border-gray-100/50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-navy text-brand-green font-display font-bold text-sm flex items-center justify-center">
                            {comment.authorName[0]}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-800">{comment.authorName}</span>
                            <span className="block text-[10px] text-gray-400 font-mono font-medium">{comment.date}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setCommentReplyId(commentReplyId === comment.id ? null : comment.id)}
                          className="text-[10px] font-bold text-brand-green-dark hover:text-brand-green transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed pl-1">{comment.content}</p>
                    </div>

                    {/* Replies array */}
                    {comment.replies && comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start space-x-3 pl-8">
                        <CornerDownRight className="w-4 h-4 text-gray-300 shrink-0 mt-2" />
                        <div className="bg-gray-50/40 border border-gray-100 rounded-2xl p-4 flex-1 space-y-2">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-brand-navy-light text-brand-gold font-display font-bold text-xs flex items-center justify-center">
                              {reply.authorName[0]}
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-gray-800">{reply.authorName}</span>
                              <span className="block text-[10px] text-gray-400 font-mono">{reply.date}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed pl-1">{reply.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Active inline reply form */}
                    {commentReplyId === comment.id && (
                      <div className="pl-8 flex items-start space-x-3">
                        <CornerDownRight className="w-4 h-4 text-gray-300 shrink-0 mt-3" />
                        <div className="flex-1 space-y-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${comment.authorName}...`}
                            rows={2}
                            className="w-full text-xs bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-brand-green text-gray-800"
                          ></textarea>
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setCommentReplyId(null)}
                              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[10px] font-semibold text-gray-500 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handlePostReply(comment.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-brand-green hover:bg-brand-green-dark text-brand-navy text-[10px] font-bold cursor-pointer"
                            >
                              Post Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="space-y-4 pt-4 border-t border-gray-50">
              <h4 className="font-display font-bold text-sm text-brand-navy">Add your comment</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    placeholder="e.g. Ayo Oketona"
                    className="w-full text-sm bg-gray-50/50 border border-gray-100 hover:border-gray-200 focus:border-brand-green focus:bg-white rounded-xl p-3 focus:outline-none text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newCommentEmail}
                    onChange={(e) => setNewCommentEmail(e.target.value)}
                    placeholder="ayo@payfrica.com"
                    className="w-full text-sm bg-gray-50/50 border border-gray-100 hover:border-gray-200 focus:border-brand-green focus:bg-white rounded-xl p-3 focus:outline-none text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pl-1">Comment</label>
                <textarea
                  required
                  rows={4}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share your feedback, ask questions, or contribute to the technical discussion..."
                  className="w-full text-sm bg-gray-50/50 border border-gray-100 hover:border-gray-200 focus:border-brand-green focus:bg-white rounded-xl p-3.5 focus:outline-none text-gray-800"
                ></textarea>
              </div>

              {showCommentSuccess && (
                <div className="bg-emerald-50 text-brand-green-dark rounded-xl p-3 text-xs flex items-center space-x-2 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-brand-green-dark shrink-0" />
                  <span>Comment published successfully!</span>
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-3 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5 text-brand-green" />
                <span>Publish Comment</span>
              </button>
            </form>
          </section>

        </div>

        {/* Right Hand: Sticky TOC (3 Columns - Desktop Only) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-32 space-y-6">
            
            {/* Table of contents card */}
            {tableOfContents.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-brand-navy border-b border-gray-50 pb-2">
                  Table of Contents
                </h3>
                <nav className="space-y-2.5 max-h-96 overflow-y-auto no-scrollbar pr-1">
                  {tableOfContents.map((header, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleScrollToHeading(header.text)}
                      className={`block text-left text-xs font-medium cursor-pointer hover:text-brand-green transition-all leading-relaxed ${
                        header.level === 1 ? 'pl-0' : header.level === 2 ? 'pl-3' : 'pl-5 text-[11px]'
                      } ${
                        activeHeadingId === header.text 
                          ? 'text-brand-green-dark font-semibold border-l-2 border-brand-green pl-1.5 -ml-1.5' 
                          : 'text-gray-400'
                      }`}
                    >
                      {header.text}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Reading tip */}
            <div className="bg-brand-green-light/40 border border-brand-green-dark/10 rounded-2xl p-5 text-xs text-brand-green-dark leading-relaxed flex items-start space-x-3">
              <Sparkles className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Offline Reading Mode</span>
                This article has been cached locally in your client environment, enabling instant reading even without internet connection.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Related Posts at bottom */}
      {relatedPosts.length > 0 && (
        <section className="pt-12 border-t border-gray-100 space-y-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-brand-navy" />
            <h3 className="font-display font-extrabold text-xl text-brand-navy">Related Articles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((rel) => {
              const catDetail = categories.find(c => c.slug === rel.category);
              return (
                <div 
                  key={rel.id}
                  onClick={() => onNavigateToPost(rel.slug)}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer shadow-sm hover:shadow-lg hover:border-gray-200/80 transition-all space-y-4"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-gray-50">
                    <img 
                      src={rel.coverImage} 
                      alt={rel.title} 
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${catDetail?.color || 'bg-gray-100'} ${catDetail?.textColor || 'text-gray-500'}`}>
                      {catDetail?.name}
                    </span>
                    <h4 className="font-display font-bold text-sm text-brand-navy group-hover:text-brand-green-dark transition-colors leading-snug line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400 font-mono">
                    <span>{rel.date}</span>
                    <span>{rel.readTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
