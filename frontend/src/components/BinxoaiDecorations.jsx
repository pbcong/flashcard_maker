import { useTheme } from '../contexts/ThemeContext';

// Import images properly for Vite bundling
import chihuahua from '../assets/pngtree-chihuahua-in-studio-white-background-png-image_11207730.png';
import bow1 from '../assets/5bbc29b680c91-ba18fde322d103cab50c0424b742bdcb.png';
import bow2 from '../assets/hm8vslat6ll8tqd1mj790ouoh2-4b0c8179cd5a99c2d7044d6d4f036147.png';

// Chihuahua positions
const chihuahuaPositions = [
  { top: '12%', left: '3%', size: 70, delay: 0, rotate: -10 },
  { top: '25%', right: '5%', size: 60, delay: 0.5, rotate: 15 },
  { top: '50%', left: '2%', size: 55, delay: 1, rotate: -5 },
  { top: '75%', right: '3%', size: 65, delay: 1.5, rotate: 10 },
  { bottom: '5%', left: '10%', size: 50, delay: 2, rotate: -15 },
  { top: '35%', right: '8%', size: 45, delay: 2.5, rotate: 20 },
];

// Bow positions
const bowPositions = [
  { top: '8%', right: '12%', size: 50, delay: 0, rotate: 15, image: bow1 },
  { top: '40%', left: '5%', size: 40, delay: 0.5, rotate: -10, image: bow2 },
  { top: '65%', right: '10%', size: 35, delay: 1, rotate: 20, image: bow1 },
  { bottom: '15%', left: '15%', size: 45, delay: 1.5, rotate: -5, image: bow2 },
  { top: '20%', left: '12%', size: 30, delay: 0.3, rotate: 25, image: bow1 },
  { bottom: '30%', right: '15%', size: 38, delay: 0.8, rotate: -15, image: bow2 },
];

// Emoji decorations
const emojiDecorations = [
  // Stars
  { emoji: '⭐', top: '5%', left: '20%', size: 24, delay: 0 },
  { emoji: '⭐', top: '15%', right: '25%', size: 20, delay: 0.5 },
  { emoji: '⭐', top: '45%', left: '8%', size: 22, delay: 1 },
  { emoji: '⭐', bottom: '20%', right: '8%', size: 26, delay: 1.5 },
  { emoji: '⭐', top: '70%', left: '20%', size: 18, delay: 2 },
  // Sparkles
  { emoji: '✨', top: '10%', left: '35%', size: 28, delay: 0.2 },
  { emoji: '✨', top: '30%', right: '20%', size: 24, delay: 0.7 },
  { emoji: '✨', top: '55%', right: '25%', size: 26, delay: 1.2 },
  { emoji: '✨', bottom: '25%', left: '25%', size: 22, delay: 1.7 },
  { emoji: '✨', top: '80%', right: '30%', size: 20, delay: 0.4 },
  // Moons
  { emoji: '🌙', top: '8%', right: '35%', size: 30, delay: 0.3 },
  { emoji: '🌙', top: '60%', left: '12%', size: 26, delay: 0.9 },
  { emoji: '🌙', bottom: '10%', right: '40%', size: 28, delay: 1.4 },
  // Hearts
  { emoji: '💕', top: '22%', left: '30%', size: 22, delay: 0.4 },
  { emoji: '💕', top: '48%', right: '15%', size: 20, delay: 1.1 },
  { emoji: '💕', bottom: '35%', left: '5%', size: 24, delay: 1.6 },
  { emoji: '💖', top: '38%', left: '18%', size: 26, delay: 0.6 },
  { emoji: '💖', bottom: '45%', right: '22%', size: 22, delay: 1.3 },
  // Clouds
  { emoji: '☁️', top: '3%', left: '50%', size: 32, delay: 0 },
  { emoji: '☁️', top: '12%', right: '45%', size: 28, delay: 0.5 },
  // Flowers
  { emoji: '🌸', top: '28%', right: '35%', size: 24, delay: 0.8 },
  { emoji: '🌸', bottom: '18%', left: '35%', size: 22, delay: 1.3 },
  { emoji: '🎀', top: '18%', left: '45%', size: 26, delay: 0.2 },
  { emoji: '🎀', bottom: '40%', right: '5%', size: 24, delay: 0.9 },
];

function BinxoaiDecorations() {
  const { theme } = useTheme();
  
  if (theme !== 'binxoai') return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Scattered chihuahuas */}
      {chihuahuaPositions.map((pos, index) => (
        <img
          key={`chi-${index}`}
          src={chihuahua}
          alt=""
          className="absolute opacity-40 animate-float"
          style={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            bottom: pos.bottom,
            width: pos.size,
            height: pos.size,
            objectFit: 'contain',
            transform: `rotate(${pos.rotate}deg)`,
            animationDelay: `${pos.delay}s`,
          }}
        />
      ))}
      
      {/* Scattered bows */}
      {bowPositions.map((pos, index) => (
        <img
          key={`bow-${index}`}
          src={pos.image}
          alt=""
          className="absolute opacity-50 animate-swing"
          style={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            bottom: pos.bottom,
            width: pos.size,
            height: pos.size,
            objectFit: 'contain',
            transform: `rotate(${pos.rotate}deg)`,
            animationDelay: `${pos.delay}s`,
          }}
        />
      ))}
      
      {/* Emoji decorations - stars, moons, sparkles, hearts */}
      {emojiDecorations.map((dec, index) => (
        <div
          key={`emoji-${index}`}
          className="absolute animate-sparkle"
          style={{
            top: dec.top,
            left: dec.left,
            right: dec.right,
            bottom: dec.bottom,
            fontSize: dec.size,
            opacity: 0.6,
            animationDelay: `${dec.delay}s`,
          }}
        >
          {dec.emoji}
        </div>
      ))}
      
      {/* Floating ribbon trail at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, #ffb6c1, #ffc0cb, #ffb6c1, transparent)',
          animation: 'shimmer 3s ease-in-out infinite',
        }}
      />
    </div>
  );
}

export default BinxoaiDecorations;
