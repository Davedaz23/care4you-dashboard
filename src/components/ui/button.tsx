type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "destructive";
  };
  
  export function Button({ variant = "default", children, ...props }: ButtonProps) {
    const base = "px-4 py-2 rounded text-white font-semibold";
    const variants = {
      default: "bg-blue-600 hover:bg-blue-700",
      destructive: "bg-red-600 hover:bg-red-700",
    };
  
    return (
      <button {...props} className={`${base} ${variants[variant]}`}>
        {children}
      </button>
    );
  }
  