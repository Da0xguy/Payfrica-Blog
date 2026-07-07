import { useState, useMemo, useEffect, FormEvent } from 'react';
import { Post, Category, Author } from '../types';
import { categories, authors } from '../data';
import { motion } from 'motion/react';
import { 
  BarChart3, Plus, Search, Eye, ThumbsUp, Calendar, 
  Trash2, Edit, CheckSquare, Square, Save, 
  EyeOff, RefreshCw, Layers, Users, Mail, BookOpen, 
  FileText, ArrowLeft, Globe, Key, AlertTriangle, Sparkles 
} from 'lucide-react';

interface AdminPanelProps {
  posts: Post[];
  onSavePost: (post: Post) => void;
  onDeletePost: (id: string) => void;
  onClose: () => void;
}

export default function AdminPanel({ posts, onSavePost, onDeletePost, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'analytics' | 'subscribers'>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('product');
  const [author, setAuthor] = useState(authors[0].name);
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Form error & preview toggles
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');

  // Newsletter subscribers state
  const [subscribers, setSubscribers] = useState<string[]>([]);

  useEffect(() => {
    // Load subscribers on mount
    const subs: string[] = JSON.parse(localStorage.getItem('bridge_newsletter_subscribers') || '[]');
    setSubscribers(subs);
  }, []);

  // Preset Unsplash cover images for easy selection
  const imagePresets = [
    { name: "Fintech Grid", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80" },
    { name: "Blockchain Charts", url: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80" },
    { name: "Global Finance", url: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=800&auto=format&fit=crop&q=80" },
    { name: "Server Nodes", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80" },
    { name: "Legal Compliance", url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80" },
    { name: "Mobile Development", url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80" },
  ];

  // Auto slugify when title changes (only for new posts)
  useEffect(() => {
    if (!editPostId) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens
      setSlug(generatedSlug);
    }
  }, [title, editPostId]);

  // Analytics Computations
  const analytics = useMemo(() => {
    let totalViews = 0;
    let totalClaps = 0;
    posts.forEach(p => {
      totalViews += p.views || 0;
      totalClaps += p.claps || 0;
    });

    const categoryViews: Record<string, number> = {};
    posts.forEach(p => {
      categoryViews[p.category] = (categoryViews[p.category] || 0) + p.views;
    });

    return {
      totalPosts: posts.length,
      publishedCount: posts.filter(p => p.isPublished).length,
      draftsCount: posts.filter(p => !p.isPublished).length,
      totalViews,
      totalClaps,
      categoryViews
    };
  }, [posts]);

  // Filter posts inside Admin panel
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const query = searchQuery.toLowerCase();
      const matchesTitle = post.title.toLowerCase().includes(query);
      const matchesAuthor = post.author.toLowerCase().includes(query);
      const matchesCategory = post.category.toLowerCase().includes(query);
      return matchesTitle || matchesAuthor || matchesCategory;
    });
  }, [posts, searchQuery]);

  // Handle Edit click
  const handleEditPost = (post: Post) => {
    setEditPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setCoverImage(post.coverImage);
    setCategory(post.category);
    setAuthor(post.author);
    setTagsInput(post.tags.join(', '));
    setContent(post.content);
    setIsPublished(post.isPublished);
    setIsFeatured(!!post.isFeatured);
    
    setIsEditing(true);
    setEditorMode('write');
    setFormError('');
  };

  // Launch Create new form
  const handleCreateNew = () => {
    setEditPostId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setCoverImage(imagePresets[0].url); // default to first preset
    setCategory('product');
    setAuthor(authors[0].name);
    setTagsInput('stablecoins, remittance');
    setContent(`# New Title Here\n\nWrite article content here. You can use markdown headers, **bold text**, tables and code blocks.\n\n## Section 1\n\nContent...`);
    setIsPublished(true);
    setIsFeatured(false);
    
    setIsEditing(true);
    setEditorMode('write');
    setFormError('');
  };

  // Save Post Form Submit
  const handleSaveForm = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !excerpt.trim() || !content.trim()) {
      setFormError('Please fill out all mandatory fields (Title, Slug, Excerpt, Content).');
      return;
    }

    // Check slug duplicates (if new post or editing slug of existing)
    const duplicate = posts.find(p => p.slug === slug && p.id !== editPostId);
    if (duplicate) {
      setFormError(`The slug &quot;${slug}&quot; is already in use by another article.`);
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t !== '');

    const savedPost: Post = {
      id: editPostId || 'post_' + Math.random().toString(36).substr(2, 9),
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || imagePresets[0].url,
      category,
      author,
      date: editPostId 
        ? (posts.find(p => p.id === editPostId)?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
        : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: Math.max(Math.ceil(content.split(/\s+/).length / 200), 1) + ' min read',
      tags,
      views: editPostId ? (posts.find(p => p.id === editPostId)?.views || 0) : 0,
      claps: editPostId ? (posts.find(p => p.id === editPostId)?.claps || 0) : 0,
      isFeatured,
      isPublished
    };

    onSavePost(savedPost);
    setFormSuccess(true);
    setFormError('');
    
    setTimeout(() => {
      setFormSuccess(false);
      setIsEditing(false);
    }, 1500);
  };

  const handleDeleteSubscriber = (email: string) => {
    const updated = subscribers.filter(s => s !== email);
    setSubscribers(updated);
    localStorage.setItem('bridge_newsletter_subscribers', JSON.stringify(updated));
  };

  // Quick state toggle helper directly from table
  const handleTogglePublishState = (post: Post) => {
    const updated: Post = {
      ...post,
      isPublished: !post.isPublished
    };
    onSavePost(updated);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-md space-y-8">
      
      {/* 1. Header Admin banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-brand-navy text-brand-green font-display font-bold text-xs">
              CS
            </span>
            <span className="text-xs font-semibold text-brand-green-dark uppercase tracking-widest font-mono">Bridge Creator Studio</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-navy">
            Manage your blog assets
          </h1>
          <p className="text-xs text-gray-500">
            Write technical articles, inspect real-time user claps/views, and list newsletter subscribers in this full CRM/CMS playground.
          </p>
        </div>

        <div className="flex space-x-3 w-full sm:w-auto">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 border border-gray-200 text-xs font-semibold text-gray-500 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Close Dashboard</span>
          </button>
          
          {!isEditing && (
            <button
              onClick={handleCreateNew}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4.5 py-2.5 bg-brand-green hover:bg-brand-green-dark text-brand-navy text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Article</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Editor Overlay Form */}
      {isEditing ? (
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-navy">
              <Sparkles className="w-4 h-4 text-brand-green-dark animate-spin" />
              <span>{editPostId ? `Editing: ${title}` : 'Composing New Article'}</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-0.5">
              <button
                type="button"
                onClick={() => setEditorMode('write')}
                className={`px-3 py-1 text-[10px] rounded font-bold cursor-pointer transition-all ${
                  editorMode === 'write' ? 'bg-brand-navy text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Write (Markdown)
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                className={`px-3 py-1 text-[10px] rounded font-bold cursor-pointer transition-all ${
                  editorMode === 'preview' ? 'bg-brand-navy text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Live Preview
              </button>
            </div>
          </div>

          {editorMode === 'preview' ? (
            /* PREVIEW MODE */
            <div className="border border-dashed border-gray-200 rounded-2xl p-6 bg-white min-h-[400px] space-y-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">ARTICLE PREVIEW</span>
              
              <div className="aspect-[16/9] w-full max-h-80 rounded-xl overflow-hidden bg-gray-50">
                <img src={coverImage} alt={title} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 uppercase">
                    {category}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Estimated 5 min read</span>
                </div>
                <h1 className="font-display font-extrabold text-3xl text-brand-navy">{title || "Untitled Article"}</h1>
                <p className="text-sm text-gray-400 italic">By {author} · Published: {isPublished ? "Yes" : "Draft"}</p>
              </div>

              <div className="markdown-body text-base font-sans pt-4 border-t border-gray-100 max-w-none">
                {/* Fallback mock preview of body blocks */}
                <h2 className="font-display font-semibold text-lg text-brand-navy mb-4">Snippet Preview</h2>
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{content.slice(0, 1000) || "Start writing content in Markdown format..."}</p>
                {content.length > 1000 && <p className="text-gray-400 text-xs italic">[...Content truncated for preview length...]</p>}
              </div>
            </div>
          ) : (
            /* WRITE MODE FORM */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Form (8 Columns) */}
              <div className="md:col-span-8 space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Redesigning our virtual card ledger protocols"
                    className="w-full text-sm font-medium bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-brand-green text-gray-800"
                  />
                </div>

                {/* Slug & Excerpt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">Slug URL (Deterministic) *</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="virtual-card-ledger-redesign"
                      className="w-full text-xs font-mono bg-gray-100 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-brand-green text-gray-800"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">Tags (Comma Separated)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="api, virtual-cards, architecture"
                      className="w-full text-xs bg-gray-50/50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-brand-green text-gray-800"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">Article Excerpt (Short description for feed cards) *</label>
                  <textarea
                    required
                    rows={2}
                    maxLength={300}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Write a catchy 2-sentence description summarizing this article for SEO and list views..."
                    className="w-full text-xs bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-brand-green text-gray-800"
                  ></textarea>
                </div>

                {/* Core Markdown Editor */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Markdown Content Body *</label>
                    <span className="text-[10px] text-gray-400 font-mono font-bold">Supports markdown headers, quotes, tables, lists, and code blocks</span>
                  </div>
                  <textarea
                    required
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="# Hello World\n\nStart typing content here..."
                    className="w-full text-xs font-mono bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl p-4.5 focus:outline-none focus:border-brand-green text-gray-800 leading-relaxed"
                  ></textarea>
                </div>

              </div>

              {/* Right Settings Panel (4 Columns) */}
              <div className="md:col-span-4 space-y-5 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-200 pb-2 mb-2">Publishing Settings</span>
                
                {/* Author Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">Author</label>
                  <select
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl p-3 focus:outline-none text-gray-800"
                  >
                    {authors.map(a => (
                      <option key={a.name} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl p-3 focus:outline-none text-gray-800"
                  >
                    {categories.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Cover Image Input with quick preset bubbles */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1 block">Cover Image URL</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl p-3 focus:outline-none text-gray-800"
                  />
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Quick Preset Covers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {imagePresets.map((img) => (
                        <button
                          key={img.name}
                          type="button"
                          onClick={() => setCoverImage(img.url)}
                          className={`text-[9px] font-semibold px-2 py-1 rounded border transition-all ${
                            coverImage === img.url
                              ? 'bg-brand-navy border-brand-navy text-white'
                              : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-500'
                          }`}
                        >
                          {img.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checkbox fields */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
                    />
                    <span>Publish immediately (visible to public)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
                    />
                    <span>Flag as Featured Post (Hero banner display)</span>
                  </label>
                </div>

                {/* Search engine mock indexing layout */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">GOOGLE SEARCH SNIPPET PREVIEW</span>
                  <div className="bg-white border border-gray-100 rounded-xl p-3 text-[11px] font-mono shadow-inner space-y-1">
                    <span className="block text-blue-800 font-bold hover:underline truncate">bridge.payfrical.xyz &gt; blog &gt; {slug || "new-article"}</span>
                    <h5 className="text-emerald-700 font-semibold truncate leading-none">{title || "Your New Article Title Here"}</h5>
                    <p className="text-gray-400 leading-snug line-clamp-2">{excerpt || "Excerpt text displaying here as search result description..."}</p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Form Actions footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            {formError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-500 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}
            
            {formSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-600 flex items-center space-x-2">
                <Mail className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Article Saved Successfully! Syncing databases...</span>
              </div>
            )}

            <div className="flex space-x-3 w-full sm:w-auto sm:ml-auto">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-semibold rounded-xl cursor-pointer transition-all"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1.5"
              >
                <Save className="w-4 h-4 text-brand-green" />
                <span>Save Article</span>
              </button>
            </div>
          </div>

        </form>
      ) : (
        /* ADMIN LIST VIEW */
        <div className="space-y-6">
          
          {/* Tab selector */}
          <div className="flex border-b border-gray-100 relative">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 text-sm font-semibold relative px-4 cursor-pointer transition-all ${
                activeTab === 'posts' ? 'text-brand-navy' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center space-x-2 relative z-10">
                <FileText className="w-4 h-4" />
                <span>Articles ({posts.length})</span>
              </span>
              {activeTab === 'posts' && (
                <motion.div
                  layoutId="activeAdminTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-green rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 text-sm font-semibold relative px-4 cursor-pointer transition-all ${
                activeTab === 'analytics' ? 'text-brand-navy' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center space-x-2 relative z-10">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics Engine</span>
              </span>
              {activeTab === 'analytics' && (
                <motion.div
                  layoutId="activeAdminTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-green rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`pb-3 text-sm font-semibold relative px-4 cursor-pointer transition-all ${
                activeTab === 'subscribers' ? 'text-brand-navy' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center space-x-2 relative z-10">
                <Mail className="w-4 h-4" />
                <span>Newsletter Subs ({subscribers.length})</span>
              </span>
              {activeTab === 'subscribers' && (
                <motion.div
                  layoutId="activeAdminTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-green rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* 1. ARTICLES MANAGMENT LIST */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              
              {/* Search bar inside admin list */}
              <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden max-w-md">
                <div className="pl-3.5 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, author, category..."
                  className="w-full bg-transparent py-2.5 pl-2 pr-4 text-xs focus:outline-none text-gray-800 font-medium"
                />
              </div>

              {/* Responsive custom table */}
              <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 font-display text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-5 py-4">Title</th>
                      <th className="px-5 py-4">Author / Category</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4 text-center">Views</th>
                      <th className="px-5 py-4 text-center">Claps</th>
                      <th className="px-5 py-4 text-center">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-600">
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                          No matching posts found. Create some new ones!
                        </td>
                      </tr>
                    ) : (
                      filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50/40">
                          {/* Title with small thumbnail cover */}
                          <td className="px-5 py-4 max-w-xs sm:max-w-md">
                            <div className="flex items-center space-x-3">
                              <img
                                src={post.coverImage}
                                alt={post.title}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-100"
                              />
                              <div>
                                <h4 className="font-semibold text-brand-navy truncate text-xs hover:underline cursor-pointer" title={post.title}>{post.title}</h4>
                                <span className="text-[10px] text-gray-400 font-mono">ID: {post.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Author & Category */}
                          <td className="px-5 py-4">
                            <span className="block font-medium text-gray-800">{post.author}</span>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500 mt-0.5 uppercase tracking-wider">
                              {post.category}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 text-gray-400 font-mono whitespace-nowrap">
                            {post.date}
                          </td>

                          {/* Views */}
                          <td className="px-5 py-4 text-center font-semibold font-mono text-gray-700">
                            {post.views}
                          </td>

                          {/* Claps */}
                          <td className="px-5 py-4 text-center font-semibold font-mono text-gray-700">
                            {post.claps}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleTogglePublishState(post)}
                              className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${
                                post.isPublished
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {post.isPublished ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Published</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Draft</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="p-2 bg-gray-50 hover:bg-brand-navy hover:text-white rounded-lg border border-gray-100 transition-all cursor-pointer text-gray-500"
                                title="Edit Article"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeletePost(post.id)}
                                className="p-2 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-100 transition-all cursor-pointer text-rose-500"
                                title="Delete Article"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. ANALYTICS ENGINE */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Stat Bento cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Articles</span>
                    <BookOpen className="w-4 h-4 text-brand-green-dark" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-navy font-mono">{analytics.totalPosts}</h3>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{analytics.publishedCount} Active</span>
                    <span>{analytics.draftsCount} Drafts</span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Accumulated Views</span>
                    <Eye className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-navy font-mono">{analytics.totalViews}</h3>
                  <div className="text-[10px] text-gray-400 font-medium">Average {(analytics.totalViews / Math.max(analytics.totalPosts, 1)).toFixed(0)} views/post</div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Accumulated Claps</span>
                    <ThumbsUp className="w-4 h-4 text-brand-gold-dark" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-navy font-mono">{analytics.totalClaps}</h3>
                  <div className="text-[10px] text-gray-400 font-medium">Average {(analytics.totalClaps / Math.max(analytics.totalPosts, 1)).toFixed(0)} claps/post</div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Newsletter Subscribers</span>
                    <Mail className="w-4 h-4 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-navy font-mono">{subscribers.length}</h3>
                  <div className="text-[10px] text-gray-400 font-medium">Double-opted verification standard</div>
                </div>
              </div>

              {/* Category Share & Popularity Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Category Popularity (6 Columns) */}
                <div className="md:col-span-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="font-display font-bold text-xs text-brand-navy uppercase tracking-wider">
                    Views Share By Category
                  </h4>
                  <div className="space-y-3 pt-1">
                    {categories.map((cat) => {
                      const views = analytics.categoryViews[cat.slug] || 0;
                      const pct = analytics.totalViews > 0 ? (views / analytics.totalViews) * 100 : 0;
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-700">{cat.name}</span>
                            <span className="font-mono text-gray-400">{views} views ({pct.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-green rounded-full transition-all duration-500" 
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Popular posts table ranking (6 Columns) */}
                <div className="md:col-span-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="font-display font-bold text-xs text-brand-navy uppercase tracking-wider">
                    Highest Performing Articles
                  </h4>
                  <div className="space-y-3.5 pt-1">
                    {[...posts]
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 4)
                      .map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between text-xs pb-2 border-b border-gray-50 last:border-b-0 last:pb-0">
                          <div className="flex items-center space-x-2.5 truncate max-w-xs">
                            <span className="font-mono font-bold text-gray-300">#0{idx+1}</span>
                            <span className="font-semibold text-brand-navy truncate hover:underline cursor-pointer">{p.title}</span>
                          </div>
                          <span className="font-mono text-gray-500 font-semibold shrink-0">{p.views} views</span>
                        </div>
                      ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 3. SUBSCRIBERS LIST */}
          {activeTab === 'subscribers' && (
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">EMAIL DATABASE</span>
              
              <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm max-w-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 font-display text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-5 py-4">Subscriber Email</th>
                      <th className="px-5 py-4">Signup Source</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-600">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                          No subscribers registered yet. Use the footer form to test subscription!
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((email, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/30">
                          <td className="px-5 py-3.5 font-medium text-brand-navy">
                            {email}
                          </td>
                          <td className="px-5 py-3.5 text-gray-400 font-mono">
                            Footer Form
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                              Verified Opt-in
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteSubscriber(email)}
                              className="text-rose-500 hover:text-rose-700 font-semibold text-xs cursor-pointer"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
