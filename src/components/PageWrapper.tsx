import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Menu, X, Home as HomeIcon, Briefcase, Layers, MessageSquare, LayoutDashboard, Anchor, Users, Calendar as CalendarIcon, Twitter, Linkedin, Instagram, MapPin, Star, Moon, Sun, Search, Command, Coins, Waves, BookOpen, Target, Calculator, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AIAssistant from "./AIAssistant";
import SparklesOverlay from "./SparklesOverlay";

export default function PageWrapper({ 
  children, 
  maxWidth = "max-w-5xl", 
  showHero = true,
  showLargeLogo = true
}: { 
  children: React.ReactNode, 
  maxWidth?: string,
  showHero?: boolean,
  showLargeLogo?: boolean
}) {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.style.filter = "";
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]); // using theme instead of toggleTheme to avoid remounting issues, toggleTheme closure updates with state.

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { to: "/", label: "Home", icon: HomeIcon, color: "text-yellow-500" },
    { to: "/gallery", label: "Work", icon: Briefcase, color: "text-blue-500" },
    { to: "/services", label: "Services", icon: Layers, color: "text-purple-500" },
    { to: "/members", label: "Members", icon: LayoutDashboard, color: "text-cyan-400" },
    { to: "/reviews", label: "Reviews", icon: Star, color: "text-yellow-400" },
    { to: "/founders", label: "Founders", icon: Users, color: "text-emerald-500" },
    { to: "/create", label: "C.R.E.A.T.E.", icon: Command, color: "text-[#00ff66]" },
    { to: "/surfer", label: "AI Surfer", icon: Anchor, color: "text-[#39ff14]" },
    { to: "/scan-pay", label: "Scan & Pay", icon: Coins, color: "text-green-400" },
    { to: "/ocean", label: "Tide Drop", icon: Waves, color: "text-cyan-400" },
    { to: "/ocean-services", label: "Ocean Services", icon: Layers, color: "text-blue-400" },
    { to: "/ocean-reports", label: "Surf Reports", icon: BookOpen, color: "text-teal-400" },
    { to: "/ocean-cases", label: "Success Stories", icon: Target, color: "text-orange-400" },
    { to: "/ocean-roi", label: "ROI Calculator", icon: Calculator, color: "text-indigo-400" },
    { to: "/ocean-contact", label: "Contact Us", icon: Mail, color: "text-pink-400" },
    { to: "/pricing", label: "Pricing", icon: Coins, color: "text-yellow-300" },
    { to: "/commander", label: "Commander", icon: Command, color: "text-[#00ff66]" },
    { to: "/memorial", label: "Bull's Memorial", icon: Anchor, color: "text-orange-500" },
    { to: "/tribute", label: "Tip Jar", icon: Coins, color: "text-pink-500" },
    { to: "/contact", label: "Contact", icon: MessageSquare, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col relative overflow-x-hidden">
      <SparklesOverlay />
      {/* SIDEBAR (Always on side) */}
      <aside className="flex flex-col w-64 lg:w-72 fixed top-0 left-0 bottom-0 bg-black/95 border-r border-white/10 backdrop-blur-2xl z-50 p-4 lg:p-6 justify-between select-none overflow-y-auto">
        
        {/* TOP CLUSTER: Logo & Status */}
        <div className="flex flex-col gap-6">
          <Link to="/" className="flex items-center gap-3 py-2 pl-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-sm">
              <img src="/images/brand/ai-surfer-round.webp" alt="AI Surfer Logo" className="w-full h-full object-contain drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-white">
              <span className="text-soul-gradient italic font-serif">AI Surfer</span>
            </span>
          </Link>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/20 rounded-full" title="System Matrix Online">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">All Systems Nominal</span>
          </div>

          {/* Search Button Stacked */}
          <button onClick={() => setIsSearchOpen(true)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Search (Cmd+K)">
            <div className="flex items-center gap-3">
              <Search className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Search Matrix</span>
            </div>
            <kbd className="flex items-center gap-1 font-mono text-[9px] bg-black/50 px-1.5 py-0.5 rounded opacity-70">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Navigation Links List */}
          <nav className="flex flex-col gap-1.5 pt-2">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                className={`transition-all px-4 py-3 rounded-xl flex items-center gap-3 group relative ${isActive(link.to) ? 'bg-white/10 text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`} 
                to={link.to}
              >
                <link.icon className={`w-4 h-4 ${link.color} group-hover:scale-110 transition-transform ${isActive(link.to) ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{link.label}</span>
                {isActive(link.to) && (
                  <motion.div 
                    layoutId="sidebarActiveBg"
                    className="absolute left-1 w-1 top-3 bottom-3 bg-cyan-400 shadow-[0_0_10px_rgba(0,234,255,0.8)] rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* BOTTOM CLUSTER: Theme, Profile & Auth tools */}
        <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Global Settings</span>
            <button onClick={toggleTheme} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Toggle Theme (Cmd+Shift+L)">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {loading ? (
            <div className="w-full flex justify-center py-2">
              <div className="w-4 h-4 rounded-full border border-white/20 border-t-white animate-spin"></div>
            </div>
          ) : user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-2 bg-white/5 border border-white/5 rounded-xl">
                <Link to="/profile" className="flex items-center gap-3">
                  {user.photoURL ? (
                     <img src={user.photoURL} alt={user.displayName || "User"} className={`w-8 h-8 rounded-full border-2 transition-all ${isActive('/profile') ? 'border-cyan-400' : 'border-white/20'}`} />
                  ) : (
                     <div className={`w-8 h-8 rounded-full bg-white/10 border-2 flex items-center justify-center text-[10px] font-bold text-white transition-all ${isActive('/profile') ? 'border-cyan-400' : 'border-white/20'}`}>
                       {user.email?.[0].toUpperCase()}
                     </div>
                  )}
                  <div className="flex flex-col select-none">
                    <span className="text-[10px] font-black uppercase text-white truncate max-w-[124px]">{user.displayName || 'Active Member'}</span>
                    <span className="text-[8px] font-mono text-zinc-500 truncate max-w-[124px]">{user.email}</span>
                  </div>
                </Link>
                <button 
                  onClick={() => { if (window.confirm("Are you sure you want to sign out?")) logout(); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Neural Dashboard Quick Link */}
              <Link to="/members" className={`w-full flex items-center justify-center gap-2 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl group transition-all hover:bg-cyan-500 hover:text-black ${isActive('/members') && !isActive('/members/sync') ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : ''}`}>
                <LayoutDashboard className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">My Dashboard</span>
              </Link>
            </div>
          ) : (
            <button 
              onClick={async () => {
                try {
                  await loginWithGoogle(false);
                } catch {
                  alert("Authentication failed. If you are viewing this in the AI Studio preview, popups may be blocked. Please click the arrow/window icon at the top right to open this app in a new tab and try again.");
                }
              }}
              className="w-full py-3 bg-white text-black rounded-xl hover:bg-cyan-400 transition-colors text-[10px] font-black uppercase tracking-widest text-center cursor-pointer font-bold"
            >
              Sign In With Google
            </button>
          )}

        </div>
      </aside>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 md:pt-32 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <div 
              className="w-full max-w-2xl bg-zinc-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
               <div className="flex items-center gap-4 p-4 border-b border-white/5">
                 <Search className="w-5 h-5 text-cyan-400" />
                 <input 
                   ref={searchInputRef}
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-zinc-600 text-lg"
                   placeholder="Search the agency..."
                 />
                 <button onClick={() => setIsSearchOpen(false)} className="text-zinc-500 hover:text-white bg-white/5 px-2 py-1 rounded text-xs font-mono hidden md:block">ESC</button>
                 <button onClick={() => setIsSearchOpen(false)} className="text-zinc-500 hover:text-white md:hidden"><X className="w-5 h-5" /></button>
               </div>
               
               <div className="p-4 flex flex-col gap-2 min-h-[100px]">
                 {searchQuery.length > 2 ? (
                   <div className="text-center text-zinc-500 text-sm py-8">
                     <div className="w-6 h-6 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
                     Searching architecture for "{searchQuery}"...
                   </div>
                 ) : (
                   <>
                     <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-2 mb-2">Suggested</span>
                     <Link onClick={() => setIsSearchOpen(false)} to="/services" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm flex items-center justify-between group transition-colors">
                       <span className="font-bold text-cyan-100 group-hover:text-cyan-400 transition-colors">Growth Design</span>
                       <span className="text-[10px] uppercase text-zinc-500">Service</span>
                     </Link>
                     <Link onClick={() => setIsSearchOpen(false)} to="/members/sync" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm flex items-center justify-between group transition-colors">
                       <span className="font-bold text-emerald-100 group-hover:text-emerald-400 transition-colors">Neural Sync</span>
                       <span className="text-[10px] uppercase text-zinc-500">Applet</span>
                     </Link>
                     <Link onClick={() => setIsSearchOpen(false)} to="/contact" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm flex items-center justify-between group transition-colors">
                       <span className="font-bold text-white">Start Your Project</span>
                       <span className="text-[10px] uppercase text-zinc-500">Contact</span>
                     </Link>
                   </>
                 )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT */}
      <main className="flex-1 pt-12 pb-20 relative flex flex-col items-center fade-in pl-64 lg:pl-72 w-full">
        <div className={`relative ${maxWidth} mx-auto px-6 z-10 w-full`}>
          {showLargeLogo && (
            <div className="flex flex-col items-center mb-16 select-none text-center animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="relative p-2 rounded-3xl bg-black/40 border border-white/5 shadow-[0_0_55px_rgba(0,0,0,0.85)]">
                <img 
                  src="/images/brand/ai-surfer-round.webp"
                  alt="OceanTideDrop AI Surfer" 
                  className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain rounded-2xl drop-shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:drop-shadow-[0_0_50px_rgba(34,211,238,0.55)] transition-all duration-500 hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-cyan-400 mt-6 block">OceanTideDrop AI Surfer</span>
            </div>
          )}
          {showHero && (
            <div className="text-center mb-12">
               <span className="text-cyan-400 font-bold uppercase tracking-[0.5em] text-[10px]">AI Surfer Growth Architecture</span>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative pt-32 pb-20 text-center text-cyan-200/90 text-sm z-10 shrink-0 mt-auto bg-black pl-64 lg:pl-72 w-full">
        {/* WAVE DIVIDER */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none transform -translate-y-full">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-[calc(100%+1.3px)] h-[50px] relative block">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C89.71,110.59,173.34,87.35,250.45,61.76Z" className="fill-black"></path>
            </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-left mb-20">
           <div className="col-span-1 md:col-span-2">
              <div className="w-12 h-12 flex items-center justify-center rounded-sm mb-6">
                <img src="/images/brand/ai-surfer-round.webp" alt="AI Surfer Logo" className="w-full h-full object-contain" />
              </div>
              <p className="max-w-xs text-white font-medium leading-relaxed mb-8">
                AI Surfer: A premium growth agency building digital architecture for tomorrow-focused brands.
              </p>
              
              <div className="max-w-md w-full mb-8">
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">Neural Dispatch (Newsletter)</h4>
                <form className="flex" onSubmit={e => { e.preventDefault(); alert('Subscribed to Neural Dispatch'); }}>
                  <input type="email" placeholder="Enter your email" required className="flex-1 bg-white/5 border border-white/10 rounded-l-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 placeholder:text-zinc-600" />
                  <button type="submit" className="bg-cyan-400 text-black px-4 py-2 rounded-r-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-300 transition-colors">Join</button>
                </form>
              </div>

              <div className="flex items-center gap-4">
                 <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-400 transition-all text-white">
                    <Twitter className="w-4 h-4" />
                 </a>
                 <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-400 hover:text-blue-400 transition-all text-white">
                    <Linkedin className="w-4 h-4" />
                 </a>
                 <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-pink-500/20 hover:border-pink-400 hover:text-pink-400 transition-all text-white">
                    <Instagram className="w-4 h-4" />
                 </a>
              </div>
           </div>
           <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Capabilities</h4>
              <ul className="flex flex-col gap-4 text-xs font-bold text-white/90">
                 <li><Link to="/services" className="hover:text-white transition-colors">Brand Identity</Link></li>
                 <li><Link to="/services" className="hover:text-white transition-colors">AI Integration</Link></li>
                 <li><Link to="/services" className="hover:text-white transition-colors">Growth Design</Link></li>
                 <li><Link to="/founders" className="hover:text-white transition-colors">Founders Society</Link></li>
              </ul>
           </div>
           <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Contact</h4>
              <ul className="flex flex-col gap-4 text-xs font-bold text-white/90">
                 <li className="flex items-center gap-2"><MapPin className="w-3 h-3 text-cyan-400" /> Charleston, SC 29414</li>
                 <li><a href="mailto:oceantidedropaisurf@gmail.com" className="hover:text-white transition-colors">oceantidedropaisurf@gmail.com</a></li>
                 <li className="pt-4"><Link to="/contact" className="inline-block px-6 py-3 bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 hover:text-black transition-all">Start Your Project</Link></li>
                 <li className="pt-4 mt-4 border-t border-white/5 flex flex-col gap-2">
                    <Link to="/support" className="hover:text-white transition-colors">Support & Service</Link>
                    <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                 </li>
              </ul>
           </div>
        </div>
        <div className="pt-12 border-t border-white/5 font-black uppercase tracking-[0.2em] text-[10px] text-white">
          © {new Date().getFullYear()} AI Surfer Marketing Agency — Peak Frequency.
        </div>
      </footer>
      <AIAssistant />
    </div>
  );
}
