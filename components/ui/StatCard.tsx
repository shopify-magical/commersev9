// components/ui/StatCard.tsx
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend }) => {
  return (
    <div className="stat-card">
      <div className="flex justify-between items-start">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm mt-2 ${trend >= 0 ? 'text-success' : 'text-error'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        {icon && <div className="text-primary-400 text-2xl">{icon}</div>}
      </div>
    </div>
  );
};
