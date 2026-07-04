import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Twitter, Linkedin, Github, ExternalLink, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    
    // Simulate API delay
    setTimeout(() => {
      try {
        const subscribers: string[] = JSON.parse(localStorage.getItem('bridge_newsletter_subscribers') || '[]');
        if (subscribers.includes(email)) {
          setStatus('error');
          setErrorMessage('This email is already subscribed to the Payfrica newsletter.');
          return;
        }

        subscribers.push(email);
        localStorage.setItem('bridge_newsletter_subscribers', JSON.stringify(subscribers));
        setStatus('success');
        setEmail('');
      } catch (err) {
        setStatus('error');
        setErrorMessage('Failed to subscribe. Please try again.');
      }
    }, 1000);
  };

  return (
    <footer className="bg-brand-navy-dark text-gray-300 border-t border-brand-navy-light pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter & Core Offerings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-brand-navy-light/40">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-display font-semibold text-xl text-white">
              Subscribe to the Payfrica Dispatch
            </h3>
            <p className="text-sm text-gray-400 max-w-md">
              Join 15,000+ business leaders, operators, and finance professionals receiving the latest fintech updates, regulatory analyses, and stablecoin guides in Africa.
            </p>
            
            {status === 'success' ? (
              <div className="bg-brand-green-light/10 border border-brand-green/30 rounded-2xl p-4 text-sm text-brand-green flex items-start space-x-3 max-w-md">
                <ShieldCheck className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-medium">Double opt-in sent!</strong>
                  We have dispatched a verification email. Click the link to complete your subscription. Welcome aboard!
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative max-w-md">
                <div className="flex overflow-hidden rounded-xl border border-gray-700 bg-brand-navy/60 focus-within:border-brand-green transition-all">
                  <div className="flex items-center pl-3.5 pointer-events-none text-gray-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="Enter your work email"
                    className="w-full bg-transparent py-3.5 pl-3 pr-12 text-sm text-white focus:outline-none placeholder-gray-500"
                    disabled={status === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="absolute right-1 top-1 bottom-1 bg-brand-green hover:bg-brand-green-dark text-brand-navy font-semibold px-3.5 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <div className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-xs text-rose-400 mt-2 pl-1">{errorMessage}</p>
                )}
              </form>
            )}
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-semibold tracking-wider text-white uppercase">Product</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#" className="hover:text-brand-green transition-colors">Asset Swaps</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Virtual Cards</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Stablecoin Solutions</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Cross-Border Transfer</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold tracking-wider text-white uppercase">Company</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#" className="hover:text-brand-green transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Security & Trust</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Press & Media</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Partner Program</a></li>
              </ul>
            </div>

            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="text-xs font-semibold tracking-wider text-white uppercase">Resources</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><button onClick={() => onNavigate('home')} className="hover:text-brand-green transition-colors text-left cursor-pointer">Payfrica Blog</button></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Regulatory Hub</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">FAQ & Support</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Brand details and copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-gray-500">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-center md:text-left">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-brand-navy flex items-center justify-center text-brand-green font-display font-black text-sm">
                P
              </div>
              <span className="font-display font-semibold text-sm text-white tracking-tight">
                Payfrica<span className="text-brand-green">.</span>
              </span>
            </div>
            <span>© {new Date().getFullYear()} Payfrica Payments Inc. All rights reserved.</span>
          </div>

          {/* Social icons */}
          <div className="flex space-x-5">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-brand-navy/40 hover:bg-brand-navy border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-brand-navy/40 hover:bg-brand-navy border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-brand-navy/40 hover:bg-brand-navy border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-all">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://payfrica.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-brand-navy/40 hover:bg-brand-navy border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-all">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-navy-light/20 mt-6 text-[10px] text-gray-600 leading-relaxed max-w-4xl">
          Bridge is a developer technology service provided by Payfrica Payments Inc. Virtual cards are issued by partner commercial banks and fully compliant licensed institutions in association with Visa, Mastercard, and local network operators. Cryptocurrency settlement and stablecoin storage services are maintained under strict compliant frameworks with registered digital asset authorities.
        </div>

      </div>
    </footer>
  );
}
