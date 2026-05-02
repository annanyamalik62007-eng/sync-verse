import React, { useState, useEffect } from "react";
import {
  Activity,
  Radio,
  Wifi,
  MapPin,
  Clock,
  ChevronRight,
  MessageSquare,
  Users,
  Zap,
  Globe,
  Circle,
  Hash,
  Terminal,
  Send,
  MoreHorizontal
} from "lucide-react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=JetBrains+Mono:wght@100..800&family=Inter:wght@300..700&display=swap');

  .syncverse-pulse {
    --bg: #050505;
    --fg: #F4F4F5;
    --accent: #FF3300;
    --accent-dim: rgba(255, 51, 0, 0.15);
    --border: #1A1A1A;
    --border-light: #2A2A2A;
    --muted: #888888;
    
    background-color: var(--bg);
    color: var(--fg);
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    selection: background-color: var(--accent); color: var(--bg);
  }

  .syncverse-pulse .font-serif {
    font-family: 'Playfair Display', serif;
  }

  .syncverse-pulse .font-mono {
    font-family: 'JetBrains Mono', monospace;
  }

  .syncverse-pulse-grid {
    background-image: 
      linear-gradient(to right, var(--border) 1px, transparent 1px),
      linear-gradient(to bottom, var(--border) 1px, transparent 1px);
    background-size: 40px 40px;
    background-position: center top;
  }

  .syncverse-pulse .scanline {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(
      to bottom,
      rgba(255,255,255,0),
      rgba(255,255,255,0) 50%,
      rgba(0,0,0,0.1) 50%,
      rgba(0,0,0,0.1)
    );
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 50;
    opacity: 0.3;
  }

  .syncverse-pulse .ticker-container {
    overflow: hidden;
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
    padding: 4px 0;
    background: #000;
  }

  .syncverse-pulse .ticker-content {
    display: inline-block;
    animation: ticker 30s linear infinite;
  }

  @keyframes ticker {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-50%, 0, 0); }
  }

  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 0.5; }
    80% { transform: scale(2); opacity: 0; }
    100% { transform: scale(2); opacity: 0; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .syncverse-pulse .status-dot {
    position: relative;
    width: 8px;
    height: 8px;
    background-color: var(--accent);
    border-radius: 50%;
  }

  .syncverse-pulse .status-dot::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 1px solid var(--accent);
    border-radius: 50%;
    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  }

  .syncverse-pulse .blinking {
    animation: blink 2s infinite;
  }

  .syncverse-pulse .hairline {
    height: 1px;
    background-color: var(--border);
    width: 100%;
  }
  
  .syncverse-pulse .hairline-v {
    width: 1px;
    background-color: var(--border);
    height: 100%;
  }

  .syncverse-pulse .box-border {
    border: 1px solid var(--border);
  }
  
  .syncverse-pulse .hover-bg:hover {
    background-color: var(--border);
  }

  .syncverse-pulse .text-accent {
    color: var(--accent);
  }
  .syncverse-pulse .text-muted {
    color: var(--muted);
  }
  .syncverse-pulse .text-fg,
  .syncverse-pulse .text-foreground {
    color: var(--fg);
  }
  .syncverse-pulse .border-border {
    border-color: var(--border);
  }
  .syncverse-pulse .border-border-light {
    border-color: var(--border-light);
  }
  .syncverse-pulse .bg-bg {
    background-color: var(--bg);
  }
  .syncverse-pulse .bg-accent {
    background-color: var(--accent);
  }
  .syncverse-pulse .border-accent {
    border-color: var(--accent);
  }
