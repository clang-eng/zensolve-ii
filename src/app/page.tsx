import Link from 'next/link';
import Navbar from '@/components/layouts/Navbar';
import { Shield, Award, Users, MapPin, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: MapPin,
      title: "Location Guard",
      desc: "GPS-verified reporting ensures every grievance is legitimate and tied to a real-world location.",
      color: "teal",
      bgClass: "bg-teal-500/10",
      textClass: "text-teal-400",
      borderClass: "border-teal-500/20"
    },
    {
      icon: Shield,
      title: "Community Audit",
      desc: "Resolved issues are validated by citizens like you. Quality work is celebrated, and failures are reopened.",
      color: "blue",
      bgClass: "bg-blue-500/10",
      textClass: "text-blue-400",
      borderClass: "border-blue-500/20"
    },
    {
      icon: Award,
      title: "Impact Rewards",
      desc: "Your contribution earns you points redeemable for coffee, discounts, and local services.",
      color: "purple",
      bgClass: "bg-purple-500/10",
      textClass: "text-purple-400",
      borderClass: "border-purple-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] selection:bg-teal-500/30 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-teal-400 mb-10 fade-in shadow-xl">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Empowering Citizens, Rebuilding Communities
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            Fix your city. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600">Get Rewarded.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            ZenSolve is the community-driven heartbeat of urban governance. Report issues, validate improvements, and earn real-world rewards for your civic duty.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/report" className="w-full sm:w-auto px-10 py-5 bg-teal-500 hover:bg-teal-400 text-black font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group">
              Start Reporting
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/explore" className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black transition-all backdrop-blur-md flex items-center justify-center gap-3">
              Explore Live Map
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="py-12 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 grayscale opacity-40">
          <span className="text-xl font-bold tracking-tighter">COUNCIL-TECH</span>
          <span className="text-xl font-bold tracking-tighter">URBANHUB</span>
          <span className="text-xl font-bold tracking-tighter">CITIZENFIRST</span>
          <span className="text-xl font-bold tracking-tighter">GOVDIGITAL</span>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black tracking-tighter mb-6">Designed for <span className="text-teal-400">Trust</span>.</h2>
              <p className="text-xl text-gray-400 font-medium">Traditional systems are silent. ZenSolve is transparent, community-validated, and fast.</p>
            </div>
            <Link href="/community" className="text-teal-400 font-black flex items-center gap-2 hover:underline">
              Leaderboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <div key={i} className="group p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all relative overflow-hidden">
                <div className={`w-16 h-16 rounded-2xl ${feature.bgClass} flex items-center justify-center ${feature.textClass} mb-8 border ${feature.borderClass} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "How it Works" Bento Grid */}
      <section className="py-40 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 h-[600px]">
            <div className="bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30 rounded-[3rem] p-12 flex flex-col justify-end group overflow-hidden relative">
              <div className="absolute top-12 left-12 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <Zap className="w-12 h-12 text-teal-400 mb-6" />
                <h3 className="text-4xl font-black mb-4">Snap. Report. Transmit.</h3>
                <p className="text-gray-400 max-w-sm font-medium">Submit grievances with photos and location data in under 30 seconds.</p>
              </div>
            </div>
            <div className="grid grid-rows-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 flex flex-col justify-center relative overflow-hidden group">
                <CheckCircle2 className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black mb-3">Community Vetted</h3>
                <p className="text-gray-400 font-medium">Issues are verified by the people who live there.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 flex flex-col justify-center relative overflow-hidden group">
                <TrophyIcon className="w-10 h-10 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black mb-3">Earn Your Place</h3>
                <p className="text-gray-400 font-medium">Climb the city leaderboard and become an Urban Hero.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Impact Section */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-black tracking-tighter mb-6">Real Impact, Real Change.</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-20 font-medium">
            Every report, every validation, every point earned contributes to a better, more responsive city.
            See the difference you're making.
          </p>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
              <Users className="w-16 h-16 text-blue-400 mb-6" />
              <div className="text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">15k+</div>
              <p className="text-gray-400 font-medium">Active Citizens</p>
            </div>
            <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mb-6" />
              <div className="text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">2.4k+</div>
              <p className="text-gray-400 font-medium">Issues Resolved</p>
            </div>
            <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
              <Award className="w-16 h-16 text-orange-400 mb-6" />
              <div className="text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">50k+</div>
              <p className="text-gray-400 font-medium">Points Earned</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-16 mb-20">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-teal-500/20">Z</div>
                <span className="text-2xl font-black text-white tracking-tight">ZenSolve</span>
              </div>
              <p className="leading-relaxed font-medium">Building transparent bridges between citizens and city administration through technology.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="flex flex-col gap-4">
                <span className="text-white font-black uppercase text-xs tracking-widest">Platform</span>
                <Link href="/explore" className="hover:text-teal-400 transition-colors font-medium">Live Feed</Link>
                <Link href="/community" className="hover:text-teal-400 transition-colors font-medium">Champions</Link>
                <Link href="/rewards" className="hover:text-teal-400 transition-colors font-medium">Marketplace</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-white font-black uppercase text-xs tracking-widest">Company</span>
                <Link href="/about" className="hover:text-teal-400 transition-colors font-medium">About Us</Link>
                <Link href="/contact" className="hover:text-teal-400 transition-colors font-medium">Contact</Link>
                <Link href="/terms" className="hover:text-teal-400 transition-colors font-medium">Terms</Link>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>© 2026 ZenSolve. Engineered for community impact.</div>
            <div className="flex items-center gap-8">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
