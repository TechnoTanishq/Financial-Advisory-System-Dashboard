
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, PieChart, Activity, Users, Mail, MapPin, Phone, Menu, X, ChevronRight, Zap, Shield, Target, Sparkles } from 'lucide-react';

export default function FinancialAnalyticsLanding() {
   const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToLogin = () => {
  navigate('/login');
};

const handleDemo = () =>{
  navigate('/agent-flow')
};



  const chartData = [
    { month: 'Jan', value: 4000, growth: 2400 },
    { month: 'Feb', value: 3000, growth: 1398 },
    { month: 'Mar', value: 2000, growth: 9800 },
    { month: 'Apr', value: 2780, growth: 3908 },
    { month: 'May', value: 1890, growth: 4800 },
    { month: 'Jun', value: 2390, growth: 3800 },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #020617, #172554, #0f172a)',
      color: 'white',
      overflowX: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
        }

        .neon-text {
          font-family: 'Orbitron', sans-serif;
          text-shadow: 
            0 0 10px rgba(59, 130, 246, 0.8),
            0 0 20px rgba(59, 130, 246, 0.6),
            0 0 30px rgba(59, 130, 246, 0.4),
            0 0 40px rgba(59, 130, 246, 0.2);
          animation: neonPulse 2s ease-in-out infinite;
        }

        .neon-border {
          border: 2px solid rgba(59, 130, 246, 0.5);
          box-shadow: 
            0 0 10px rgba(59, 130, 246, 0.5),
            inset 0 0 10px rgba(59, 130, 246, 0.2);
        }

        .neon-glow {
          box-shadow: 
            0 0 20px rgba(59, 130, 246, 0.4),
            0 0 40px rgba(59, 130, 246, 0.2),
            inset 0 0 20px rgba(59, 130, 246, 0.1);
        }

        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card-3d:hover {
          transform: rotateY(5deg) rotateX(5deg) translateZ(20px);
        }

        @keyframes neonPulse {
          0%, 100% {
            text-shadow: 
              0 0 10px rgba(59, 130, 246, 0.8),
              0 0 20px rgba(59, 130, 246, 0.6),
              0 0 30px rgba(59, 130, 246, 0.4),
              0 0 40px rgba(59, 130, 246, 0.2);
          }
          50% {
            text-shadow: 
              0 0 15px rgba(59, 130, 246, 1),
              0 0 30px rgba(59, 130, 246, 0.8),
              0 0 45px rgba(59, 130, 246, 0.6),
              0 0 60px rgba(59, 130, 246, 0.4);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }

        .glass-effect {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .grid-pattern {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .perspective-container {
          perspective: 1000px;
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 50,
        transition: 'all 0.3s',
        ...(scrolled ? {
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        } : {
          background: 'transparent'
        })
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '5rem' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="animate-slide-in-left">
              <div className="neon-glow" style={{
                width: '2.5rem',
                height: '2.5rem',
                background: 'linear-gradient(to bottom right, #3b82f6, #22d3ee)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 style={{ color: 'white' }} size={24} />
              </div>
              <span className="neon-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>AstraGuard</span>
            </div>

            {/* Desktop Menu */}
            <div style={{ display: 'none', gap: '2rem', alignItems: 'center' }} className="desktop-menu">
              {['home', 'analytics', 'about', 'team', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  style={{
                    textTransform: 'capitalize',
                    fontWeight: '500',
                    transition: 'all 0.3s',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: activeSection === item ? '#60a5fa' : '#d1d5db',
                    fontSize: '1rem'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
                  onMouseLeave={(e) => e.target.style.color = activeSection === item ? '#60a5fa' : '#d1d5db'}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            <div style={{ display: 'none', gap: '1rem', alignItems: 'center' }} className="desktop-menu animate-slide-in-right">
              <button style={{
                padding: '0.5rem 1.5rem',
                color: '#d1d5db',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.3s',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
              onClick={goToLogin}
              >
                Login
              </button>
              <button className="neon-border" style={{
                padding: '0.5rem 1.5rem',
                background: 'linear-gradient(to right, #2563eb, #06b6d4)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                color: 'white',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '';
              }}
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'block',
                color: 'white',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              className="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="glass-effect" style={{ borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['home', 'analytics', 'about', 'team', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    textTransform: 'capitalize',
                    fontWeight: '500',
                    padding: '0.5rem 0',
                    transition: 'color 0.3s',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#d1d5db',
                    fontSize: '1rem'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  {item}
                </button>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <button style={{
                  width: '100%',
                  padding: '0.5rem',
                  textAlign: 'center',
                  color: '#d1d5db',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                  fontSize: '1rem'
                }}>
                  Login
                </button>
                <button className="neon-border" style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'linear-gradient(to right, #2563eb, #06b6d4)',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '1rem'
                }}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section id="home" className="grid-pattern" style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: '5rem'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent, rgba(23, 37, 84, 0.2), #0f172a)'
        }}></div>
        
        {/* Floating Elements */}
        <div className="animate-float" style={{
          position: 'absolute',
          top: '5rem',
          left: '2.5rem',
          width: '5rem',
          height: '5rem',
          background: 'rgba(59, 130, 246, 0.2)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
        <div className="animate-float delay-200" style={{
          position: 'absolute',
          top: '10rem',
          right: '5rem',
          width: '8rem',
          height: '8rem',
          background: 'rgba(34, 211, 238, 0.2)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
        <div className="animate-float delay-300" style={{
          position: 'absolute',
          bottom: '10rem',
          left: '25%',
          width: '6rem',
          height: '6rem',
          background: 'rgba(37, 99, 235, 0.2)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>

        <div style={{
          position: 'relative',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
          textAlign: 'center',
          zIndex: 10
        }}>
          <div className="animate-fade-in-up">
            <h1 className="neon-text" style={{
              fontSize: 'clamp(3rem, 10vw, 6rem)',
              fontWeight: '900',
              marginBottom: '1.5rem'
            }}>
              Financial Intelligence
            </h1>
            <h2 className="animate-fade-in-up delay-100" style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 'bold',
              marginBottom: '2rem',
              background: 'linear-gradient(to right, #60a5fa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Powered by AI Analytics
            </h2>
            <p className="animate-fade-in-up delay-200" style={{
              fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
              color: '#d1d5db',
              marginBottom: '3rem',
              maxWidth: '48rem',
              margin: '0 auto 3rem'
            }}>
              Transform your financial data into actionable insights with cutting-edge AI technology and real-time analytics
            </p>
            <div className="animate-fade-in-up delay-300" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button className="neon-glow" style={{
                padding: '1rem 2.5rem',
                background: 'linear-gradient(to right, #2563eb, #06b6d4)',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.5)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '';
                e.target.style.transform = 'scale(1)';
              }}

              onClick={goToLogin}
              >
                Get Started <ChevronRight />
              </button>
              <button style={{
                padding: '1rem 2.5rem',
                background: 'transparent',
                border: '2px solid #3b82f6',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
              onClick={handleDemo}
              >
                <Activity size={20} /> Watch Demo
              </button>
            </div>
          </div>

          {/* 3D Chart Preview */}
          <div className="perspective-container animate-scale-in delay-400" style={{ marginTop: '5rem' }}>
            <div className="glass-effect neon-border card-3d" style={{
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '56rem',
              margin: '0 auto'
            }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 640px) {
            .animate-fade-in-up:last-child > div {
              flex-direction: row;
            }
          }
        `}</style>
      </section>

      {/* Analytics Section */}
      <section id="analytics" style={{ padding: '8rem 0', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, #0f172a, rgba(23, 37, 84, 0.3), #0f172a)'
        }}></div>
        
        <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 className="neon-text" style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: '900', marginBottom: '1.5rem' }}>
              Analytics Dashboard
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#d1d5db', maxWidth: '48rem', margin: '0 auto' }}>
              Powerful tools to analyze, predict, and optimize your financial performance
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: <TrendingUp size={40} />,
                title: 'Market Trends',
                description: 'Real-time market analysis with AI-powered predictions',
                color: 'linear-gradient(to bottom right, #3b82f6, #22d3ee)'
              },
              {
                icon: <BarChart3 size={40} />,
                title: 'Portfolio Analytics',
                description: 'Comprehensive portfolio performance tracking and optimization',
                color: 'linear-gradient(to bottom right, #06b6d4, #3b82f6)'
              },
              {
                icon: <PieChart size={40} />,
                title: 'Risk Assessment',
                description: 'Advanced risk metrics and diversification strategies',
                color: 'linear-gradient(to bottom right, #2563eb, #9333ea)'
              },
              {
                icon: <Zap size={40} />,
                title: 'Instant Insights',
                description: 'Lightning-fast data processing and report generation',
                color: 'linear-gradient(to bottom right, #9333ea, #ec4899)'
              },
              {
                icon: <Shield size={40} />,
                title: 'Secure Platform',
                description: 'Bank-level encryption and data protection',
                color: 'linear-gradient(to bottom right, #ec4899, #ef4444)'
              },
              {
                icon: <Target size={40} />,
                title: 'Goal Tracking',
                description: 'Set and monitor financial goals with precision',
                color: 'linear-gradient(to bottom right, #ef4444, #f97316)'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-effect neon-border card-3d"
                style={{
                  borderRadius: '1rem',
                  padding: '2rem',
                  transition: 'all 0.5s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div className="neon-glow" style={{
                  width: '4rem',
                  height: '4rem',
                  background: feature.color,
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  transition: 'transform 0.3s'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#93c5fd' }}>{feature.title}</h3>
                <p style={{ color: '#9ca3af' }}>{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Interactive Chart */}
          <div className="glass-effect neon-border" style={{
            marginTop: '5rem',
            borderRadius: '1rem',
            padding: '2rem'
          }}>
            <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>Performance Overview</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
                <Line type="monotone" dataKey="growth" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ padding: '8rem 0', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, #0f172a, rgba(23, 37, 84, 0.2), #0f172a)'
        }}></div>
        
        <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center'
          }}>
            <div className="animate-slide-in-left">
              <h2 className="neon-text" style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: '900', marginBottom: '2rem' }}>
                About AstraGuard
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#d1d5db', marginBottom: '1.5rem', lineHeight: '1.75' }}>
                We're revolutionizing financial analytics with cutting-edge artificial intelligence and machine learning algorithms. Our platform empowers investors, analysts, and financial professionals to make data-driven decisions with confidence.
              </p>
              <p style={{ fontSize: '1.25rem', color: '#d1d5db', marginBottom: '2rem', lineHeight: '1.75' }}>
                Founded by experts in finance and technology, we combine decades of industry experience with the latest innovations in AI to deliver unparalleled insights and predictive analytics.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="neon-text" style={{ fontSize: '2.25rem', fontWeight: '900', marginBottom: '0.5rem' }}>500K+</div>
                  <div style={{ color: '#9ca3af' }}>Active Users</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="neon-text" style={{ fontSize: '2.25rem', fontWeight: '900', marginBottom: '0.5rem' }}>$50B+</div>
                  <div style={{ color: '#9ca3af' }}>Assets Analyzed</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="neon-text" style={{ fontSize: '2.25rem', fontWeight: '900', marginBottom: '0.5rem' }}>99.9%</div>
                  <div style={{ color: '#9ca3af' }}>Uptime</div>
                </div>
              </div>
            </div>

            <div className="animate-slide-in-right">
              <div className="glass-effect neon-border card-3d" style={{ borderRadius: '1rem', padding: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { icon: <Sparkles size={32} />, title: 'AI-Powered Predictions', desc: 'Advanced algorithms for accurate forecasting' },
                    { icon: <Shield size={32} />, title: 'Enterprise Security', desc: 'Military-grade encryption and compliance' },
                    { icon: <Zap size={32} />, title: 'Real-Time Processing', desc: 'Instant analysis of market movements' }
                  ].map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      transition: 'background 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    >
                      <div className="neon-glow" style={{
                        width: '3rem',
                        height: '3rem',
                        background: 'linear-gradient(to bottom right, #3b82f6, #22d3ee)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#93c5fd' }}>{item.title}</h4>
                        <p style={{ color: '#9ca3af' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" style={{ padding: '8rem 0', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, #0f172a, rgba(23, 37, 84, 0.3), #0f172a)'
        }}></div>
        
        <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 className="neon-text" style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: '900', marginBottom: '1.5rem' }}>
              Our Expert Team
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#d1d5db', maxWidth: '48rem', margin: '0 auto' }}>
              Meet the visionaries behind AstraGuard's FinAdvisory's revolutionary platform
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3rem'
          }}>
            {[
              { name: 'Tanishq ', role: 'Backend Developer & Tester', expertise: 'Spring Boot ' },
              { name: 'Pratik', role: 'AIML', expertise: 'Agentic AI & ML' },
              { name: 'Kartik ', role: 'Android | Integration', expertise: 'Android & Integration' },
              { name: 'Harsh ', role: 'Dashboard & App ', expertise: ' Frontend Developer' }
            ].map((member, index) => (
              <div
                key={index}
                className="glass-effect neon-border card-3d"
                style={{
                  borderRadius: '1rem',
                  padding: '2rem',
                  textAlign: 'center',
                  transition: 'all 0.5s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div className="neon-glow" style={{
                  width: '8rem',
                  height: '8rem',
                  background: 'linear-gradient(to bottom right, #3b82f6, #22d3ee)',
                  borderRadius: '50%',
                  margin: '0 auto 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: '900',
                  transition: 'transform 0.3s'
                }}>
                  {member.name.charAt(0)}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#93c5fd' }}>{member.name}</h3>
                <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>{member.role}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{member.expertise}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '8rem 0', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, #0f172a, rgba(23, 37, 84, 0.2), #0f172a)'
        }}></div>
        
        <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem'
          }}>
            <div>
              <h2 className="neon-text" style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: '900', marginBottom: '2rem' }}>
                Get In Touch
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#d1d5db', marginBottom: '3rem' }}>
                Ready to transform your financial analytics? Contact us today and discover the power of AI-driven insights.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { icon: <Mail size={24} />, label: 'Email', value: 'contact@astraguard-inAdvisory.com' },
                  { icon: <Phone size={24} />, label: 'Phone', value: '+1 (555) 123-4567' },
                  { icon: <MapPin size={24} />, label: 'Address', value: '123 Finance Street, New York, NY 10001' }
                ].map((contact, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="neon-glow" style={{
                      width: '3rem',
                      height: '3rem',
                      background: 'linear-gradient(to bottom right, #3b82f6, #22d3ee)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {contact.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{contact.label}</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#93c5fd' }}>{contact.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-effect neon-border" style={{ borderRadius: '1rem', padding: '2rem' }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#d1d5db' }}>Name</label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                    placeholder="Your name"
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#d1d5db' }}>Email</label>
                  <input
                    type="email"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                    placeholder="your@email.com"
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#d1d5db' }}>Message</label>
                  <textarea
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                      color: 'white',
                      resize: 'none',
                      fontSize: '1rem'
                    }}
                    placeholder="Tell us about your needs..."
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="neon-glow"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(to right, #2563eb, #06b6d4)',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    fontSize: '1.125rem',
                    transition: 'all 0.3s',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = '';
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', padding: '4rem 0', borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div className="neon-glow" style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(to bottom right, #3b82f6, #22d3ee)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BarChart3 style={{ color: 'white' }} size={24} />
                </div>
                <span className="neon-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>AstraGuard - FinAdvisory</span>
              </div>
              <p style={{ color: '#9ca3af' }}>
                Revolutionizing financial analytics with AI-powered insights.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: '#93c5fd' }}>Product</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Features</a></li>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Pricing</a></li>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>API</a></li>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: '#93c5fd' }}>Company</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>About Us</a></li>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Careers</a></li>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Blog</a></li>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Press</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: '#93c5fd' }}>Legal</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Privacy</a></li>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Terms</a></li>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Security</a></li>
                <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Compliance</a></li>
              </ul>
            </div>
          </div>

          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center', color: '#9ca3af' }}>
            <p>&copy; 2026 AstraGuard - FinAdvisory. All rights reserved. Powered by advanced AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}