import React, { useState } from "react";
import {
  MapPin,
  Users,
  MessageSquare,
  Zap,
  Activity,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Flame,
  Radio,
  Coffee,
  X,
  Check,
  Send,
  Search,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

const mockUser = {
  handle: "quantum_leaper",
  college: "Stanford",
  zone: "Green Library",
};

const topMatches = [
  {
    id: 1,
    name: "Alex",
    major: "CS",
    year: "Junior",
    shared: ["AI", "House Music"],
    whyConnect: "You both follow the Sprint Founders thread",
    whyNow: "In the same building right now",
    urgent: true,
  },
  {
    id: 2,
    name: "Sam",
    major: "Mech-E",
    year: "Senior",
    shared: ["Robotics", "Climbing"],
    whyConnect: "Looking for a robotics co-founder",
    whyNow: "RSVP'd to Robotics Mixer tonight",
    urgent: false,
  },
  {
    id: 3,
    name: "Jordan",
    major: "EE",
    year: "Sophomore",
    shared: ["Synthwave", "Hardware"],
    whyConnect: "Vibing in the same EE study group",
    whyNow: "Live in Huang Engineering Center",
    urgent: true,
  },
  {
    id: 4,
    name: "Casey",
    major: "Bio",
    year: "Junior",
    shared: ["Biohacking", "Running"],
    whyConnect: "Shared connection: Morgan",
    whyNow: "Active 5m ago",
    urgent: false,
  },
];

const liveZones = [
  { id: 1, name: "Green Library", count: 142, trend: "up", energy: "High" },
  { id: 2, name: "Stata Center", count: 89, trend: "stable", energy: "Medium" },
  { id: 3, name: "Memorial Glade", count: 56, trend: "up", energy: "High" },
];

const tonightEvents = [
  { id: 1, name: "Late Night Build", time: "10:00 PM", location: "Huang Center", attendees: 45, friends: 3 },
  { id: 2, name: "Underground Synth", time: "11:30 PM", location: "Secret Basement", attendees: 120, friends: 12 },
  { id: 3, name: "Founders Mixer", time: "9:00 PM", location: "Coupa Cafe", attendees: 30, friends: 1 },
];

const squads = [
  { id: 1, name: "Sprint Founders", members: 12, active: 4, topic: "Shipping weekend projects" },
  { id: 2, name: "Mech-Interp Lab", members: 8, active: 2, topic: "Reading papers" },
];

const threads = [
  { id: 1, name: "Dorm 4 Crew", preview: "Are we still going to the mixer?", unread: 2, time: "2m" },
  { id: 2, name: "CS106B Study", preview: "I found the bug on line 42", unread: 0, time: "1h" },
];

const majorMates = [
  { id: 1, name: "Taylor", status: "online" },
  { id: 2, name: "Riley", status: "offline" },
  { id: 3, name: "Morgan", status: "online" },
  { id: 4, name: "Quinn", status: "online" },
];

export function Beacon() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="relative min-h-screen bg-[#06040A] text-slate-200 font-sans overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        .font-display { font-family: 'Outfit', sans-serif; }
        .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .glass-card {
          background: rgba(20, 15, 30, 0.4);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .glass-card-hover {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        
        .glass-card-hover:hover {
          background: rgba(30, 20, 50, 0.6);
          border-color: rgba(168, 85, 247, 0.3);
          box-shadow: 0 12px 40px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #E9D5FF 0%, #C084FC 50%, #38BDF8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .bg-gradient-holographic {
          background: linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%);
        }

        .bg-mesh {
          background-image: 
            radial-gradient(at 0% 0%, hsla(280, 100%, 74%, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, hsla(189, 100%, 56%, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsla(340, 100%, 76%, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(253, 100%, 50%, 0.15) 0px, transparent 50%);
        }
        
        .avatar-ring {
          position: relative;
        }
        .avatar-ring::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.8;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse-ring {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 50;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}} />

      <div className="grain-overlay" />
      
      {/* Background Image & Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#06040A] opacity-90 z-10" />
        <img 
          src="/__mockup/images/syncverse-beacon-bg.png" 
          alt="" 
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-mesh z-20" />
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#180A2B]/80 to-transparent z-20" />
      </div>

      {/* Main Content */}
      <div className="relative z-30 flex flex-col min-h-screen max-w-lg mx-auto md:border-x md:border-white/10 bg-black/20 backdrop-blur-sm">
        
        {/* Header / Identity Bar */}
        <header className="sticky top-0 z-50 glass-card border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar-ring">
              <Avatar className="h-10 w-10 border-2 border-transparent">
                <AvatarFallback className="bg-purple-900 text-purple-200 font-display font-bold">QL</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg text-white">@{mockUser.handle}</span>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-xs px-2 py-0 h-5 font-body">
                  {mockUser.college}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-purple-300/70 font-body">
                <MapPin className="h-3 w-3" />
                <span>{mockUser.zone}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-1 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
              </div>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="rounded-full text-white/70 hover:text-white hover:bg-white/10">
            <Search className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 p-6 space-y-10 pb-32">
          
          {/* Top Matches Feed */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <span className="text-gradient">Radar</span>
              </h2>
              <Button variant="link" className="text-xs text-white/50 hover:text-white px-0 font-body">
                View all <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="grid gap-4">
              {topMatches.slice(0, 3).map((match) => (
                <div key={match.id} className="glass-card glass-hover rounded-2xl p-5 relative overflow-hidden group">
                  {match.urgent && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-400 opacity-50" />
                  )}
                  
                  <div className="flex gap-4">
                    <Avatar className="h-14 w-14 border border-white/10 shrink-0">
                      <AvatarFallback className="bg-slate-800 text-lg font-display text-white">
                        {match.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display font-bold text-lg text-white truncate">{match.name}</h3>
                          <p className="text-sm text-white/60 font-body">{match.major} • {match.year}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/5 text-white hover:bg-white/20">
                            <X className="h-4 w-4" />
                          </Button>
                          <Button size="icon" className="h-8 w-8 rounded-full bg-gradient-holographic text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border-0 hover:scale-105 transition-transform">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {match.shared.map(s => (
                            <Badge key={s} variant="secondary" className="bg-white/5 hover:bg-white/10 text-white/80 text-[10px] font-body border-white/5">
                              {s}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-sm text-purple-200/80 font-body">
                          {match.whyConnect}
                        </p>
                        
                        {match.whyNow && (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                            match.urgent 
                              ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' 
                              : 'bg-blue-500/10 text-blue-200 border border-blue-500/20'
                          }`}>
                            {match.urgent ? <Flame className="h-3 w-3 text-purple-400" /> : <Radio className="h-3 w-3 text-blue-400" />}
                            {match.whyNow}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Live Zones */}
          <section>
            <h2 className="font-display text-xl font-bold mb-4 text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Live Zones
            </h2>
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex gap-4 px-1">
                {liveZones.map(zone => (
                  <div key={zone.id} className="w-[180px] shrink-0 glass-card rounded-xl p-4 flex flex-col justify-between h-[120px] group cursor-pointer hover:border-emerald-500/30 transition-colors">
                    <div>
                      <h4 className="font-display font-bold text-white truncate">{zone.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-300 font-medium">{zone.count} active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-white/50 font-body bg-white/5 px-2 py-1 rounded-md">
                        {zone.energy} Energy
                      </span>
                      <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </section>

          {/* Tonight's Events */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Tonight
              </h2>
            </div>
            <div className="space-y-3">
              {tonightEvents.map(event => (
                <div key={event.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex flex-col items-center justify-center border border-white/10 shrink-0">
                    <span className="text-xs text-white/50 uppercase font-display">Tmt</span>
                    <span className="text-sm font-bold text-white">{event.time.split(' ')[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-white truncate">{event.name}</h4>
                    <p className="text-xs text-white/60 font-body truncate">{event.location}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex -space-x-1.5">
                        {[...Array(Math.min(3, event.friends))].map((_, i) => (
                          <div key={i} className="w-4 h-4 rounded-full bg-purple-500 border border-[#140F1E] z-10" />
                        ))}
                      </div>
                      <span className="text-[10px] text-white/40">{event.attendees} going</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 rounded-full h-8 text-xs font-bold border-white/10 bg-white/5 hover:bg-white/20 hover:text-white">
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Squads & Threads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Squads */}
            <section>
              <h2 className="font-display text-lg font-bold mb-3 text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                Squads
              </h2>
              <div className="space-y-3">
                {squads.map(squad => (
                  <div key={squad.id} className="glass-card rounded-xl p-3 border-cyan-500/10 hover:border-cyan-500/30 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-display font-semibold text-sm text-white">{squad.name}</h4>
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/10 bg-white/5 text-white/70">
                        {squad.members} mem
                      </Badge>
                    </div>
                    <p className="text-xs text-white/50 font-body truncate mb-3">{squad.topic}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-5 h-5 rounded-full bg-slate-700 border border-[#140F1E]" />
                        ))}
                      </div>
                      <span className="text-[10px] text-cyan-400 font-medium">{squad.active} active now</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Threads */}
            <section>
              <h2 className="font-display text-lg font-bold mb-3 text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-pink-400" />
                Active Threads
              </h2>
              <div className="space-y-3">
                {threads.map(thread => (
                  <div key={thread.id} className="glass-card rounded-xl p-3 flex gap-3 hover:bg-white/[0.08] transition-colors cursor-pointer relative">
                    {thread.unread > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-4 w-4 text-white/70" />
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="font-display font-semibold text-sm text-white truncate pr-2">{thread.name}</h4>
                        <span className="text-[10px] text-white/40 shrink-0">{thread.time}</span>
                      </div>
                      <p className={`text-xs truncate font-body ${thread.unread > 0 ? 'text-white/90 font-medium' : 'text-white/50'}`}>
                        {thread.preview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Major Mates */}
          <section className="pb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-white">Your Major (CS)</h2>
              <span className="text-xs text-white/40 font-body">12 online</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {majorMates.map(mate => (
                <div key={mate.id} className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="relative">
                    <Avatar className={`h-12 w-12 border-2 ${mate.status === 'online' ? 'border-emerald-500/50' : 'border-white/10'}`}>
                      <AvatarFallback className="bg-slate-800 text-white/70 font-display">
                        {mate.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {mate.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#06040A]" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-white/70">{mate.name}</span>
                </div>
              ))}
            </div>
          </section>

        </main>

        {/* Floating Action CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none flex justify-center">
          <div className="w-full max-w-lg pointer-events-auto relative">
            {/* Glow effect behind button */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#06040A] to-transparent pointer-events-none -z-10" />
            
            <Button 
              className="w-full h-14 rounded-full bg-gradient-holographic text-white font-display font-bold text-lg shadow-[0_10px_30px_rgba(168,85,247,0.4)] border border-white/20 hover:scale-[1.02] transition-transform overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center justify-center gap-2">
                <Coffee className="h-5 w-5" />
                Broadcast Status
              </span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
