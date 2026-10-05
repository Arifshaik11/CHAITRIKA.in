import React, { useState, useRef } from 'react';

const AnimatedButton = ({
  children,
  onClick,
  className = '',
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  // Ripple effect on click
  const handleClick = (e) => {
    if (disabled) return;

    // Create ripple
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = {
        id: Date.now(),
        x,
        y,
        size
      };

      setRipples([ripple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples([]);
      }, 600);
    }

    onClick?.(e);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800',
    secondary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50'
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-lg font-semibold
        transition-all duration-300 transform
        hover:scale-105 active:scale-95
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${fullWidth ? 'w-full' : ''}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        group
        ${className}
      `}
      {...props}
    >
      {/* Gradient Hover Background Animation */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 2s infinite'
        }}
      />

      {/* Ripple Effects Container */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/40 animate-ripple"
            style={{
              width: ripple.size,
              height: ripple.size,
              left: ripple.x,
              top: ripple.y,
              animation: 'ripple-effect 0.6s ease-out'
            }}
          />
        ))}
      </div>

      {/* Button Content */}
      <div className="relative flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-300">
        {Icon && iconPosition === 'left' && (
          <Icon
            className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-x-0.5"
            strokeWidth={2}
          />
        )}

        <span className="transition-all duration-300 group-hover:tracking-wide">
          {children}
        </span>

        {Icon && iconPosition === 'right' && (
          <Icon
            className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        )}
      </div>

      {/* Glow Effect on Hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
        style={{
          background: variant === 'primary'
            ? 'rgba(59, 130, 246, 0.3)'
            : variant === 'secondary'
            ? 'rgba(147, 51, 234, 0.3)'
            : 'rgba(59, 130, 246, 0.2)'
        }}
      />

      {/* Animated Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes ripple-effect {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        button:active {
          transform: scale(0.98);
        }

        .animate-ripple {
          animation: ripple-effect 0.6s ease-out;
        }
      `}</style>
    </button>
  );
};

export default AnimatedButton;