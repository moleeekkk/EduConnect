const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className="mb-5">
      {label && (
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full
          px-4
          py-3
          border
          border-gray-300
          rounded-xl
          outline-none
          focus:ring-2
          focus:ring-indigo-500
          focus:border-indigo-500
          transition-all
          duration-300
          ${className}
        `}
      />
    </div>
  );
};

export default Input;
