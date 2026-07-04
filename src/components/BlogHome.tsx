import React, { useState, useMemo, useEffect } from 'react';
import { Post, Category } from '../types';
import { categories, authors } from '../data';
import PostCard from './PostCard';
import { Search, Flame, Tag, Mail, CheckCircle2, User, HelpCircle, ChevronRight, X, Sparkles } from 'lucide-react';

interface BlogHomeProps {
  posts: Post[];
  onPostSelect: (slug: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (categorySlug: string | null) => void;
  selectedAuthor: string | null;
  onSelectAuthor: (authorName: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function BlogHome({
  posts,
  onPostSelect,
  selectedCategory,
  onSelectCategory,
  selectedAuthor,
  onSelectAuthor,
  selectedTag,
  onSelectTag
}: BlogHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  
  // Newsletter local state for inline widget
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');

  // Auto-reset pagination when filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory, selectedAuthor, selectedTag, searchQuery]);

  // Find the featured post (usually flagged, or we take the first published one)
  const featuredPost = useMemo(() => {
    const published = posts.filter(p => p.isPublished);
    return published.find(p => p.isFeatured) || published[0];
  }, [posts]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      if (post.isPublished) {
        post.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [posts]);

  // Calculate popular posts (sorted by views or claps)
  const popularPosts = useMemo(() => {
    return [...posts]
      .filter(p => p.isPublished)
      .sort((a, b) => b.views - a.views)
      .slice(0, 4);
  }, [posts]);

  // Filter posts based on category, search query, tag, and author
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (!post.isPublished) return false;

      // Category filter
      if (selectedCategory && post.category !== selectedCategory) return false;

      // Author filter
      if (selectedAuthor && post.author !== selectedAuthor) return false;

      // Tag filter
      if (selectedTag && !post.tags.includes(selectedTag)) return false;

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(query);
        const matchesContent = post.content.toLowerCase().includes(query);
        const matchesAuthor = post.author.toLowerCase().includes(query);
        const matchesTags = post.tags.some(t => t.toLowerCase().includes(query));
        return matchesTitle || matchesExcerpt || matchesContent || matchesAuthor || matchesTags;
      }

      return true;
    });
  }, [posts, selectedCategory, selectedAuthor, selectedTag, searchQuery]);

  // Check if any filter is currently active
  const hasActiveFilters = selectedCategory || selectedAuthor || selectedTag || searchQuery;

  const handleClearFilters = () => {
    onSelectCategory(null);
    onSelectAuthor(null);
    onSelectTag(null);
    setSearchQuery('');
  };

  const handleInlineSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setSubError('Please enter a valid email address.');
      return;
    }
    setSubLoading(true);
    setTimeout(() => {
      try {
        const subscribers: string[] = JSON.parse(localStorage.getItem('bridge_newsletter_subscribers') || '[]');
        if (subscribers.includes(email)) {
          setSubError('Already subscribed to our newsletter.');
          setSubLoading(false);
          return;
        }
        subscribers.push(email);
        localStorage.setItem('bridge_newsletter_subscribers', JSON.stringify(subscribers));
        setIsSubscribed(true);
        setEmail('');
        setSubLoading(false);
      } catch (err) {
        setSubError('Failed. Please try again.');
        setSubLoading(false);
      }
    }, 800);
  };

  // Find author bio if filtering by author
  const activeAuthorDetail = useMemo(() => {
    if (!selectedAuthor) return null;
    return authors.find(a => a.name === selectedAuthor);
  }, [selectedAuthor]);

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Hero & Branding Area */}
      <section className="relative overflow-hidden bg-transparent py-10 sm:py-14 md:py-16 border-b border-gray-100">
        {/* Decorative background stripe matching bottom caution yellow stripes of the image - moved to the absolute bottom of the hero section */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-gold via-brand-green to-brand-gold"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold-light rounded-full blur-3xl -z-10 pointer-events-none opacity-40"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none text-brand-green">
              Swap Assets to<br />
              Cash in <span className="text-brand-gold-dark font-black">Seconds.</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl leading-relaxed">
              Making digital assets simple, safe, and usable for Africans. Trade, pay, and save with ease. Stay ahead with smart stablecoin insights, weekly market analysis, and product updates.
            </p>

            {/* Large Hero Search Bar */}
            <div className="pt-2 max-w-xl">
              <div className="relative flex items-center bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-md overflow-hidden group focus-within:ring-2 focus-within:ring-brand-green focus-within:border-brand-green transition-all">
                <div className="pl-4 text-gray-400">
                  <Search className="w-5 h-5 group-focus-within:text-brand-green transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, tags, authors, or topics..."
                  className="w-full bg-transparent py-4 pl-3 pr-4 text-sm font-medium focus:outline-none placeholder-gray-400 text-gray-800"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="pr-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-400 font-medium">
                <span>Try searching:</span>
                <button onClick={() => setSearchQuery('stablecoins')} className="bg-brand-gold-light border border-brand-gold-dark/15 px-2.5 py-1 rounded-md text-brand-navy-light hover:bg-brand-gold/20 hover:text-brand-green transition-all cursor-pointer">stablecoins</button>
                <button onClick={() => setSearchQuery('api')} className="bg-brand-gold-light border border-brand-gold-dark/15 px-2.5 py-1 rounded-md text-brand-navy-light hover:bg-brand-gold/20 hover:text-brand-green transition-all cursor-pointer">api</button>
                <button onClick={() => setSearchQuery('latency')} className="bg-brand-gold-light border border-brand-gold-dark/15 px-2.5 py-1 rounded-md text-brand-navy-light hover:bg-brand-gold/20 hover:text-brand-green transition-all cursor-pointer">latency</button>
              </div>
            </div>
          </div>

          {/* Right Column: Smiling African Professional with Floating Assets */}
          <div className="lg:col-span-5 flex justify-center py-6">
            <div className="relative w-64 h-64 sm:w-76 sm:h-76 md:w-80 md:h-80 mx-auto bg-brand-gold-light/20 rounded-full flex items-center justify-center p-3 sm:p-4">
              
              {/* Outer orbit lines */}
              <div className="absolute inset-0 border-2 border-dashed border-brand-gold/15 rounded-full animate-spin [animation-duration:40s] pointer-events-none"></div>
              
              {/* Avatar photo styled with standard rounded-full clip */}
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl relative bg-brand-gold/10">
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=450&auto=format&fit=crop&q=80" 
                  alt="Payfrica Smile"
                  className="w-full h-full object-cover scale-110 object-top"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating Coin 1 - Naira ₦ */}
              <div 
                className="absolute -top-1 left-4 bg-[#008751] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white animate-bounce" 
                style={{ animationDuration: '3s', animationDelay: '0.2s' }}
                title="Nigerian Naira"
              >
                ₦
              </div>

              {/* Floating Coin 2 - Cedis ₵ */}
              <div 
                className="absolute top-1/3 -left-4 bg-[#FCD116] text-brand-navy-dark w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-base shadow-lg border-2 border-white animate-bounce" 
                style={{ animationDuration: '4.5s', animationDelay: '0.8s' }}
                title="Ghanaian Cedi"
              >
                ₵
              </div>

              {/* Floating Coin 3 - Dollar $ */}
              <div 
                className="absolute -bottom-1 right-12 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white animate-bounce" 
                style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}
                title="US Dollar"
              >
                $
              </div>

              {/* Floating Coin 4 - USDC */}
              <div 
                className="absolute top-12 -right-3 bg-[#2775CA] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white animate-bounce" 
                style={{ animationDuration: '4s', animationDelay: '0.1s' }}
                title="USD Coin (Stablecoin)"
              >
                USDC
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2. Filter / Search State Header */}
      {hasActiveFilters && (
        <section className="bg-brand-green-light/30 border border-brand-green-dark/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-green-dark">Filtered Feed</span>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-brand-navy font-display">
                Showing {filteredPosts.length} results
              </h2>
              {selectedCategory && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-100 text-brand-navy">
                  <span>Category: {categories.find(c => c.slug === selectedCategory)?.name}</span>
                </span>
              )}
              {selectedAuthor && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-100 text-brand-navy">
                  <span>Author: {selectedAuthor}</span>
                </span>
              )}
              {selectedTag && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-100 text-brand-navy">
                  <span>Tag: #{selectedTag}</span>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-100 text-brand-navy">
                  <span>Search: &quot;{searchQuery}&quot;</span>
                </span>
              )}
            </div>
            
            {activeAuthorDetail && (
              <p className="text-xs text-gray-500 max-w-xl pt-1">
                <span className="font-semibold">About the author:</span> {activeAuthorDetail.bio}
              </p>
            )}
          </div>
          <button
            onClick={handleClearFilters}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl transition-all cursor-pointer shadow-sm hover:border-gray-300"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </section>
      )}

      {/* 3. Featured Post Block (Only when NO filters are active and posts exist) */}
      {!hasActiveFilters && featuredPost && (
        <section className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Featured Image */}
            <div 
              onClick={() => onPostSelect(featuredPost.slug)}
              className="lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden bg-gray-100 cursor-pointer relative group"
            >
              <img
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                referrerPolicy="no-referrer"
                className="object-cover w-full h-full transform group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-brand-navy text-brand-green text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md shadow-md flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-brand-gold animate-spin" />
                <span>Featured Post</span>
              </div>
            </div>

            {/* Featured Details */}
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                {/* Category Pill */}
                <button
                  onClick={() => onSelectCategory(featuredPost.category)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-transparent bg-indigo-50 text-indigo-700 hover:scale-105 transition-all mb-4 cursor-pointer inline-block"
                >
                  {categories.find(c => c.slug === featuredPost.category)?.name || featuredPost.category}
                </button>

                {/* Title */}
                <h2 
                  onClick={() => onPostSelect(featuredPost.slug)}
                  className="font-display font-bold text-2xl sm:text-3xl text-brand-navy hover:text-brand-green-dark cursor-pointer transition-colors leading-tight mb-4"
                >
                  {featuredPost.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-4 mb-6">
                  {featuredPost.excerpt}
                </p>
              </div>

              {/* Author & Footer of Featured */}
              <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <button
                  onClick={() => onSelectAuthor(featuredPost.author)}
                  className="flex items-center space-x-3 text-left cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={authors.find(a => a.name === featuredPost.author)?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80"}
                    alt={featuredPost.author}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-800">{featuredPost.author}</span>
                    <span className="block text-[10px] text-gray-400 font-medium">{featuredPost.date} · {featuredPost.readTime}</span>
                  </div>
                </button>

                <button
                  onClick={() => onPostSelect(featuredPost.slug)}
                  className="flex items-center space-x-1.5 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-semibold px-4.5 py-3 rounded-xl shadow-md cursor-pointer transition-all hover:translate-x-0.5"
                >
                  <span>Read Article</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-green" />
                </button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 4. Category Tabs Selector */}
      <section className="border-b border-gray-200">
        <div className="flex items-center space-x-8 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => onSelectCategory(null)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border-b-2 -mb-[2px] ${
              selectedCategory === null
                ? 'text-brand-green border-brand-green'
                : 'text-gray-400 border-transparent hover:text-brand-navy'
            }`}
          >
            All Articles
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border-b-2 -mb-[2px] ${
                selectedCategory === cat.slug
                  ? 'text-brand-green border-brand-green'
                  : 'text-gray-400 border-transparent hover:text-brand-navy'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 5. Main Content Grid & Sidebar */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Post Grid (8 Columns) */}
        <div className="lg:col-span-8 space-y-10">
          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mx-auto">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-navy">No articles found</h3>
              <p className="text-sm text-gray-500">
                We couldn&apos;t find any articles matching your search criteria. Try modifying your filters or entering a different search term.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-dark text-brand-navy text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer inline-block"
              >
                Show All Articles
              </button>
            </div>
          ) : (
            <>
              {/* Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPosts.slice(0, visibleCount).map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => onPostSelect(post.slug)}
                    onCategoryClick={(e, slug) => {
                      e.stopPropagation();
                      onSelectCategory(slug);
                    }}
                    onAuthorClick={(e, name) => {
                      e.stopPropagation();
                      onSelectAuthor(name);
                    }}
                  />
                ))}
              </div>

              {/* Pagination or Load More button */}
              {filteredPosts.length > visibleCount && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 4)}
                    className="px-6 py-3 border border-gray-200 hover:border-brand-navy bg-white text-brand-navy font-semibold text-xs tracking-wide rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center space-x-1.5 hover:-translate-y-0.5"
                  >
                    <span>Load More Articles</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side: Sidebar Widgets (4 Columns) */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Popular / Trending Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
              <Flame className="w-4 h-4 text-brand-gold animate-bounce" />
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-brand-navy">Popular Articles</h3>
            </div>
            
            <div className="space-y-4.5">
              {popularPosts.map((pop, idx) => (
                <div 
                  key={pop.id} 
                  onClick={() => onPostSelect(pop.slug)}
                  className="flex items-start space-x-3 cursor-pointer group"
                >
                  <span className="font-mono text-xl font-bold text-gray-200 group-hover:text-brand-green transition-colors leading-none w-5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-brand-green-dark uppercase tracking-wider">
                      {categories.find(c => c.slug === pop.category)?.name}
                    </span>
                    <h4 className="font-display font-bold text-xs text-brand-navy leading-snug group-hover:text-brand-green-dark transition-colors line-clamp-2">
                      {pop.title}
                    </h4>
                    <span className="block text-[9px] text-gray-400 font-mono">{pop.readTime} · {pop.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Newsletter Widget Card */}
          <div className="bg-brand-navy-dark text-white rounded-3xl p-6 shadow-md border border-brand-navy-light/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-navy/80 border border-brand-navy-light flex items-center justify-center text-brand-green">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-base text-white">Payfrica Fintech Weekly</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Join a community of 15,000+ subscribers receiving our weekly insights and stablecoin news directly.
                </p>
              </div>

              {isSubscribed ? (
                <div className="bg-brand-green-light/10 border border-brand-green/30 text-brand-green rounded-xl p-3 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                  <span>Double opt-in verification dispatched! Check inbox.</span>
                </div>
              ) : (
                <form onSubmit={handleInlineSubscribe} className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (subError) setSubError('');
                    }}
                    placeholder="name@company.com"
                    className="w-full bg-brand-navy border border-gray-700 focus:border-brand-green rounded-xl p-3 text-xs text-white focus:outline-none placeholder-gray-500"
                    disabled={subLoading}
                  />
                  {subError && <p className="text-[10px] text-rose-400 pl-1">{subError}</p>}
                  <button
                    type="submit"
                    disabled={subLoading}
                    className="w-full py-3 bg-brand-green hover:bg-brand-green-dark text-brand-navy text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                  >
                    {subLoading ? (
                      <div className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Join Newsletter</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Topics Tag Cloud Widget */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
              <Tag className="w-4 h-4 text-gray-400" />
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-brand-navy">Trending Tags</h3>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {allTags.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => onSelectTag(isActive ? null : tag)}
                    className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-navy border-brand-navy text-white shadow-sm'
                        : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:text-brand-navy'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Help & Support Small Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-xs text-brand-navy">Become an Author</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Are you an expert in blockchain remittances, technical API architecture, or African finance policies? Write for the Bridge Blog.
              </p>
              <button 
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-brand-green-dark hover:text-brand-green transition-colors mt-2 cursor-pointer flex items-center space-x-0.5"
              >
                <span>Read requirements</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </aside>

      </section>

    </div>
  );
}
