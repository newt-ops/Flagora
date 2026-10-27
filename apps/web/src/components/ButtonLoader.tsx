export interface ButtonLoaderProps {
  className?: string;
}

export function ButtonLoader({ className = '' }: ButtonLoaderProps) {
  return (
    <span className={`loading-dots-container ${className}`} aria-hidden="true">
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
    </span>
  );
}
