import React from 'react';

interface SarojaLogoProps {
  size?: number;
  className?: string;
  opacity?: number;
  showLabels?: boolean;
}

export function SarojaLogo({ size = 200, className = '', opacity = 1, showLabels = true }: SarojaLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 500 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none transition-all duration-300 ${className}`}
      style={{ opacity }}
    >
      <defs>
        {/* Golden metallic gradient */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" /> {/* amber-500 */}
          <stop offset="30%" stopColor="#fde047" /> {/* yellow-300 */}
          <stop offset="70%" stopColor="#d97706" /> {/* amber-600 */}
          <stop offset="100%" stopColor="#b45309" /> {/* amber-700 */}
        </linearGradient>

        {/* Deep emerald organic gradient */}
        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" /> {/* emerald-900 */}
          <stop offset="50%" stopColor="#022c22" /> {/* emerald-950 */}
          <stop offset="100%" stopColor="#011c15" /> {/* extremely dark green */}
        </linearGradient>

        {/* Shadow for elegant high-contrast pop */}
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#logoShadow)">
        {/* 1. Shield Outer Gold Frame Outline */}
        <path 
          d="M 250,55 
             C 335,55 385,85 395,180 
             C 400,225 410,270 380,330 
             C 350,390 300,430 250,455 
             C 200,430 150,390 120,330 
             C 90,270 100,225 105,180 
             C 115,85 165,55 250,55 Z" 
          fill="url(#emeraldGradient)" 
          stroke="url(#goldGradient)" 
          strokeWidth="10"
          strokeLinejoin="round"
        />

        {/* Inner Secondary Gold Stroke Ring */}
        <path 
          d="M 250,70 
             C 325,70 370,95 380,180 
             C 385,220 395,260 368,315 
             C 340,370 295,410 250,435 
             C 205,410 160,370 132,315 
             C 105,260 115,220 120,180 
             C 130,95 175,70 250,70 Z" 
          stroke="url(#goldGradient)" 
          strokeWidth="3.5" 
          strokeDasharray="4 2"
          fill="none" 
        />

        {/* 2. Royal Crest Crown at the Top */}
        <g transform="translate(180, 0)" stroke="url(#goldGradient)" strokeWidth="1" fill="url(#goldGradient)">
          {/* Crown Base */}
          <path d="M 12,62 L 128,62 L 122,54 L 18,54 Z" />
          <rect x="22" y="65" width="96" height="5" rx="2" />
          
          {/* Crown Peaks */}
          <path d="M 14,51 
                   L 26,20 
                   L 50,42 
                   L 70,8 
                   L 90,42 
                   L 114,20 
                   L 126,51 Z" 
                strokeWidth="2" 
                strokeLinejoin="round" 
          />
          {/* Little jewels on crown peaks */}
          <circle cx="26" cy="18" r="4" />
          <circle cx="70" cy="6" r="5" />
          <circle cx="114" cy="18" r="4" />
          <circle cx="50" cy="40" r="3.5" />
          <circle cx="90" cy="40" r="3.5" />
        </g>

        {/* 3. Text Section "EST. IN BS 2078" */}
        <text 
          x="250" 
          y="105" 
          fill="url(#goldGradient)" 
          fontSize="11" 
          fontFamily="monospace" 
          fontWeight="bold" 
          textAnchor="middle" 
          letterSpacing="2.5"
        >
          EST. IN BS 2078
        </text>

        {/* 4. Banner & "SAROJA" Typography */}
        {/* Curving Gold Banner */}
        <path 
          d="M 134,142 C 190,122 310,122 366,142 L 360,182 C 300,165 200,165 140,182 Z" 
          fill="#022c22" 
          stroke="url(#goldGradient)" 
          strokeWidth="3.5" 
        />
        
        {/* Banner decorative ears */}
        <path d="M 134,142 L 120,162 L 140,182 Z" fill="url(#goldGradient)" />
        <path d="M 366,142 L 380,162 L 360,182 Z" fill="url(#goldGradient)" />

        <text 
          x="250" 
          y="168" 
          fill="url(#goldGradient)" 
          fontSize="35" 
          fontFamily="serif, Times New Roman" 
          fontWeight="950" 
          textAnchor="middle" 
          letterSpacing="4"
        >
          SAROJA
        </text>

        {/* 5. Four Quadrants Grid Divisor */}
        <line x1="250" y1="185" x2="250" y2="395" stroke="url(#goldGradient)" strokeWidth="3" />
        <line x1="130" y1="285" x2="370" y2="285" stroke="url(#goldGradient)" strokeWidth="3" />

        {/* --- QUADRANT 1: Poultry (Top Left) --- */}
        <g transform="translate(155, 195)" stroke="url(#goldGradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Chick Body Path */}
          <path d="M 45,30 C 58,15 70,30 75,40 C 80,48 76,58 68,64 C 55,72 32,70 20,58 C 12,50 15,35 25,35 C 32,35 30,22 40,20 C 45,18 48,22 45,30 Z" fill="none" />
          
          {/* Chick Beak */}
          <path d="M 20,44 L 12,47 L 20,51" fill="url(#goldGradient)" />
          
          {/* Chick Eye */}
          <circle cx="26" cy="38" r="2.5" fill="url(#goldGradient)" stroke="none" />
          
          {/* Chick Inside Wing */}
          <path d="M 42,46 C 48,42 58,46 56,54 C 54,60 46,58 42,46 Z" fill="none" />
          
          {/* Feet */}
          <path d="M 40,66 L 40,75 M 40,75 L 34,77 M 40,75 L 46,76" />
          <path d="M 52,65 L 52,74 M 52,74 L 47,76 M 52,74 L 58,75" />
          
          {showLabels && (
            <text x="45" y="86" fill="url(#goldGradient)" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" opacity="0.8">
              POULTRY
            </text>
          )}
        </g>

        {/* --- QUADRANT 2: Boer Goat (Top Right) --- */}
        <g transform="translate(265, 195)" stroke="url(#goldGradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Goat Horn */}
          <path d="M 28,15 Q 12,14 18,2" fill="none" />
          
          {/* Goat Head, Ears, & Body */}
          <path d="M 30,16 L 36,18 L 42,28 C 45,35 48,30 55,30 L 78,30 Q 82,30 84,38 L 84,58 M 30,16 L 24,18 L 18,28 Q 18,34 26,32 Q 22,46 32,54" fill="none" />
          <path d="M 32,54 L 52,54 L 75,54 C 80,54 84,58 84,58" fill="none" />
          
          {/* Front Legs */}
          <path d="M 28,48 L 28,72 L 32,72" />
          <path d="M 38,50 L 38,72 L 42,72" />
          
          {/* Back Legs */}
          <path d="M 72,50 L 72,72 L 76,72" />
          <path d="M 80,54 L 80,72 L 84,72" />

          {/* Little tail */}
          <path d="M 84,38 C 88,32 90,38 88,42" />

          {/* Beard */}
          <path d="M 22,30 C 18,40 22,44 24,47" />

          {showLabels && (
            <text x="52" y="86" fill="url(#goldGradient)" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" opacity="0.8">
              GOATS
            </text>
          )}
        </g>

        {/* --- QUADRANT 3: Tilapia Fish (Bottom Left) --- */}
        <g transform="translate(155, 298)" stroke="url(#goldGradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Fish Sleek Body */}
          <path d="M 12,40 C 25,22 65,22 84,40 C 65,58 25,58 12,40 Z" fill="none" />
          
          {/* Tail Fin */}
          <path d="M 12,40 L 2,28 L 6,40 L 2,52 Z" fill="#022c22" />
          
          {/* Gills Line */}
          <path d="M 66,32 C 60,35 60,45 66,48" />
          
          {/* Fish Eye */}
          <circle cx="74" cy="37" r="2.5" fill="url(#goldGradient)" stroke="none" />
          
          {/* Side Fin */}
          <path d="M 45,41 C 40,46 35,46 38,41 Z" fill="url(#goldGradient)" />
          
          {/* Dorsal Fin Sparkles */}
          <path d="M 32,28 C 42,20 52,20 62,28" />

          {showLabels && (
            <text x="45" y="82" fill="url(#goldGradient)" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" opacity="0.8">
              AQUA FISH
            </text>
          )}
        </g>

        {/* --- QUADRANT 4: Pigeon (Bottom Right) --- */}
        <g transform="translate(265, 298)" stroke="url(#goldGradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Pigeon Head & Proud Chest */}
          <path d="M 22,22 C 26,10 38,10 44,18 C 50,25 45,40 38,55 C 32,68 45,68 55,68 M 22,22 L 14,24 L 20,29" fill="none" />
          
          {/* Beak detail */}
          <path d="M 14,24 L 18,27" />

          {/* Pigeon folded wing */}
          <path d="M 42,28 C 52,32 64,44 68,58 L 50,58 C 42,52 38,40 42,28 Z" fill="none" fillRule="evenodd" />
          
          {/* Wing Lines/feathers detail */}
          <path d="M 48,38 L 60,48" />
          <path d="M 46,45 L 56,54" />

          {/* Eye */}
          <circle cx="34" cy="18" r="2" fill="url(#goldGradient)" stroke="none" />

          {/* Feet */}
          <path d="M 36,68 L 32,78 M 32,78 L 26,79 M 32,78 L 38,78" />
          <path d="M 44,68 L 42,78 M 42,78 L 37,79 M 42,78 L 48,78" />

          {showLabels && (
            <text x="50" y="82" fill="url(#goldGradient)" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" opacity="0.8">
              PIGEONS
            </text>
          )}
        </g>

        {/* 6. Curved Wheat Ears Decors (Framing Left/Right Sides) */}
        {/* Left Wheat stalk */}
        <g stroke="url(#goldGradient)" strokeWidth="2.5" fill="url(#goldGradient)" opacity="0.75">
          <path d="M 115,220 Q 95,280 115,340" fill="none" strokeWidth="3" />
          <path d="M 115,230 C 105,235 102,245 106,250 Z" />
          <path d="M 110,255 C 100,260 97,270 101,275 Z" />
          <path d="M 108,280 C 98,285 95,295 99,300 Z" />
          <path d="M 110,305 C 100,310 97,320 101,325 Z" />
          <path d="M 117,330 C 107,335 104,345 108,350 Z" />
        </g>

        {/* Right Wheat stalk */}
        <g stroke="url(#goldGradient)" strokeWidth="2.5" fill="url(#goldGradient)" opacity="0.75" transform="translate(500,0) scale(-1,1)">
          <path d="M 115,220 Q 95,280 115,340" fill="none" strokeWidth="3" />
          <path d="M 115,230 C 105,235 102,245 106,250 Z" />
          <path d="M 110,255 C 100,260 97,270 101,275 Z" />
          <path d="M 108,280 C 98,285 95,295 99,300 Z" />
          <path d="M 110,305 C 100,310 97,320 101,325 Z" />
          <path d="M 117,330 C 107,335 104,345 108,350 Z" />
        </g>

        {/* 7. Curved Bottom Slogans Banner and Scroll Arc */}
        <path 
          d="M 115,365 C 170,440 330,440 385,365" 
          stroke="url(#goldGradient)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          fill="none" 
        />
        
        {/* Curving text label on bottom */}
        {/* We can use standard SVG <path id="textPathBottom"> to beautifully align text! */}
        <path 
          id="textPathBottom" 
          d="M 110,345 C 160,420 340,420 390,345" 
          fill="none" 
          stroke="none" 
        />
        
        <text fontSize="14" fontFamily="sans-serif, Impact, Helvetica" fontWeight="bold" fill="url(#goldGradient)" letterSpacing="1.8">
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
            KRISHI TATHA PASHUPALAN FIRM
          </textPath>
        </text>
      </g>
    </svg>
  );
}
