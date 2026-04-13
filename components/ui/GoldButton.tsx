// components/ui/GoldButton.tsx
export const GoldButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ 
  children, 
  onClick 
}) => {
  return (
    <button onClick={onClick} className="btn-secondary">
      {children}
    </button>
  );
};
