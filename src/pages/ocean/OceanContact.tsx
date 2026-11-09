import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import OceanBubbles from '../../components/OceanBubbles';
import OceanChatbot from '../../components/OceanChatbot';
import { Send, User, Mail, MessageSquare } from 'lucide-react';

export default function OceanContact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 3000);
  };

  return (
    <PageWrapper>
      <div className="-mt-4 md:-mt-8 -mx-4 md:-mx-8 min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#021B33] via-[#033860] to-[#0AA1DD] text-slate-100 font-sans overflow-x-hidden selection:bg-cyan-500/30 relative">
        <OceanBubbles />
        <nav className="flex items-center justify-between px-6 py-4 bg-[#030e1a]/80 backdrop-blur-md border-b border-cyan-900/40 sticky top-0 z-50 select-none">
          <Link className="flex items-center gap-2 font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-lg md:text-xl cursor-pointer" to="/ocean">
            <span className="text-2xl" role="img" aria-label="wave">🌊</span>
            OCEAN TIDE DROP
            <span className="text-2xl hidden sm:inline-block" role="img" aria-label="flower">🌺</span>
          </Link>
          <ul className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-cyan-100/70 justify-between p-0 list-none m-0">
            <li><Link className="hover:text-cyan-400 transition-colors cursor-pointer" to="/ocean-services">Services</Link></li>
            <li><Link className="hover:text-cyan-400 transition-colors cursor-pointer" to="/ocean">Free Tools</Link></li>
            <li><Link className="hover:text-cyan-400 transition-colors cursor-pointer" to="/ocean-cases">Success Stories</Link></li>
            <li><Link className="hover:text-cyan-400 transition-colors cursor-pointer" to="/ocean-reports">Surf Reports</Link></li>
            <li className="text-cyan-400 cursor-pointer">Contact</li>
          </ul>
        </nav>

        <header className="relative pt-24 pb-16 overflow-hidden text-center">
          <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[600px] h-[400px] rounded-[100%] bg-gradient-to-br from-pink-600 to-rose-800 blur-[150px] opacity-20 pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-pink-200 mb-6 tracking-tight flex items-center justify-center gap-4">
              <span className="text-5xl md:text-6xl">🌺</span> Contact Ocean Tide Drop
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100/60 font-light max-w-2xl mx-auto">
              Ready to ride the wave? Let's connect and build your AI automation systems.
            </p>
          </div>
        </header>

        <section className="py-16 md:py-24 relative z-10">
          <div className="max-w-2xl mx-auto px-6">
            <div className="bg-[#030e1a]/80 backdrop-blur-xl border border-cyan-800/60 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-pink-600 rounded-[2.6rem] blur opacity-10 pointer-events-none"></div>

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-3 ml-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-600 w-6 h-6" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#02070e] border border-cyan-900/60 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-lg shadow-inner placeholder:text-slate-700"
                      placeholder="e.g. Shannon Cahoon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-3 ml-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-600 w-6 h-6" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#02070e] border border-cyan-900/60 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-lg shadow-inner placeholder:text-slate-700"
                      placeholder="Your Email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-3 ml-1 uppercase tracking-wider">
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-5 top-6 text-cyan-600 w-6 h-6" />
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full bg-[#02070e] border border-cyan-900/60 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-lg shadow-inner placeholder:text-slate-700 resize-none"
                      placeholder="AI SURFER Marketing Agency"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-[#020b14] font-black text-xl hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] transition-all transform hover:scale-[1.02] mt-4 flex items-center justify-center gap-3"
                >
                  <Send className="w-6 h-6" /> Catch the Wave 🌊
                </button>

                {submitted && (
                  <div className="mt-6 p-4 bg-[#02070e] border border-cyan-500/30 rounded-xl text-center animate-pulse">
                    <p className="text-cyan-300 font-medium tracking-wide">Message sent! We'll catch up with you soon. 🌊</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        <OceanChatbot />
      </div>
    </PageWrapper>
  );
}
