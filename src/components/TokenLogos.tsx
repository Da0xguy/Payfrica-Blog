import React from 'react';
import LogoBaseImg from '../../Assets/Base@150x.png';
import LogoNairaImg from '../../Assets/Naira@150x.png';
import LogoPayfricaImg from '../../Assets/Payfrica ICON@150x.png';
import LogoSuiImg from '../../Assets/SUI@150x.png';
import LogoUSDCImg from '../../Assets/USDC@150x.png';
import LogoUSDYImg from '../../Assets/USDsui@150x.png';
import LogoAvalancheImg from '../../Assets/Avalenche@150x.png';

// 1. Logo 0: Base / Blue Square Logo
export const LogoSquareBlue: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <img 
    src={LogoBaseImg} 
    alt="Base Logo" 
    className={`${className} transition-transform hover:scale-110 object-contain`} 
  />
);

// 2. Logo 1: Nigerian Naira (₦) Logo
export const LogoNaira: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <img 
    src={LogoNairaImg} 
    alt="Naira Logo" 
    className={`${className} transition-transform hover:scale-110 object-contain`} 
  />
);

// 3. Logo 2: Official Payfrica Logo
export const LogoPayfrica: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <img 
    src={LogoPayfricaImg} 
    alt="Payfrica Logo" 
    className={`${className} transition-transform hover:scale-110 object-contain`} 
  />
);

// 4. Logo 3: Sui Logo
export const LogoSui: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <img 
    src={LogoSuiImg} 
    alt="Sui Logo" 
    className={`${className} transition-transform hover:scale-110 object-contain`} 
  />
);

// 5. Logo 4: USDC Logo
export const LogoUSDC: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <img 
    src={LogoUSDCImg} 
    alt="USDC Logo" 
    className={`${className} transition-transform hover:scale-110 object-contain`} 
  />
);

// 6. Logo 5: USDY / Yield Dollar Logo (USDsui)
export const LogoUSDY: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <img 
    src={LogoUSDYImg} 
    alt="USDsui Logo" 
    className={`${className} transition-transform hover:scale-110 object-contain`} 
  />
);

// 7. Logo 6: Avalanche Logo
export const LogoAvalanche: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <img 
    src={LogoAvalancheImg} 
    alt="Avalanche Logo" 
    className={`${className} transition-transform hover:scale-110 object-contain`} 
  />
);
