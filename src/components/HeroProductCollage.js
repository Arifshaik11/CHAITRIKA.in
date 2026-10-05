import React from 'react';

const HeroProductCollage = () => {
  return (
    <div className="relative hidden lg:flex items-center justify-center h-full" style={{ perspective: '1200px' }}>
      {/* Container for 3D stacked frames */}
      <div className="relative w-full max-w-lg h-96" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* Frame 1 - Magnetic Frame (Back, largest) */}
        <div
          className="absolute rounded-2xl shadow-2xl"
          style={{
            width: '320px',
            height: '380px',
            left: '0',
            top: '0',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
            border: '12px solid #E8E8E8',
            boxShadow: '0 30px 80px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
            transform: 'rotateX(-8deg) rotateY(-12deg) rotateZ(-4deg) translateZ(0px)',
            transformStyle: 'preserve-3d',
            animation: 'float-frame-1 6s ease-in-out infinite',
          }}
        >
          {/* Image placeholder with gradient */}
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white text-center p-4">
            <div>
              <div className="text-4xl mb-2">📸</div>
              <div className="text-xs font-semibold">Magnetic Frame</div>
            </div>
          </div>
        </div>

        {/* Frame 2 - Acrylic Frame (Middle) */}
        <div
          className="absolute rounded-2xl shadow-xl"
          style={{
            width: '280px',
            height: '340px',
            left: '40px',
            top: '40px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
            border: '10px solid #D4D4D4',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
            transform: 'rotateX(6deg) rotateY(8deg) rotateZ(3deg) translateZ(40px)',
            transformStyle: 'preserve-3d',
            animation: 'float-frame-2 6s ease-in-out infinite 0.2s',
          }}
        >
          {/* Image placeholder */}
          <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-lg flex items-center justify-center text-white text-center p-4">
            <div>
              <div className="text-4xl mb-2">✨</div>
              <div className="text-xs font-semibold">Acrylic Display</div>
            </div>
          </div>
        </div>

        {/* Frame 3 - MDF Frame (Front, smallest) */}
        <div
          className="absolute rounded-2xl shadow-lg"
          style={{
            width: '240px',
            height: '300px',
            left: '80px',
            top: '80px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
            border: '8px solid #C0C0C0',
            boxShadow: '0 15px 40px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.5)',
            transform: 'rotateX(-4deg) rotateY(10deg) rotateZ(-2deg) translateZ(80px)',
            transformStyle: 'preserve-3d',
            animation: 'float-frame-3 6s ease-in-out infinite 0.4s',
          }}
        >
          {/* Image placeholder */}
          <div className="w-full h-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 rounded-lg flex items-center justify-center text-white text-center p-4">
            <div>
              <div className="text-4xl mb-2">🎨</div>
              <div className="text-xs font-semibold">MDF Frame</div>
            </div>
          </div>
        </div>

        {/* Decorative badge */}
        <div
          className="absolute rounded-full shadow-lg flex items-center justify-center"
          style={{
            width: '80px',
            height: '80px',
            bottom: '-20px',
            right: '-20px',
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
            color: '#FFFFFF',
            zIndex: 100,
            animation: 'bounce-badge 3s ease-in-out infinite',
          }}
        >
          <div className="text-center">
            <div className="text-2xl mb-0.5">⭐</div>
            <div className="text-xs font-bold">Premium</div>
          </div>
        </div>
      </div>

      {/* Floating dots for decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dot 1 */}
        <div
          className="absolute w-3 h-3 bg-blue-300 rounded-full opacity-30"
          style={{
            left: '10%',
            top: '20%',
            animation: 'float-dot 8s ease-in-out infinite',
          }}
        />
        {/* Dot 2 */}
        <div
          className="absolute w-2 h-2 bg-pink-300 rounded-full opacity-20"
          style={{
            right: '15%',
            bottom: '25%',
            animation: 'float-dot 6s ease-in-out infinite 0.5s',
          }}
        />
        {/* Dot 3 */}
        <div
          className="absolute w-4 h-4 bg-purple-300 rounded-full opacity-25"
          style={{
            left: '20%',
            bottom: '10%',
            animation: 'float-dot 7s ease-in-out infinite 1s',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes float-frame-1 {
          0%, 100% {
            transform: rotateX(-8deg) rotateY(-12deg) rotateZ(-4deg) translateZ(0px) translateY(0px);
          }
          50% {
            transform: rotateX(-8deg) rotateY(-12deg) rotateZ(-4deg) translateZ(0px) translateY(-15px);
          }
        }

        @keyframes float-frame-2 {
          0%, 100% {
            transform: rotateX(6deg) rotateY(8deg) rotateZ(3deg) translateZ(40px) translateY(0px);
          }
          50% {
            transform: rotateX(6deg) rotateY(8deg) rotateZ(3deg) translateZ(40px) translateY(-20px);
          }
        }

        @keyframes float-frame-3 {
          0%, 100% {
            transform: rotateX(-4deg) rotateY(10deg) rotateZ(-2deg) translateZ(80px) translateY(0px);
          }
          50% {
            transform: rotateX(-4deg) rotateY(10deg) rotateZ(-2deg) translateZ(80px) translateY(-25px);
          }
        }

        @keyframes bounce-badge {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
        }

        @keyframes float-dot {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(0px) translateX(0px);
          }
          75% {
            transform: translateY(15px) translateX(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default HeroProductCollage;
