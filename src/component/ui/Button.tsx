interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "glass" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-all active:scale-[0.97] shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm",
    ghost: "text-gray-700 hover:bg-black/5",
    glass:
      // 🌫️ Liquid Glass Apple Style
      "bg-white/30 text-gray-900 border border-white/40 backdrop-blur-md hover:bg-white/40 shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
