import { useState, useEffect } from 'react';
import { initialPosts } from './data';
import { Post } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import BlogHome from './components/BlogHome';
import PostDetail from './components/PostDetail';
import AdminPanel from './components/AdminPanel';
import { 
  ArrowUpRight, BookOpen, Key, Terminal, Code, Cpu, 
  HelpCircle, Sparkles, ShieldCheck, Mail, ArrowRight
} from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentView, setCurrentView] = useState<string>('home'); // 'home', 'post_[slug]', etc.
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  
  // Interactive Filter States passed between components
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Initialize and Seed localStorage Database
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bridge_posts');
      if (!stored) {
        // First mount, seed with our 5 premium articles
        localStorage.setItem('bridge_posts', JSON.stringify(initialPosts));
        setPosts(initialPosts);
      } else {
        setPosts(JSON.parse(stored));
      }

      // Initialize default subscribers if empty
      const subs = localStorage.getItem('bridge_newsletter_subscribers');
      if (!subs) {
        localStorage.setItem('bridge_newsletter_subscribers', JSON.stringify([
          'ayobamioketona@gmail.com',
          'tunde@payfrica.com',
          'investors@ycombinator.com'
        ]));
      }

    } catch (err) {
      console.error('Failed to initialize local database:', err);
      setPosts(initialPosts);
    }
  }, []);

  // Save or Edit Post
  const handleSavePost = (savedPost: Post) => {
    try {
      const dbPosts: Post[] = JSON.parse(localStorage.getItem('bridge_posts') || '[]');
      const exists = dbPosts.some(p => p.id === savedPost.id);
      
      let updated: Post[];
      if (exists) {
        updated = dbPosts.map(p => p.id === savedPost.id ? savedPost : p);
      } else {
        updated = [savedPost, ...dbPosts];
      }
      
      localStorage.setItem('bridge_posts', JSON.stringify(updated));
      setPosts(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Post
  const handleDeletePost = (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this article permanently? This action is irreversible.");
    if (!confirmDelete) return;

    try {
      const dbPosts: Post[] = JSON.parse(localStorage.getItem('bridge_posts') || '[]');
      const updated = dbPosts.filter(p => p.id !== id);
      localStorage.setItem('bridge_posts', JSON.stringify(updated));
      setPosts(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Route router mapping
  const activePostSlug = currentView.startsWith('post_') ? currentView.replace('post_', '') : null;
  const activePost = activePostSlug ? posts.find(p => p.slug === activePostSlug) : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between selection:bg-brand-green selection:text-brand-navy">
      
      {/* Universal Sticky Header Navigation */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsAdminMode(false); // reset admin panel on page change
        }}
        onOpenAdmin={() => setIsAdminMode(!isAdminMode)}
        isAdminMode={isAdminMode}
      />

      {/* Main Dynamic Viewport Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {isAdminMode ? (
          /* 1. CREATOR DASHBOARD MODE OVERLAY */
          <AdminPanel
            posts={posts}
            onSavePost={handleSavePost}
            onDeletePost={handleDeletePost}
            onClose={() => setIsAdminMode(false)}
          />
        ) : activePost ? (
          /* 2. DYNAMIC LONG-FORM ARTICLE VIEW */
          <PostDetail
            post={activePost}
            posts={posts}
            onBack={() => setCurrentView('home')}
            onNavigateToPost={(slug) => setCurrentView(`post_${slug}`)}
            onCategorySelect={(cat) => {
              setSelectedCategory(cat);
              setSelectedAuthor(null);
              setSelectedTag(null);
              setCurrentView('home');
            }}
            onAuthorSelect={(auth) => {
              setSelectedAuthor(auth);
              setSelectedCategory(null);
              setSelectedTag(null);
              setCurrentView('home');
            }}
          />
        ) : currentView === 'home' ? (
          /* 3. CORE BLOG FEED (HOMEPAGE) */
          <BlogHome
            posts={posts}
            onPostSelect={(slug) => setCurrentView(`post_${slug}`)}
            selectedCategory={selectedCategory}
            onSelectCategory={(slug) => {
              setSelectedCategory(slug);
              setSelectedAuthor(null);
              setSelectedTag(null);
            }}
            selectedAuthor={selectedAuthor}
            onSelectAuthor={(name) => {
              setSelectedAuthor(name);
              setSelectedCategory(null);
              setSelectedTag(null);
            }}
            selectedTag={selectedTag}
            onSelectTag={(tag) => {
              setSelectedTag(tag);
              setSelectedCategory(null);
              setSelectedAuthor(null);
            }}
          />
        ) : (
          /* 4. SHOWCASE MARKETING STAGES (Product, Developers, about, etc.) */
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 md:p-16 max-w-4xl mx-auto text-center space-y-8 shadow-sm">
            
            {currentView === 'product_dummy' && (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-green-light text-brand-green-dark flex items-center justify-center mx-auto shadow-inner">
                  <Cpu className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-widest text-brand-green-dark uppercase font-mono">Platform Ecosystem</span>
                  <h2 className="font-display font-extrabold text-3xl text-brand-navy">Orchestrate cross-border cashflows seamlessly</h2>
                  <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
                    Bridge integrates local bank ledgers, standard mobile money telecommunications networks, and secure cryptographic stablecoins into one high-performance transaction interface.
                  </p>
                </div>

                {/* Features bento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left pt-6">
                  <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-2">
                    <h4 className="font-display font-bold text-sm text-brand-navy">Virtual Card Issuing</h4>
                    <p className="text-xs text-gray-400">Instantly generate Visa/Mastercard USD cards programmatically to clear international marketing, cloud hosting, and software bills.</p>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-2">
                    <h4 className="font-display font-bold text-sm text-brand-navy">Stablecoin Remittance</h4>
                    <p className="text-xs text-gray-400">Convert local currency into stablecoins (USDC/USDT) to dispatch lightning-fast payouts under 3 seconds for less than 1.2% fees.</p>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'resources_dummy' && (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-widest text-blue-600 uppercase font-mono">Knowledge Hub</span>
                  <h2 className="font-display font-extrabold text-3xl text-brand-navy">Comprehensive fintech resource center</h2>
                  <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
                    Read our legislative summaries, view compliant digital assets frameworks, watch developer integrations, or download our media press kits.
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setCurrentView('home')} 
                    className="px-6 py-3 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Go back to Blog articles
                  </button>
                </div>
              </div>
            )}

            {currentView === 'developers_dummy' && (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Code className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase font-mono">Bridge REST APIs</span>
                  <h2 className="font-display font-extrabold text-3xl text-brand-navy">Built by engineers, for engineers</h2>
                  <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
                    Integrate virtual card networks, local payment collections, webhooks verification, and liquidity clearing nodes with our lightweight SDKs.
                  </p>
                </div>

                <div className="bg-gray-900 text-slate-200 p-5 rounded-2xl text-left font-mono text-xs max-w-xl mx-auto border border-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                    <span>GET /v1/cards/usr_88203</span>
                    <span>HTTPS JSON</span>
                  </div>
                  <pre className="leading-relaxed">
{`{
  "id": "card_9210a3f5b",
  "cardholder": "Ayo Oketona",
  "brand": "Visa",
  "type": "virtual_usd",
  "status": "active",
  "balance": 250.00,
  "created_at": "2026-07-03T15:48:17Z"
}`}
                  </pre>
                </div>
              </div>
            )}

            {currentView === 'about_dummy' && (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-brand-gold-dark flex items-center justify-center mx-auto">
                  <Terminal className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-widest text-brand-gold-dark uppercase font-mono">Our Ambition</span>
                  <h2 className="font-display font-extrabold text-3xl text-brand-navy">Unifying the African payment topography</h2>
                  <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
                    Payfrica is established to dissolve geopolitical and currency borders from commercial flows, enabling rapid regional prosperity and seamless financial links.
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setCurrentView('home')} 
                    className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-brand-navy text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Explore our Blog
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Universal Footer */}
      <Footer onNavigate={(view) => {
        setCurrentView(view);
        setIsAdminMode(false);
      }} />

    </div>
  );
}
