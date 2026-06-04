import React, { useState, useEffect } from 'react';
import { Zap, FileText, Eye, BarChart3, DollarSign, FileSpreadsheet, ScanLine } from 'lucide-react';

export default function NeonAgentFlow() {
  const [activeFlow, setActiveFlow] = useState(0);
  const [activeDots, setActiveDots] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animate dots along the paths
  useEffect(() => {
    const animateDots = () => {
      let paths = [];
      if (activeFlow === 0) {
        paths = ['flow1-dots-1', 'flow1-dots-2', 'flow1-dots-3'];
      } else if (activeFlow === 1) {
        paths = ['flow2-dots-1', 'flow2-dots-2', 'flow2-dots-3', 'flow2-dots-4'];
      } else {
        paths = ['flow3-dots-1', 'flow3-dots-2', 'flow3-dots-3'];
      }

      const dotsPerPath = 20;
      let currentDot = 0;
      
      const dotInterval = setInterval(() => {
        const pathIndex = Math.floor(currentDot / dotsPerPath);
        const dotIndex = currentDot % dotsPerPath;
        
        if (pathIndex < paths.length) {
          setActiveDots(prev => ({
            ...prev,
            [`${paths[pathIndex]}-${dotIndex}`]: true
          }));
          
          // Fade out after 800ms
          setTimeout(() => {
            setActiveDots(prev => {
              const newDots = { ...prev };
              delete newDots[`${paths[pathIndex]}-${dotIndex}`];
              return newDots;
            });
          }, 800);
        }
        
        currentDot++;
        if (currentDot >= paths.length * dotsPerPath) {
          currentDot = 0;
        }
      }, 60);

      return () => clearInterval(dotInterval);
    };

    const cleanup = animateDots();
    return cleanup;
  }, [activeFlow]);

  const flows = [
    { id: 0, name: 'Money Earning Flow', color: 'cyan' },
    { id: 1, name: 'Bills Processing Flow', color: 'pink' },
    { id: 2, name: 'CSV Upload Flow', color: 'lime' }
  ];

  // Generate dots along a path
  const generateDots = (x1, y1, x2, y2, count = 20) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      dots.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t
      });
    }
    return dots;
  };

  // Generate dots along a curved path
  const generateCurvedDots = (x1, y1, x2, y2, count = 20) => {
    const dots = [];
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      // Quadratic bezier curve
      const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
      const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
      dots.push({ x, y });
    }
    return dots;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Glowing orbs background */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
      
      <div className="relative w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-pink-400 to-lime-400 bg-clip-text text-transparent animate-pulse">
            AI Agent Flow
          </h1>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-6 md:mt-8">
            {flows.map((flow) => (
              <button
                key={flow.id}
                onClick={() => setActiveFlow(flow.id)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-all duration-300 ${
                  activeFlow === flow.id
                    ? `bg-${flow.color}-500/20 text-${flow.color}-400 shadow-[0_0_20px_rgba(0,255,255,0.5)] border-2 border-${flow.color}-400`
                    : 'bg-slate-800/50 text-slate-500 border-2 border-slate-700 hover:border-slate-600'
                }`}
                style={activeFlow === flow.id ? {
                  boxShadow: `0 0 20px ${flow.color === 'cyan' ? 'rgba(34,211,238,0.5)' : flow.color === 'pink' ? 'rgba(236,72,153,0.5)' : 'rgba(163,230,53,0.5)'}`,
                  borderColor: flow.color === 'cyan' ? 'rgb(34,211,238)' : flow.color === 'pink' ? 'rgb(236,72,153)' : 'rgb(163,230,53)',
                  color: flow.color === 'cyan' ? 'rgb(34,211,238)' : flow.color === 'pink' ? 'rgb(236,72,153)' : 'rgb(163,230,53)'
                } : {}}
              >
                {flow.name}
              </button>
            ))}
          </div>
        </div>

        {/* Flow Container */}
        <div className="relative h-[min(600px,70vw)] md:h-[600px]">
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <defs>
              {/* Neon glow filters */}
              <filter id="neon-cyan">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="neon-pink">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="neon-lime">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Flow 1: Money Earning */}
            {activeFlow === 0 && (
              <>
                {/* Dotted path 1: User Income -> Budget Plan Agent */}
                {generateDots(120, 300, 280, 300, 20).map((dot, i) => (
                  <circle
                    key={`flow1-dots-1-${i}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={activeDots[`flow1-dots-1-${i}`] ? "4" : "2"}
                    fill={activeDots[`flow1-dots-1-${i}`] ? "rgb(34,211,238)" : "rgba(34,211,238,0.3)"}
                    filter={activeDots[`flow1-dots-1-${i}`] ? "url(#neon-cyan)" : "none"}
                    className="transition-all duration-200"
                  />
                ))}
                
                {/* Dotted path 2: Budget Plan Agent -> OCR Agent */}
                {generateDots(350, 300, 480, 300, 20).map((dot, i) => (
                  <circle
                    key={`flow1-dots-2-${i}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={activeDots[`flow1-dots-2-${i}`] ? "4" : "2"}
                    fill={activeDots[`flow1-dots-2-${i}`] ? "rgb(34,211,238)" : "rgba(34,211,238,0.3)"}
                    filter={activeDots[`flow1-dots-2-${i}`] ? "url(#neon-cyan)" : "none"}
                    className="transition-all duration-200"
                  />
                ))}
                
                {/* Dotted path 3: OCR Agent -> Visualization */}
                {generateDots(580, 300, 720, 300, 20).map((dot, i) => (
                  <circle
                    key={`flow1-dots-3-${i}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={activeDots[`flow1-dots-3-${i}`] ? "4" : "2"}
                    fill={activeDots[`flow1-dots-3-${i}`] ? "rgb(34,211,238)" : "rgba(34,211,238,0.3)"}
                    filter={activeDots[`flow1-dots-3-${i}`] ? "url(#neon-cyan)" : "none"}
                    className="transition-all duration-200"
                  />
                ))}
                
                <defs>
                  <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="rgb(34,211,238)" stopOpacity="1" />
                    <stop offset="100%" stopColor="rgb(34,211,238)" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </>
            )}

            {/* Flow 2: Bills Processing */}
            {activeFlow === 1 && (
              <>
                {/* Dotted path 1: User Bills -> Text Format */}
                {generateDots(120, 200, 250, 200, 20).map((dot, i) => (
                  <circle
                    key={`flow2-dots-1-${i}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={activeDots[`flow2-dots-1-${i}`] ? "4" : "2"}
                    fill={activeDots[`flow2-dots-1-${i}`] ? "rgb(236,72,153)" : "rgba(236,72,153,0.3)"}
                    filter={activeDots[`flow2-dots-1-${i}`] ? "url(#neon-pink)" : "none"}
                    className="transition-all duration-200"
                  />
                ))}
                
                {/* Dotted path 2: Text Format -> OCR Agent - curved */}
                {generateCurvedDots(310, 200, 420, 300, 20).map((dot, i) => (
                  <circle
                    key={`flow2-dots-2-${i}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={activeDots[`flow2-dots-2-${i}`] ? "4" : "2"}
                    fill={activeDots[`flow2-dots-2-${i}`] ? "rgb(236,72,153)" : "rgba(236,72,153,0.3)"}
                    filter={activeDots[`flow2-dots-2-${i}`] ? "url(#neon-pink)" : "none"}
                    className="transition-all duration-200"
                  />
                ))}
                
                {/* Dotted path 3: OCR Agent -> Budget Plan Agent */}
                {generateDots(500, 300, 580, 300, 20).map((dot, i) => (
                  <circle
                    key={`flow2-dots-3-${i}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={activeDots[`flow2-dots-3-${i}`] ? "4" : "2"}
                    fill={activeDots[`flow2-dots-3-${i}`] ? "rgb(236,72,153)" : "rgba(236,72,153,0.3)"}
                    filter={activeDots[`flow2-dots-3-${i}`] ? "url(#neon-pink)" : "none"}
                    className="transition-all duration-200"
                  />
                ))}
                
                {/* Dotted path 4: Budget Plan Agent -> Visualization */}
                {generateDots(650, 300, 720, 300, 20).map((dot, i) => (
                  <circle
                    key={`flow2-dots-4-${i}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={activeDots[`flow2-dots-4-${i}`] ? "4" : "2"}
                    fill={activeDots[`flow2-dots-4-${i}`] ? "rgb(236,72,153)" : "rgba(236,72,153,0.3)"}
                    filter={activeDots[`flow2-dots-4-${i}`] ? "url(#neon-pink)" : "none"}
                    className="transition-all duration-200"
                  />
                ))}
                
                <defs>
                  <linearGradient id="gradient-pink" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(236,72,153)" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="rgb(236,72,153)" stopOpacity="1" />
                    <stop offset="100%" stopColor="rgb(236,72,153)" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </>
            )}

            {/* Flow 3: CSV Upload */}
            {activeFlow === 2 && (
              <>
                {/* Dotted path 1: User CSV -> CSV Processor */}
                {generateDots(120, 400, 250, 400, 20).map((dot, i) => (
                  <circle
                    key={`flow3-dots-1-${i}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={activeDots[`flow3-dots-1-${i}`] ? "4" : "2"}
                    fill={activeDots[`flow3-dots-1-${i}`] ? "rgb(163,230,53)" : "rgba(163,230,53,0.3)"}
                    filter={activeDots[`flow3-dots-1-${i}`] ? "url(#neon-lime)" : "none"}
                    className="transition-all duration-200"
                  />
                ))}
                
                {/* Dotted path 2: CSV Processor -> Budget Plan Agent - curved */}
                {generateCurvedDots(310, 400, 580, 300, 20).map((dot, i) => (
                  <circle
                    key={`flow3-dots-2-${i}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={activeDots[`flow3-dots-2-${i}`] ? "4" : "2"}
                    fill={activeDots[`flow3-dots-2-${i}`] ? "rgb(163,230,53)" : "rgba(163,230,53,0.3)"}
                    filter={activeDots[`flow3-dots-2-${i}`] ? "url(#neon-lime)" : "none"}
                    className="transition-all duration-200"
                  />
                ))}
                
                {/* Dotted path 3: Budget Plan Agent -> Visualization */}
                {generateDots(650, 300, 720, 300, 20).map((dot, i) => (
                  <circle
                    key={`flow3-dots-3-${i}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={activeDots[`flow3-dots-3-${i}`] ? "4" : "2"}
                    fill={activeDots[`flow3-dots-3-${i}`] ? "rgb(163,230,53)" : "rgba(163,230,53,0.3)"}
                    filter={activeDots[`flow3-dots-3-${i}`] ? "url(#neon-lime)" : "none"}
                    className="transition-all duration-200"
                  />
                ))}
                
                <defs>
                  <linearGradient id="gradient-lime" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(163,230,53)" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="rgb(163,230,53)" stopOpacity="1" />
                    <stop offset="100%" stopColor="rgb(163,230,53)" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </>
            )}
          </svg>

          {/* Flow 1 Nodes: Money Earning */}
          {activeFlow === 0 && (
            <>
              <NeonNode
                icon={DollarSign}
                label="User Income"
                color="cyan"
                position={{ top: '50%', left: '8%' }}
              />
              <NeonAgent
                icon={Zap}
                label="Budget Plan Agent"
                color="cyan"
                position={{ top: '50%', left: '30%' }}
                isActive={true}
              />
              <NeonAgent
                icon={ScanLine}
                label="OCR Agent"
                color="cyan"
                position={{ top: '50%', left: '52%' }}
                isActive={false}
              />
              <NeonNode
                icon={BarChart3}
                label="Visualization"
                color="cyan"
                position={{ top: '50%', left: '78%' }}
              />
            </>
          )}

          {/* Flow 2 Nodes: Bills Processing */}
          {activeFlow === 1 && (
            <>
              <NeonNode
                icon={FileText}
                label="User Bills"
                color="pink"
                position={{ top: '33%', left: '8%' }}
              />
              <NeonNode
                icon={FileText}
                label="Text Format"
                color="pink"
                position={{ top: '33%', left: '27%' }}
              />
              <NeonAgent
                icon={ScanLine}
                label="OCR Agent"
                color="pink"
                position={{ top: '50%', left: '45%' }}
                isActive={true}
              />
              <NeonAgent
                icon={Zap}
                label="Budget Plan Agent"
                color="pink"
                position={{ top: '50%', left: '62%' }}
                isActive={false}
              />
              <NeonNode
                icon={BarChart3}
                label="Visualization"
                color="pink"
                position={{ top: '50%', left: '78%' }}
              />
            </>
          )}

          {/* Flow 3 Nodes: CSV Upload */}
          {activeFlow === 2 && (
            <>
              <NeonNode
                icon={FileSpreadsheet}
                label="User CSV"
                color="lime"
                position={{ top: '67%', left: '8%' }}
              />
              <NeonNode
                icon={FileSpreadsheet}
                label="CSV Processor"
                color="lime"
                position={{ top: '67%', left: '27%' }}
              />
              <NeonAgent
                icon={Zap}
                label="Budget Plan Agent"
                color="lime"
                position={{ top: '50%', left: '62%' }}
                isActive={true}
              />
              <NeonNode
                icon={BarChart3}
                label="Visualization"
                color="lime"
                position={{ top: '50%', left: '78%' }}
              />
            </>
          )}
        </div>

        {/* Legend */}
        <div className="mt-12 flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <span className="text-slate-400 text-sm">User Input</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
            <span className="text-slate-400 text-sm">AI Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
            <span className="text-slate-400 text-sm">Output</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NeonNode({ icon: Icon, label, color, position }) {
  const colorMap = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-400', text: 'text-cyan-400', shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]' },
    pink: { bg: 'bg-pink-500/10', border: 'border-pink-400', text: 'text-pink-400', shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.5)]' },
    lime: { bg: 'bg-lime-500/10', border: 'border-lime-400', text: 'text-lime-400', shadow: 'shadow-[0_0_20px_rgba(163,230,53,0.5)]' }
  };

  const colors = colorMap[color];

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={position}
    >
      <div className={`${colors.bg} ${colors.border} ${colors.shadow} border-2 rounded-xl p-4 backdrop-blur-sm transition-all duration-300 hover:scale-110`}>
        <Icon className={`${colors.text} w-8 h-8 mx-auto mb-2`} />
        <div className={`${colors.text} text-sm font-semibold text-center whitespace-nowrap`}>
          {label}
        </div>
      </div>
    </div>
  );
}

function NeonAgent({ icon: Icon, label, color, position, isActive }) {
  const colorMap = {
    cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-400', text: 'text-cyan-400', shadow: 'shadow-[0_0_30px_rgba(34,211,238,0.8)]' },
    pink: { bg: 'bg-pink-500/20', border: 'border-pink-400', text: 'text-pink-400', shadow: 'shadow-[0_0_30px_rgba(236,72,153,0.8)]' },
    lime: { bg: 'bg-lime-500/20', border: 'border-lime-400', text: 'text-lime-400', shadow: 'shadow-[0_0_30px_rgba(163,230,53,0.8)]' }
  };

  const colors = colorMap[color];

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={position}
    >
      <div className={`${colors.bg} ${colors.border} ${colors.shadow} border-3 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 ${isActive ? 'animate-pulse' : ''}`}>
        <div className="relative">
          <Icon className={`${colors.text} w-10 h-10 mx-auto mb-2`} />
          {isActive && (
            <div className="absolute -top-1 -right-1">
              <div className={`w-3 h-3 ${colors.bg} rounded-full ${colors.border} border-2 animate-ping`} />
              <div className={`w-3 h-3 ${colors.bg} rounded-full ${colors.border} border-2 absolute top-0`} />
            </div>
          )}
        </div>
        <div className={`${colors.text} text-sm font-bold text-center whitespace-nowrap`}>
          {label}
        </div>
        <div className={`${colors.text} text-xs text-center mt-1 opacity-70`}>
          AI Agent
        </div>
      </div>
    </div>
  );
}