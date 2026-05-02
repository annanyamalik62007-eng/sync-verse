import React, { useState } from "react";
import {
  Map,
  MapPin,
  User,
  Users,
  MessageCircle,
  Calendar,
  Compass,
  ArrowRight,
  MoreHorizontal,
  ChevronRight,
  Radio,
  Search,
  Crosshair,
  Bell,
  Settings,
  Send,
  Zap,
  Activity,
  Flame,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
type Student = {
  id: string;
  name: string;
  major: string;
  year: string;
  interests: string[];
  reason: string;
  signal: string;
  zone: string;
  avatar: string;
};

type Zone = {
  id: string;
  name: string;
  activeCount: number;
  trending: boolean;
};

type Event = {
  id: string;
  name: string;
  time: string;
  location: string;
  attendees: number;
  friendsGoing: string[];
};

type Squad = {
  id: string;
  name: string;
  members: number;
  tags: string[];
};

type Thread = {
  id: string;
  with: string;
  lastMessage: string;
  time: string;
  unread: boolean;
};

// --- Mock Data ---
const MATCHES: Student[] = [
  {
    id: "m1",
    name: "Anonymous Owl",
    major: "Computer Science",
    year: "Junior",
    interests: ["Distributed Systems", "Coffee"],
    reason: "Taking 3 of the same classes.",
    signal: "In Green Library right now",
    zone: "Green Library",
    avatar: "AO",
  },
  {
    id: "m2",
    name: "Silent Fox",
    major: "Mech-E",
    year: "Senior",
    interests: ["Robotics", "Bouldering"],
    reason: "Both into autonomous vehicles.",
    signal: "RSVP'd to Maker Night",
    zone: "Stata Center",
    avatar: "SF",
  },
  {
    id: "m3",
    name: "Wandering Bear",
    major: "Bioengineering",
    year: "Sophomore",
    interests: ["Synthetic Bio", "Jazz"],
    reason: "Shared interest in biotech.",
    signal: "Looking for a study group",
    zone: "Memorial Glade",
    avatar: "WB",
  },
  {
    id: "m4",
    name: "Quiet Lynx",
    major: "Philosophy",
    year: "Freshman",
    interests: ["Ethics", "AI Safety"],
    reason: "Read the same paper yesterday.",
    signal: "Online recently",
    zone: "Main Quad",
    avatar: "QL",
  }
];

const ZONES: Zone[] = [
  { id: "z1", name: "Green Library", activeCount: 142, trending: true },
  { id: "z2", name: "Stata Center", activeCount: 89, trending: false },
  { id: "z3", name: "Memorial Glade", activeCount: 215, trending: true },
  { id: "z4", name: "Coupa Cafe", activeCount: 45, trending: false },
];

const EVENTS: Event[] = [
  { id: "e1", name: "Late Night Hackathon", time: "9:00 PM", location: "Huang Engineering", attendees: 120, friendsGoing: ["AO", "SF"] },
  { id: "e2", name: "Bio-Ethics Seminar", time: "7:30 PM", location: "Hewlett Teaching", attendees: 45, friendsGoing: ["QL"] },
  { id: "e3", name: "Indie Rock Show", time: "10:00 PM", location: "Co-op House", attendees: 80, friendsGoing: ["WB"] },
];

const SQUADS: Squad[] = [
  { id: "s1", name: "Sprint Founders", members: 12, tags: ["Startups", "Weekend Build"] },
  { id: "s2", name: "Mech-Interp Lab", members: 8, tags: ["AI", "Research"] },
  { id: "s3", name: "Midnight Runners", members: 24, tags: ["Fitness", "Campus Loop"] },
];

const THREADS: Thread[] = [
  { id: "t1", with: "Anonymous Owl", lastMessage: "Are you heading to the library?", time: "2m ago", unread: true },
  { id: "t2", with: "Silent Fox", lastMessage: "The robotics lab is open until 2am.", time: "1h ago", unread: false },
];

const MAJOR_MATES: Student[] = [
  { id: "mm1", name: "Curious Cat", major: "Computer Science", year: "Senior", interests: [], reason: "", signal: "", zone: "Gates", avatar: "CC" },
  { id: "mm2", name: "Swift Hare", major: "Computer Science", year: "Sophomore", interests: [], reason: "", signal: "", zone: "Huang", avatar: "SH" },
  { id: "mm3", name: "Clever Deer", major: "Computer Science", year: "Junior", interests: [], reason: "", signal: "", zone: "Coupa Cafe", avatar: "CD" },
];

export function Atlas() {
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="min-h-screen bg-[#Fdfbf7] text-[#1c2833] font-sans relative overflow-x-hidden selection:bg-[#2b5b84] selection:text-[#Fdfbf7]">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        
        .font-serif { font-family: 'Libre Baskerville', serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .topo-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%232b5b84' fill-opacity='0.03' fill-rule='evenodd'/%3E");
        }
        
        .paper-shadow {
          box-shadow: 0 4px 20px -4px rgba(43, 91, 132, 0.05), 0 2px 8px -2px rgba(43, 91, 132, 0.03);
        }
        
        .dashed-border {
          border: 1px dashed rgba(43, 91, 132, 0.2);
        }
        
        .map-line {
          position: absolute;
          border-left: 2px dotted rgba(43, 91, 132, 0.3);
          z-index: 0;
        }
      `}} />

      {/* Background Topo */}
      <div className="absolute inset-0 topo-bg pointer-events-none" />

      {/* Map Connections (Decorative) */}
      <div className="hidden lg:block absolute left-1/2 top-40 h-96 map-line" style={{ transform: 'rotate(15deg)' }} />
      <div className="hidden lg:block absolute left-1/4 top-80 h-64 map-line" style={{ transform: 'rotate(-45deg)' }} />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-10">
        
        {/* Header / Identity Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b dashed-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2b5b84] text-[#Fdfbf7] flex items-center justify-center font-serif text-xl shadow-inner">
              P
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#1c2833] tracking-tight">Phantom Scholar</h1>
              <div className="flex items-center gap-2 text-sm text-[#2b5b84] font-medium mt-0.5">
                <span className="flex items-center gap-1 bg-[#2b5b84]/10 px-2 py-0.5 rounded-full">
                  <MapPin className="w-3 h-3" /> Stanford
                </span>
                <span className="flex items-center gap-1 text-[#1c2833]/60">
                  <Compass className="w-3 h-3" /> Current Zone: Main Quad
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-[#2b5b84]/5 text-[#2b5b84] transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d95c50] rounded-full border-2 border-[#Fdfbf7]" />
            </button>
            <button className="p-2 rounded-full hover:bg-[#2b5b84]/5 text-[#2b5b84] transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 bg-[#2b5b84] hover:bg-[#1a3d5c] text-[#Fdfbf7] px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg">
              <Radio className="w-4 h-4" /> Broadcast Status
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Column */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* Live Map Zones */}
            <section className="bg-white rounded-2xl p-6 paper-shadow border border-[#e8e4dc]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#2b5b84]" /> Live Campus Zones
                  </h2>
                  <p className="text-sm text-[#1c2833]/60 mt-1">Where the energy is right now</p>
                </div>
                <button className="text-sm font-medium text-[#2b5b84] hover:underline flex items-center gap-1">
                  Full Map <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ZONES.map(zone => (
                  <div key={zone.id} className="p-4 rounded-xl border dashed-border hover:border-[#2b5b84]/40 transition-colors group cursor-pointer bg-[#Fdfbf7]/50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{zone.name}</h3>
                      {zone.trending && <Flame className="w-4 h-4 text-[#d95c50]" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-[#2b5b84] font-medium">
                        <Users className="w-4 h-4" /> {zone.activeCount} active
                      </div>
                      <button className="text-xs font-bold uppercase tracking-wider text-[#1c2833] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Drop In <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Matches Feed */}
            <section>
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                  <Crosshair className="w-6 h-6 text-[#2b5b84]" /> Convergence
                </h2>
                <span className="text-xs font-bold tracking-widest text-[#1c2833]/40 uppercase">Within 1 Mile</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {MATCHES.map(match => (
                  <div key={match.id} className="bg-white rounded-2xl p-5 paper-shadow border border-[#e8e4dc] flex flex-col sm:flex-row gap-5 items-start sm:items-center group">
                    <div className="w-16 h-16 shrink-0 rounded-full bg-[#2b5b84]/10 border border-[#2b5b84]/20 flex items-center justify-center font-serif text-xl text-[#2b5b84]">
                      {match.avatar}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{match.name}</h3>
                        <span className="w-1 h-1 rounded-full bg-[#1c2833]/30" />
                        <span className="text-sm font-medium text-[#1c2833]/70">{match.major}</span>
                        <span className="w-1 h-1 rounded-full bg-[#1c2833]/30" />
                        <span className="text-sm text-[#1c2833]/60">{match.year}</span>
                      </div>
                      <p className="text-[#1c2833]/80 text-sm mb-2">{match.reason}</p>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium bg-[#2b5b84]/5 text-[#2b5b84] px-2.5 py-1 rounded-md">
                          <Zap className="w-3 h-3" /> {match.signal}
                        </div>
                        {match.interests.map(interest => (
                          <span key={interest} className="text-xs border dashed-border px-2 py-1 rounded-md text-[#1c2833]/60">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#2b5b84] text-[#Fdfbf7] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3d5c] transition-colors">
                        <CheckCircle2 className="w-4 h-4" /> Connect
                      </button>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-transparent border border-[#e8e4dc] text-[#1c2833]/60 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1c2833]/5 transition-colors">
                        <XCircle className="w-4 h-4" /> Skip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Threads */}
            <section className="bg-white rounded-2xl p-5 paper-shadow border border-[#e8e4dc]">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 mb-4">
                <MessageCircle className="w-4 h-4 text-[#2b5b84]" /> Active Threads
              </h2>
              <div className="flex flex-col gap-4">
                {THREADS.map(thread => (
                  <div key={thread.id} className="flex gap-3 items-start group cursor-pointer">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[#2b5b84]/10 flex items-center justify-center font-serif text-sm text-[#2b5b84]">
                        {thread.with.split(' ').map(n=>n[0]).join('')}
                      </div>
                      {thread.unread && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#2b5b84] rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className={cn("text-sm truncate", thread.unread ? "font-bold" : "font-medium text-[#1c2833]/80")}>{thread.with}</h4>
                        <span className="text-[10px] text-[#1c2833]/40 shrink-0">{thread.time}</span>
                      </div>
                      <p className={cn("text-xs truncate", thread.unread ? "text-[#1c2833] font-medium" : "text-[#1c2833]/60")}>{thread.lastMessage}</p>
                    </div>
                  </div>
                ))}
                <button className="w-full mt-2 py-2 text-xs font-bold uppercase tracking-widest text-[#2b5b84] border dashed-border rounded-lg hover:bg-[#2b5b84]/5 transition-colors">
                  View All Messages
                </button>
              </div>
            </section>

            {/* Tonight's Events */}
            <section className="bg-white rounded-2xl p-5 paper-shadow border border-[#e8e4dc]">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-[#2b5b84]" /> Tonight
              </h2>
              <div className="flex flex-col gap-4">
                {EVENTS.map(event => (
                  <div key={event.id} className="flex flex-col gap-2 pb-4 border-b dashed-border last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm leading-snug">{event.name}</h4>
                      <span className="text-xs font-medium bg-[#2b5b84]/10 text-[#2b5b84] px-2 py-0.5 rounded-full whitespace-nowrap">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#1c2833]/60">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 text-xs text-[#1c2833]/60">
                        <Users className="w-3 h-3" /> {event.attendees} going
                      </div>
                      <button className="text-xs font-bold text-[#2b5b84] hover:underline">Join</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Squads */}
            <section className="bg-white rounded-2xl p-5 paper-shadow border border-[#e8e4dc]">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#2b5b84]" /> Suggested Squads
              </h2>
              <div className="flex flex-col gap-3">
                {SQUADS.map(squad => (
                  <div key={squad.id} className="p-3 border dashed-border rounded-xl hover:border-[#2b5b84]/30 transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">{squad.name}</h4>
                      <span className="text-xs text-[#1c2833]/50">{squad.members} members</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {squad.tags.map(tag => (
                         <span key={tag} className="text-[10px] bg-[#Fdfbf7] border border-[#e8e4dc] px-1.5 py-0.5 rounded text-[#1c2833]/60">{tag}</span>
                      ))}
                    </div>
                    <button className="w-full py-1.5 bg-[#2b5b84]/5 text-[#2b5b84] text-xs font-bold rounded-md group-hover:bg-[#2b5b84] group-hover:text-[#Fdfbf7] transition-colors">
                      Request to Join
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Major Mates */}
            <section className="bg-transparent">
              <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-[#1c2833]/40 mb-4 px-2">
                Major Mates nearby
              </h2>
              <div className="flex gap-2 px-2 overflow-x-auto pb-2 scrollbar-hide">
                {MAJOR_MATES.map(mate => (
                  <div key={mate.id} className="flex flex-col items-center gap-1.5 min-w-[60px]" title={mate.name}>
                    <div className="w-12 h-12 rounded-full bg-[#Fdfbf7] border border-[#e8e4dc] paper-shadow flex items-center justify-center font-serif text-sm text-[#2b5b84] hover:scale-105 transition-transform cursor-pointer relative">
                      {mate.avatar}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#Fdfbf7] rounded-full" />
                    </div>
                    <span className="text-[10px] text-[#1c2833]/60 truncate w-full text-center">{mate.zone}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
        
      </div>
    </div>
  );
}
