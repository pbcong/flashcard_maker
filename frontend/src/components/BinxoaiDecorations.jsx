import { useTheme } from '../contexts/ThemeContext';

// Import images properly for Vite bundling
import chihuahua from '../assets/pngtree-chihuahua-in-studio-white-background-png-image_11207730.png';
import bow1 from '../assets/5bbc29b680c91-ba18fde322d103cab50c0424b742bdcb.png';
import bow2 from '../assets/hm8vslat6ll8tqd1mj790ouoh2-4b0c8179cd5a99c2d7044d6d4f036147.png';

// Grid-based positions to avoid overlap (screen divided into zones)
// Each zone is ~200x150px, decorations placed in different zones
const allDecorations = [
  // Row 1 (top)
  { type: 'emoji', emoji: '⭐', top: '5%', left: '5%', size: 26 },
  { type: 'image', image: chihuahua, top: '3%', left: '20%', size: 60, rotate: -10 },
  { type: 'emoji', emoji: '✨', top: '8%', left: '38%', size: 28 },
  { type: 'emoji', emoji: '☁️', top: '4%', left: '52%', size: 32 },
  { type: 'image', image: bow1, top: '6%', left: '68%', size: 45, rotate: 15 },
  { type: 'emoji', emoji: '🌙', top: '5%', left: '85%', size: 30 },
  
  // Row 2
  { type: 'emoji', emoji: '💕', top: '18%', left: '8%', size: 24 },
  { type: 'emoji', emoji: '🎀', top: '20%', left: '25%', size: 28 },
  { type: 'image', image: bow2, top: '16%', left: '42%', size: 40, rotate: -8 },
  { type: 'emoji', emoji: '⭐', top: '19%', left: '58%', size: 24 },
  { type: 'image', image: chihuahua, top: '15%', left: '75%', size: 55, rotate: 12 },
  { type: 'emoji', emoji: '✨', top: '18%', left: '92%', size: 26 },
  
  // Row 3
  { type: 'image', image: chihuahua, top: '30%', left: '3%', size: 50, rotate: -5 },
  { type: 'emoji', emoji: '🌸', top: '32%', left: '18%', size: 26 },
  { type: 'emoji', emoji: '💖', top: '28%', left: '35%', size: 28 },
  { type: 'image', image: bow1, top: '31%', left: '50%', size: 38, rotate: 20 },
  { type: 'emoji', emoji: '🐾', top: '29%', left: '65%', size: 24 },
  { type: 'emoji', emoji: '⭐', top: '33%', left: '82%', size: 22 },
  
  // Row 4
  { type: 'emoji', emoji: '💫', top: '42%', left: '10%', size: 26 },
  { type: 'image', image: bow2, top: '44%', left: '28%', size: 42, rotate: -12 },
  { type: 'emoji', emoji: '✨', top: '40%', left: '45%', size: 30 },
  { type: 'image', image: chihuahua, top: '43%', left: '60%', size: 58, rotate: 8 },
  { type: 'emoji', emoji: '🌙', top: '41%', left: '78%', size: 28 },
  { type: 'emoji', emoji: '💕', top: '45%', left: '93%', size: 24 },
  
  // Row 5
  { type: 'emoji', emoji: '🎀', top: '55%', left: '5%', size: 26 },
  { type: 'image', image: chihuahua, top: '53%', left: '22%', size: 52, rotate: -15 },
  { type: 'emoji', emoji: '⭐', top: '56%', left: '40%', size: 24 },
  { type: 'emoji', emoji: '☁️', top: '52%', left: '55%', size: 30 },
  { type: 'image', image: bow1, top: '57%', left: '70%', size: 44, rotate: 10 },
  { type: 'emoji', emoji: '✨', top: '54%', left: '88%', size: 28 },
  
  // Row 6
  { type: 'emoji', emoji: '🐾', top: '66%', left: '12%', size: 22 },
  { type: 'emoji', emoji: '💖', top: '68%', left: '30%', size: 26 },
  { type: 'image', image: bow2, top: '64%', left: '48%', size: 40, rotate: -18 },
  { type: 'emoji', emoji: '🌸', top: '67%', left: '62%', size: 24 },
  { type: 'image', image: chihuahua, top: '65%', left: '80%', size: 56, rotate: 5 },
  
  // Row 7 (bottom area)
  { type: 'image', image: chihuahua, top: '78%', left: '8%', size: 65, rotate: -8 },
  { type: 'emoji', emoji: '⭐', top: '80%', left: '25%', size: 28 },
  { type: 'emoji', emoji: '💫', top: '76%', left: '42%', size: 26 },
  { type: 'image', image: bow1, top: '79%', left: '58%', size: 46, rotate: 15 },
  { type: 'emoji', emoji: '🌙', top: '77%', left: '75%', size: 32 },
  { type: 'emoji', emoji: '✨', top: '82%', left: '90%', size: 30 },
  
  // Row 8 (very bottom)
  { type: 'emoji', emoji: '💕', top: '90%', left: '15%', size: 24 },
  { type: 'emoji', emoji: '🎀', top: '88%', left: '35%', size: 28 },
  { type: 'image', image: chihuahua, top: '87%', left: '52%', size: 50, rotate: 12 },
  { type: 'emoji', emoji: '⭐', top: '91%', left: '70%', size: 26 },
  { type: 'image', image: bow2, top: '89%', left: '85%', size: 42, rotate: -10 },
];

function BinxoaiDecorations() {
  const { theme } = useTheme();
  
  if (theme !== 'binxoai') return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
      {allDecorations.map((dec, index) => {
        const delay = (index * 0.15) % 3; // Staggered animation delays
        
        if (dec.type === 'image') {
          return (
            <img
              key={index}
              src={dec.image}
              alt=""
              className="absolute animate-float"
              style={{
                top: dec.top,
                left: dec.left,
                width: dec.size,
                height: dec.size,
                objectFit: 'contain',
                transform: `rotate(${dec.rotate || 0}deg)`,
                animationDelay: `${delay}s`,
                opacity: 0.65,
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))',
              }}
            />
          );
        } else {
          return (
            <div
              key={index}
              className="absolute animate-sparkle"
              style={{
                top: dec.top,
                left: dec.left,
                fontSize: dec.size,
                opacity: 0.85,
                animationDelay: `${delay}s`,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {dec.emoji}
            </div>
          );
        }
      })}
      
      {/* Floating ribbon trail at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{
          background: 'linear-gradient(90deg, transparent, #ffb6c1, #ffc0cb, #ffb6c1, transparent)',
          opacity: 0.35,
          animation: 'shimmer 3s ease-in-out infinite',
        }}
      />
    </div>
  );
}

export default BinxoaiDecorations;
