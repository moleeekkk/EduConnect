import React from "react";

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helperText,
  icon: Icon = null,
  rightElement = null,
  required = false,
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <div className="mb-4 w-full">
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-[#1E293B]">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
            <Icon className="h-5 w-5" />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full
            py-3
            ${Icon ? "pl-11" : "pl-4"}
            ${rightElement ? "pr-11" : "pr-4"}
            bg-white
            text-[#1E293B]
            placeholder-[#64748B]
            border
            ${error ? "border-[#EF4444] focus:ring-[#EF4444]" : "border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"}
            rounded-xl
            outline-none
            focus:ring-2
            focus:ring-opacity-20
            transition-all
            duration-200
            disabled:bg-[#F8FAFC]
            disabled:text-[#64748B]
            text-sm
            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-[#EF4444] font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-[#64748B]">{helperText}</p>}
    </div>
  );
};

export default Input;
