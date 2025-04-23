type CardProps = React.HTMLAttributes<HTMLDivElement>;
type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className="bg-white shadow-md rounded-xl border border-gray-200"
    >
      {children}
    </div>
  );
}

export function CardContent({ children, ...props }: CardContentProps) {
  return <div {...props} className="p-4 space-y-3">{children}</div>;
}