`;

const TICKER_TEXT = "LIVE BROADCAST: 142 STUDENTS ACTIVE ON CAMPUS /// MEMORIAL GLADE SPONTANEOUS MEETUP +43 /// HACKATHON PREP IN SODA HALL /// STATA CENTER LATE NIGHT LAB /// ";

export function Pulse() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + Math.floor(now.getMilliseconds() / 100));
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="syncverse-pulse relative min-h-screen text-sm">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="scanline" />

      {/* Top Ticker */}
      <div className="ticker-container font-mono text-[10px] uppercase tracking-widest text-accent sticky top-0 z-40 bg-black">
        <div className="ticker-content">
          {TICKER_TEXT}{TICKER_TEXT}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="max-w-[1600px] mx-auto min-h-screen flex flex-col md:flex-row syncverse-pulse-grid">
        
        {/* LEFT COLUMN - Identity & Navigation */}
        <div className="w-full md:w-64 border-r border-border shrink-0 flex flex-col bg-black/80 backdrop-blur-md sticky top-[25px] h-[calc(100vh-25px)]">
          {/* Identity */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-none bg-accent/10 border border-accent flex items-center justify-center text-accent">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono text-xs text-muted">ID: anon_4f8a</div>
                <div className="font-serif text-lg font-bold tracking-wide">MIT</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-mono text-accent bg-accent/10 border border-accent/20 p-2 rounded-none mb-4">
              <div className="status-dot scale-75" />
              <span>ZONE: STATA CENTER</span>
            </div>

            <div className="font-mono text-xs text-muted flex flex-col gap-1">
              <div className="flex justify-between"><span>UPTIME</span><span className="text-white">04:12:44</span></div>
              <div className="flex justify-between"><span>SIGNAL</span><span className="text-accent">STRONG</span></div>
            </div>
          </div>

          {/* Nav */}
          <div className="p-4 flex-1">
            <div className="space-y-1 font-mono text-xs tracking-wider">
              <div className="p-2 border border-border bg-white/5 flex items-center justify-between cursor-pointer">
                <span className="text-white">/FEED</span>
                <ChevronRight className="w-3 h-3 text-accent" />
              </div>
              <div className="p-2 border border-transparent text-muted hover-bg flex items-center justify-between cursor-pointer transition-colors">
                <span>/ZONES</span>
              </div>
              <div className="p-2 border border-transparent text-muted hover-bg flex items-center justify-between cursor-pointer transition-colors">
                <span>/MESSAGES</span>
                <span className="bg-accent text-black px-1.5 rounded-sm font-bold">3</span>
              </div>
              <div className="p-2 border border-transparent text-muted hover-bg flex items-center justify-between cursor-pointer transition-colors">
                <span>/SQUADS</span>
              </div>
            </div>
          </div>

          {/* Clock */}
          <div className="p-6 border-t border-border font-mono">
            <div className="text-xs text-muted mb-1">LOCAL TIME</div>
            <div className="text-xl tracking-tighter">{time}</div>
          </div>
        </div>

        {/* MIDDLE COLUMN - The Feed */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border">
          <div className="p-6 md:p-8 lg:p-12 pb-24">
            <div className="mb-12">
              <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-none">
                THE PULSE
              </h1>
              <p className="font-mono text-xs tracking-widest text-muted max-w-md uppercase">
                Synchronizing 3,402 active nodes on campus. Filtering signal from noise.
              </p>
            </div>

            {/* Primary CTA */}
            <div className="mb-16">
              <div className="group relative border border-accent bg-accent/5 p-1 cursor-pointer">
                <div className="absolute inset-0 bg-accent/10 translate-x-2 translate-y-2 -z-10 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
                <div className="border border-accent p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-black">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Radio className="w-4 h-4 text-accent blinking" />
                      <span className="font-mono text-xs text-accent tracking-widest">BROADCAST INTENT</span>
                    </div>
                    <div className="font-serif text-2xl">Looking for late night co-founders?</div>
                  </div>
                  <button className="bg-accent text-black font-mono text-xs font-bold px-6 py-3 tracking-widest hover:bg-white transition-colors shrink-0">
                    TRANSMIT
                  </button>
                </div>
              </div>
            </div>

            {/* Matches */}
            <div className="mb-16">
              <div className="flex items-end justify-between border-b border-border pb-4 mb-6">
                <div>
                  <h2 className="font-serif text-2xl">High-Resonance Nodes</h2>
                  <div className="font-mono text-xs text-muted mt-1">Found 8 matches nearby</div>
                </div>
                <div className="font-mono text-[10px] text-accent border border-accent px-2 py-1">AUTO-REFRESHING</div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {[
                  { name: "anon_9x2p", major: "EECS", year: "'25", why: "Also studying for 6.046 tonight", signal: "Same building (Stata)", strength: 95 },
                  { name: "anon_4v1m", major: "Math", year: "'26", why: "Both interested in latent space modeling", signal: "Active 2m ago", strength: 88 },
                  { name: "anon_7l0k", major: "Physics", year: "'25", why: "RSVP'd to HackMIT builder session", signal: "Walking towards you", strength: 82 },
                  { name: "anon_3c8j", major: "MechE", year: "'24", why: "Both built hardware projects last semester", signal: "In area (Area 4)", strength: 75 },
                ].map((match, i) => (
                  <div key={i} className="box-border p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-mono text-xs mb-1 text-muted">[{match.major} / {match.year}]</div>
                        <div className="font-serif text-lg">{match.name}</div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className={`w-1.5 h-4 ${j < (match.strength/20) ? 'bg-accent' : 'bg-border'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-4 h-10 border-l-2 border-border-light pl-3 flex flex-col justify-center">
                      "{match.why}"
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div className="font-mono text-[10px] flex items-center gap-1.5 text-muted">
                        <MapPin className="w-3 h-3 text-accent" />
                        {match.signal.toUpperCase()}
                      </div>
                      <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center border border-border text-muted hover:text-white hover:border-white transition-colors">
                          ×
                        </button>
                        <button className="h-8 px-4 border border-accent text-accent font-mono text-xs hover:bg-accent hover:text-black transition-colors">
                          SYNC
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Zones */}
            <div className="mb-16">
              <div className="flex items-end justify-between border-b border-border pb-4 mb-6">
                <div>
                  <h2 className="font-serif text-2xl">Active Zones</h2>
                  <div className="font-mono text-xs text-muted mt-1">Live heat map of campus</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-px bg-border">
                {[
                  { name: "Stata Center / Floor 1", count: 42, trend: "up", tags: ["CS", "Hacking"] },
                  { name: "Hayden Library", count: 28, trend: "stable", tags: ["Quiet", "Finals"] },
                  { name: "Student Center", count: 105, trend: "up", tags: ["Social", "Food"] },
                ].map((zone, i) => (
                  <div key={i} className="bg-black p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-right font-mono text-xl text-accent">
                        {zone.count}
                      </div>
                      <div>
                        <div className="font-serif text-lg">{zone.name}</div>
                        <div className="flex gap-2 mt-1">
                          {zone.tags.map((tag, j) => (
                            <span key={j} className="font-mono text-[9px] uppercase border border-border px-1.5 py-0.5 text-muted">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button className="font-mono text-xs border border-border px-4 py-2 hover:border-white transition-colors">
                      DROP IN
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>

        {/* RIGHT COLUMN - Context & Ancillary */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 bg-black/80 backdrop-blur-md flex flex-col">
          
          {/* Threads */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-mono text-xs tracking-widest text-muted">ACTIVE THREADS</h3>
              <div className="w-2 h-2 bg-accent rounded-none" />
            </div>
            <div className="space-y-4">
              <div className="group cursor-pointer">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-serif text-base group-hover:text-accent transition-colors">anon_7x9q</div>
                  <div className="font-mono text-[10px] text-muted">2m ago</div>
                </div>
                <div className="text-sm text-gray-400 truncate">Are you heading to the Media Lab?</div>
              </div>
              <div className="group cursor-pointer">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-serif text-base group-hover:text-accent transition-colors flex items-center gap-2">
                    anon_2b4w <span className="w-1.5 h-1.5 bg-accent rounded-full inline-block" />
                  </div>
                  <div className="font-mono text-[10px] text-accent">NEW</div>
                </div>
                <div className="text-sm text-white font-medium truncate">Found an empty room in building 36!</div>
              </div>
            </div>
          </div>

          {/* Tonight's Events */}
          <div className="p-6 border-b border-border">
            <h3 className="font-mono text-xs tracking-widest text-muted mb-6">TONIGHT'S FREQUENCIES</h3>
            <div className="space-y-6">
              {[
                { time: "23:00", name: "Midnight Coffee & Code", location: "Area 4", rsvp: 12, friends: 2 },
                { time: "01:00", name: "Rooftop Stargazing", location: "Green Bldg", rsvp: 8, friends: 0 },
              ].map((event, i) => (
                <div key={i}>
                  <div className="flex gap-4 items-start mb-3">
                    <div className="font-mono text-xs text-accent mt-1">{event.time}</div>
                    <div>
                      <div className="font-serif text-lg leading-tight mb-1">{event.name}</div>
                      <div className="font-mono text-[10px] text-muted mb-2">@ {event.location}</div>
                      <div className="text-xs text-gray-400 mb-3">
                        {event.rsvp} attending {event.friends > 0 && `· ${event.friends} connections`}
                      </div>
                    </div>
                  </div>
                  <button className="w-full border border-border font-mono text-xs py-2 hover:border-accent hover:text-accent transition-colors">
                    + RSVP
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Squads */}
          <div className="p-6 border-b border-border">
            <h3 className="font-mono text-xs tracking-widest text-muted mb-6">SUGGESTED SQUADS</h3>
            <div className="space-y-3">
              {[
                { name: "Hardware Hackers", members: 4 },
                { name: "Late Night Lift", members: 3 }
              ].map((squad, i) => (
                <div key={i} className="border border-border p-3 flex justify-between items-center group hover:border-accent/50 transition-colors cursor-pointer">
                  <div>
                    <div className="font-serif text-sm">{squad.name}</div>
                    <div className="font-mono text-[10px] text-muted">{squad.members}/6 SLOTS FILLED</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Major Mates */}
          <div className="p-6 flex-1">
            <h3 className="font-mono text-xs tracking-widest text-muted mb-6">MAJOR HUB: EECS</h3>
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-10 h-10 border border-border flex items-center justify-center font-mono text-xs text-muted hover:border-accent hover:text-accent cursor-pointer transition-colors" title={`anon_${Math.random().toString(36).substring(2,6)}`}>
                  {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                </div>
              ))}
            </div>
            <div className="mt-4 font-mono text-[10px] text-muted text-right">VIEW ALL →</div>
          </div>

        </div>

      </div>
    </div>
  );
}
