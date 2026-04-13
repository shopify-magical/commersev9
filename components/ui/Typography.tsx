// components/ui/Typography.tsx
import { ReactNode } from 'react';

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}

export const Heading = ({ children, level = 1, className = '' }: HeadingProps) => {
  const styles = {
    1: 'font-display text-5xl md:text-6xl font-bold tracking-tight text-primary-800',
    2: 'font-display text-4xl font-bold tracking-tight text-primary-700',
    3: 'font-display text-2xl font-semibold tracking-tight text-primary-700',
    4: 'font-display text-xl font-medium tracking-normal text-primary-600',
  };
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag className={`${styles[level]} ${className}`}>{children}</Tag>;
};

export const StatNumber = ({ value, className = '' }: { value: string | number; className?: string }) => (
  <span className={`font-mono text-3xl md:text-4xl font-bold tracking-tight text-primary-700 ${className}`}>
    {value}
  </span>
);

export const GoldText = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span className={`font-accent text-gold-500 font-medium ${className}`}>{children}</span>
);
