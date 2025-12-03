import React from 'react';

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  rotate?: boolean;
}

export const BrutalistButton: React.FC<BrutalistButtonProps> = ({ 
  children, 
  variant = 'primary', 
  rotate = false,
  className = '',
  ...props 
}) => {
  const baseStyle = "border-2 border-black font-bold uppercase transition-all duration-75 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-[#DFFF00] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white";
      break;
    case 'secondary':
      variantStyle = "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white";
      break;
    case 'danger':
      variantStyle = "bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700";
      break;
  }

  const rotation = rotate ? "-rotate-1 hover:rotate-0" : "";

  return (
    <button 
      className={`${baseStyle} ${variantStyle} ${rotation} px-4 py-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};