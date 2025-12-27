import { useTheme } from '../contexts/ThemeContext';

// Random chihuahuas scattered across the background
const chihuahuaPositions = [
  { top: '15%', left: '5%', size: 60, delay: 0, rotate: -10 },
  { top: '30%', right: '8%', size: 50, delay: 0.5, rotate: 15 },
  { top: '55%', left: '3%', size: 45, delay: 1, rotate: -5 },
  { top: '70%', right: '5%', size: 55, delay: 1.5, rotate: 10 },
  { top: '85%', left: '15%', size: 40, delay: 2, rotate: -15 },
  { top: '40%', right: '3%', size: 35, delay: 2.5, rotate: 20 },
  { top: '20%', right: '15%', size: 30, delay: 0.3, rotate: -8 },
  { bottom: '10%', right: '20%', size: 45, delay: 1.2, rotate: 12 },
];

function BinxoaiDecorations() {
  const { theme } = useTheme();
  
  if (theme !== 'binxoai') return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Scattered chihuahuas */}
      {chihuahuaPositions.map((pos, index) => (
        <img
          key={index}
          src="/src/assets/pngtree-chihuahua-in-studio-white-background-png-image_11207730.png"
          alt=""
          className="absolute opacity-30 animate-float"
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
      
      {/* Extra bows */}
      <img
        src="/src/assets/5bbc29b680c91-ba18fde322d103cab50c0424b742bdcb.png"
        alt=""
        className="absolute opacity-40 animate-swing"
        style={{ top: '45%', left: '8%', width: 40, height: 40 }}
      />
      <img
        src="/src/assets/hm8vslat6ll8tqd1mj790ouoh2-4b0c8179cd5a99c2d7044d6d4f036147.png"
        alt=""
        className="absolute opacity-40 animate-swing"
        style={{ top: '25%', left: '12%', width: 35, height: 35, animationDelay: '1s' }}
      />
      <img
        src="/src/assets/hm8vslat6ll8tqd1mj790ouoh2-4b0c8179cd5a99c2d7044d6d4f036147.png"
        alt=""
        className="absolute opacity-40 animate-swing"
        style={{ bottom: '30%', right: '10%', width: 30, height: 30, animationDelay: '0.5s' }}
      />
      
      {/* Stars and sparkles */}
      <div className="absolute top-20 left-1/4 text-2xl opacity-50 animate-sparkle">✨</div>
      <div className="absolute top-32 right-1/4 text-xl opacity-40 animate-sparkle" style={{ animationDelay: '0.5s' }}>⭐</div>
      <div className="absolute bottom-40 left-1/3 text-2xl opacity-50 animate-sparkle" style={{ animationDelay: '1s' }}>🌙</div>
      <div className="absolute top-1/2 right-1/3 text-xl opacity-40 animate-sparkle" style={{ animationDelay: '1.5s' }}>✨</div>
      <div className="absolute bottom-20 right-1/4 text-lg opacity-50 animate-sparkle" style={{ animationDelay: '0.8s' }}>⭐</div>
    </div>
  );
}

export default BinxoaiDecorations;
