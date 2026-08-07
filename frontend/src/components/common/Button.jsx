import React from "react";

const Button = ({
  children,
  type = "button",
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = true,
  isLoading = false,
  disabled = false,
  icon: Icon = null,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm active:scale-[0.98]";

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  const variants = {
    primary: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white focus:ring-[#2563EB] shadow-blue-500/20",
    secondary: "bg-[#14B8A6] hover:bg-[#0D9488] text-white focus:ring-[#14B8A6] shadow-teal-500/20",
    accent: "bg-[#F59E0B] hover:bg-[#D97706] text-white focus:ring-[#F59E0B] shadow-amber-500/20",
    success: "bg-[#22C55E] hover:bg-[#16A34A] text-white focus:ring-[#22C55E] shadow-green-500/20",
    warning: "bg-[#F97316] hover:bg-[#EA580C] text-white focus:ring-[#F97316] shadow-orange-500/20",
    danger: "bg-[#EF4444] hover:bg-[#DC2626] text-white focus:ring-[#EF4444] shadow-red-500/20",
    outline: "bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] focus:ring-[#2563EB]",
    ghost: "bg-transparent hover:bg-[#E2E8F0]/50 text-[#64748B] hover:text-[#1E293B] focus:ring-[#64748B]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${sizes[size]}
        ${variants[variant] || variants.primary}
        ${fullWidth ? "w-full" : "w-auto"}
        ${className}
      `}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
