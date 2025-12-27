import { useTheme } from '../contexts/ThemeContext';

// Import images properly for Vite bundling
import chihuahua from '../assets/pngtree-chihuahua-in-studio-white-background-png-image_11207730.png';
import bow1 from '../assets/5bbc29b680c91-ba18fde322d103cab50c0424b742bdcb.png';
import bow2 from '../assets/hm8vslat6ll8tqd1mj790ouoh2-4b0c8179cd5a99c2d7044d6d4f036147.png';

// Chihuahua positions - positioned at edges to not be covered by content
const chihuahuaPositions = [
  { top: '80px', left: '10px', size: 80, delay: 0, rotate: -10 },
  { top: '150px', right: '15px', size: 70, delay: 0.5, rotate: 15 },
  { top: '350px', left: '5px', size: 65, delay: 1, rotate: -5 },
  { top: '500px', right: '10px', size: 75, delay: 1.5, rotate: 10 },
  { bottom: '80px', left: '20px', size: 90, delay: 2, rotate: -15 },
  { bottom: '150px', right: '25px', size: 70, delay: 2.5, rotate: 20 },
  { top: '250px', right: '5px', size: 55, delay: 0.3, rotate: -8 },
  { bottom: '250px', left: '15px', size: 60, delay: 1.2, rotate: 12 },
];

// Bow positions
const bowPositions = [
  { top: '100px', right: '80px', size: 55, delay: 0, rotate: 15, image: bow1 },
  { top: '300px', left: '60px', size: 45, delay: 0.5, rotate: -10, image: bow2 },
  { top: '450px', right: '50px', size: 40, delay: 1, rotate: 20, image: bow1 },
  { bottom: '180px', left: '70px', size: 50, delay: 1.5, rotate: -5, image: bow2 },
  { top: '200px', left: '40px', size: 35, delay: 0.3, rotate: 25, image: bow1 },
  { bottom: '300px', right: '60px', size: 42, delay: 0.8, rotate: -15, image: bow2 },
];

// Emoji decorations - positioned at edges, higher opacity
const emojiDecorations = [
  // Stars - bright yellow, visible against pink
  { emoji: '⭐', top: '90px', left: '100px', size: 28, delay: 0 },
  { emoji: '⭐', top: '180px', right: '120px', size: 24, delay: 0.5 },
  { emoji: '⭐', top: '380px', left: '80px', size: 26, delay: 1 },
  { emoji: '⭐', bottom: '120px', right: '100px', size: 30, delay: 1.5 },
  { emoji: '⭐', top: '550px', left: '50px', size: 22, delay: 2 },
  { emoji: '⭐', bottom: '220px', left: '120px', size: 26, delay: 0.7 },
  // Sparkles
  { emoji: '✨', top: '120px', left: '150px', size: 32, delay: 0.2 },
  { emoji: '✨', top: '280px', right: '100px', size: 28, delay: 0.7 },
  { emoji: '✨', top: '420px', right: '130px', size: 30, delay: 1.2 },
  { emoji: '✨', bottom: '160px', left: '90px', size: 26, delay: 1.7 },
  { emoji: '✨', bottom: '350px', right: '80px', size: 24, delay: 0.4 },
  // Moons
  { emoji: '🌙', top: '140px', right: '150px', size: 34, delay: 0.3 },
  { emoji: '🌙', top: '480px', left: '130px', size: 30, delay: 0.9 },
  { emoji: '🌙', bottom: '280px', right: '140px', size: 32, delay: 1.4 },
  // Hearts
  { emoji: '💕', top: '220px', left: '170px', size: 26, delay: 0.4 },
  { emoji: '💕', top: '360px', right: '160px', size: 24, delay: 1.1 },
  { emoji: '💕', bottom: '400px', left: '140px', size: 28, delay: 1.6 },
  { emoji: '💖', top: '320px', left: '110px', size: 30, delay: 0.6 },
  { emoji: '💖', bottom: '320px', right: '170px', size: 26, delay: 1.3 },
  // Clouds
  { emoji: '☁️', top: '85px', left: '250px', size: 36, delay: 0 },
  { emoji: '☁️', top: '160px', right: '200px', size: 32, delay: 0.5 },
  // Flowers
  { emoji: '🌸', top: '240px', right: '180px', size: 28, delay: 0.8 },
  { emoji: '🌸', bottom: '200px', left: '160px', size: 26, delay: 1.3 },
  { emoji: '🎀', top: '190px', left: '200px', size: 30, delay: 0.2 },
  { emoji: '🎀', bottom: '380px', right: '120px', size: 28, delay: 0.9 },
  // Extra cute ones
  { emoji: '🐾', top: '400px', left: '40px', size: 24, delay: 1.0 },
  { emoji: '🐾', bottom: '100px', right: '40px', size: 22, delay: 1.8 },
  { emoji: '💫', top: '520px', right: '90px', size: 28, delay: 0.5 },
  { emoji: '💫', top: '130px', left: '80px', size: 26, delay: 1.2 },
];

function BinxoaiDecorations() {
  const { theme } = useTheme();
  
  if (theme !== 'binxoai') return null;
  
  return (
    <>
      {/* Background layer - behind content */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Floating ribbon trail at bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-20 opacity-40"
          style={{
            background: 'linear-gradient(90deg, transparent, #ffb6c1, #ffc0cb, #ffb6c1, transparent)',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
      </div>
      
      {/* Foreground layer - above content, at edges */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Scattered chihuahuas */}
        {chihuahuaPositions.map((pos, index) => (
          <img
            key={`chi-${index}`}
            src={chihuahua}
            alt=""
            className="absolute animate-float"
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
              opacity: 0.7,
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))',
            }}
          />
        ))}
        
        {/* Scattered bows */}
        {bowPositions.map((pos, index) => (
          <img
            key={`bow-${index}`}
            src={pos.image}
            alt=""
            className="absolute animate-swing"
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
              opacity: 0.8,
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
              opacity: 0.9,
              animationDelay: `${dec.delay}s`,
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {dec.emoji}
          </div>
        ))}
      </div>
    </>
  );
}

export default BinxoaiDecorations;
