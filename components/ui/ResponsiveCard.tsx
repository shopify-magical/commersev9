// components/ui/ResponsiveCard.tsx
interface ResponsiveCardProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const ResponsiveCard = ({ children, size = 'md', className = '' }: ResponsiveCardProps) => {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  return (
    <div className={`${widths[size]} w-full mx-auto ${className}`}>
      <div className="bg-white rounded-2xl shadow-gold p-6 md:p-8">
        {children}
      </div>
    </div>
  );
};
