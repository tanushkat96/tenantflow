import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Shield, Zap, Users, Globe, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Atmospheric Background Mesh */}
      <div className=" inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/45 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/25 blur-[100px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/35 blur-[150px] rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Floating Glass Navigation */}
      <nav className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        scrolled ? 'glass-panel shadow-atmospheric-lg' : 'glass-panel'
      } rounded-full px-6 py-3 max-w-2xl w-full mx-4`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Manrope' }}>
              TenantFlow
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-primary font-semibold text-sm tracking-tight hover:text-primary-dim transition-colors">
              Platform
            </a>
            <a href="#features" className="text-on-surface-variant text-sm tracking-tight hover:text-primary transition-colors">
              Features
            </a>
            <a href="#contact" className="text-on-surface-variant text-sm tracking-tight hover:text-primary transition-colors">
              Contact Us
            </a>
          </div>

          <Link
            to="/login"
            className="bg-primary text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-primary-dim transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
            style={{ fontFamily: 'Manrope' }}
          >
            Sign In 
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-7xl mx-auto" id='home'>
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-bold tracking-widest uppercase animate-scaleIn">
          <Sparkles className="w-4 h-4" />
          The Future of Task Management
        </div>

        {/* Hero Title */}
        <h1 className="font-extrabold tracking-tight text-on-surface max-w-4xl leading-[1.1] mb-8 animate-fadeIn" style={{
          fontFamily: 'Manrope',
          fontSize: 'clamp(2.5rem, 7vw, 4.5rem)'
        }}>
          Orchestrate your projects with{' '}
          <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Atmospheric Precision
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12 leading-relaxed animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          Experience a project management platform designed for clarity. TenantFlow transforms complex workflows into elegant task orchestration for modern teams.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <Link
            to="/register"
            className="px-8 py-4 rounded-full bg-gradient-to-br from-primary to-primary-dim text-white font-bold text-sm tracking-widest uppercase shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
            style={{ fontFamily: 'Manrope' }}
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-full border border-outline-variant/30 text-primary font-bold text-sm tracking-widest uppercase hover:bg-surface-container-low transition-all"
            style={{ fontFamily: 'Manrope' }}
          >
            Sign In
          </Link>
        </div>

        {/* Hero Image */}
        <div className="mt-20 relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-atmospheric-lg group animate-scaleIn" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10" />
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-primary-container/10 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-32 h-32 text-primary/30 mx-auto mb-4" />
              <p className="text-on-surface-variant font-semibold">Dashboard Preview</p>
            </div>
          </div>

          {/* Floating Glass Stats Card */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 glass-panel px-8 py-6 rounded-2xl shadow-atmospheric flex items-center gap-6 animate-float">
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Active Projects</span>
              <span className="text-3xl font-extrabold text-on-surface" style={{ fontFamily: 'Manrope' }}>847</span>
            </div>
            <div className="h-10 w-px bg-outline-variant/20" />
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-secondary tracking-widest uppercase mb-1">Team Efficiency</span>
              <span className="text-3xl font-extrabold text-on-surface" style={{ fontFamily: 'Manrope' }}>98.4%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="bg-surface-container-low py-24 md:py-32 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 animate-fadeIn">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Manrope' }}>
              Core Architecture
            </h2>
            <p className="text-on-surface-variant max-w-xl text-lg">
              Every module is built to provide maximum visibility with minimal friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Feature Card */}
            <div className="md:col-span-8 bg-surface-container-lowest p-8 md:p-12 rounded-3xl flex flex-col justify-between hover-lift group">
              <div>
                <div className="w-14 h-14 bg-primary-container/20 rounded-xl flex items-center justify-center mb-8 text-primary">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
                  Project Management
                </h3>
                <p className="text-on-surface-variant leading-relaxed max-w-md">
                 Organize and manage your projects with intuitive boards, timelines, and task dependencies that keep your team aligned and on track.
                </p>
              </div>
              <div className="mt-12 rounded-2xl overflow-hidden border border-surface-container bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
                <div className="space-y-4">
                  {[85, 92, 78].map((value, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-semibold text-on-surface-variant">
                        Project {i + 1}
                      </div>
                      <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-bold text-primary">{value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tall Purple Card */}
            <div className="md:col-span-4 bg-primary p-8 md:p-12 rounded-3xl text-white flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
                  Task Tracking
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Track every task with precision. Our intuitive interface allows you to monitor progress, set priorities, and ensure nothing falls through the cracks.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <Globe className="w-32 h-32 opacity-20" />
              </div>
            </div>

            {/* Small Feature Cards */}
            <div className="md:col-span-4 bg-surface-container-lowest p-8 rounded-3xl hover-lift group">
              <div className="w-12 h-12 bg-secondary-container/20 rounded-lg flex items-center justify-center mb-6 text-secondary">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>
                Security
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Your data is protected with enterprise-grade security measures and ensures your projects and information are safe and accessible whenever you need them.
              </p>
            </div>

            <div className="md:col-span-4 bg-surface-container-lowest p-8 rounded-3xl hover-lift group">
              <div className="w-12 h-12 bg-tertiary-container/20 rounded-lg flex items-center justify-center mb-6 text-tertiary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>
                Real-time Updates
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Stay updated with instant notifications and activity feeds that keep you informed of every change and comment on your projects.
              </p>
            </div>

            <div className="md:col-span-4 bg-surface-container-lowest p-8 rounded-3xl hover-lift group">
              <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center mb-6 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>
                Team Collaboration
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Invite team members, assign tasks, and communicate seamlessly with notifications that keep everyone in sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 overflow-hidden relative">
         <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/50 blur-[120px] rounded-full" />
        

        <div className="max-w-4xl mx-auto glass-panel p-12 md:p-20 rounded-[3rem] text-center relative z-10 shadow-atmospheric-lg bg-primary">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 text-white" style={{ fontFamily: 'Manrope' }}>
            Ready for TenantFlow?
          </h2>
          <p className="text-lg md:text-xl text-on-surface-variant mb-12 max-w-2xl mx-auto text-white/80 leading-relaxed">
            Join teams or manage your projects Seamlessly. Experience the future of project management with TenantFlow's intuitive interface and powerful features.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-gray-800 text-white px-10 py-5 rounded-full font-bold text-sm tracking-widest uppercase shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
              style={{ fontFamily: 'Manrope' }}
            >
              Get Started Now
            </Link>
            <button className="px-10 py-5 rounded-full border border-outline-variant/30 text-white font-bold text-sm tracking-widest uppercase hover:bg-white/50 transition-all" style={{ fontFamily: 'Manrope' }} id="contact">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low py-12 px-8">
        <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-lg font-black text-on-surface mb-2" style={{ fontFamily: 'Manrope' }}>
              TenantFlow
            </div>
            <p className="text-xs tracking-wide uppercase text-on-surface-variant">
              © 2026 TenantFlow. Atmospheric Precision.
            </p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs tracking-wide uppercase text-on-surface-variant hover:text-primary transition-all">Privacy</a>
            <a href="#" className="text-xs tracking-wide uppercase text-on-surface-variant hover:text-primary transition-all">Terms</a>
            <a href="#" className="text-xs tracking-wide uppercase text-on-surface-variant hover:text-primary transition-all">Security</a>
            <a href="#" className="text-xs tracking-wide uppercase text-on-surface-variant hover:text-primary transition-all">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;