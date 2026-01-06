
import React, { useMemo } from 'react';

const SakuraEffect: React.FC = () => {
  // 生成花瓣数据
  const petals = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // 初始水平位置
      size: Math.random() * 12 + 6, // 随机大小
      duration: Math.random() * 10 + 10, // 下落总时长
      delay: Math.random() * 20, // 随机起始延时
      swayDuration: Math.random() * 3 + 4, // 左右摇摆时长
      swayAmount: Math.random() * 50 + 50, // 摇摆幅度
      opacity: Math.random() * 0.5 + 0.3, // 随机透明度
      rotate: Math.random() * 360, // 初始旋转角度
    }));
  }, []);

  // 生成背景星星
  const stars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 珍珠星辰层 */}
      <div className="stars-container absolute inset-0">
        {stars.map(star => (
          <div
            key={`star-${star.id}`}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              '--duration': star.duration,
              animationDelay: star.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* 樱花层 */}
      <div className="sakura-container absolute inset-0">
        {petals.map((petal) => (
          <div
            key={`petal-${petal.id}`}
            className="sakura-petal"
            style={{
              left: `${petal.left}%`,
              width: `${petal.size}px`,
              height: `${petal.size}px`,
              opacity: petal.opacity,
              '--fall-duration': `${petal.duration}s`,
              '--fall-delay': `-${petal.delay}s`,
              '--sway-duration': `${petal.swayDuration}s`,
              '--sway-amount': `${petal.swayAmount}px`,
              '--init-rotate': `${petal.rotate}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <style>{`
        .sakura-petal {
          position: absolute;
          top: -10%;
          background-color: #ffc1cc;
          border-radius: 100% 0 100% 0;
          filter: drop-shadow(0 0 5px rgba(255, 193, 204, 0.6));
          will-change: transform;
          animation: 
            sakura-fall var(--fall-duration) linear var(--fall-delay) infinite,
            sakura-sway var(--sway-duration) ease-in-out var(--fall-delay) infinite;
        }

        @keyframes sakura-fall {
          0% {
            transform: translateY(0vh) rotate(var(--init-rotate));
          }
          100% {
            transform: translateY(110vh) rotate(calc(var(--init-rotate) + 720deg));
          }
        }

        @keyframes sakura-sway {
          0%, 100% {
            margin-left: 0;
          }
          50% {
            margin-left: var(--sway-amount);
          }
        }
      `}</style>
    </div>
  );
};

export default SakuraEffect;
