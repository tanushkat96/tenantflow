import { TrendingUp, TrendingDown } from "lucide-react";

function StatsCard({
  title,
  value,
  icon: IconComponent,
  trend,
  trendValue,
  color = "primary",
}) {
  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    success: "text-green-500",
  };

  const bgColorClasses = {
    primary: "bg-primary/10",
    secondary: "bg-secondary/10",
    accent: "bg-accent/10",
    success: "bg-green-50",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>

          {trend && (
            <div className="flex items-center mt-2 ">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-green-500" : "text-red-500"
                }`}
              >
                {trendValue}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last week</span>
            </div>
          )}
        </div>

        <div className={`${bgColorClasses[color]} p-4 rounded-lg`}>
          {IconComponent && (
            <IconComponent className={`w-8 h-8 ${colorClasses[color]}`} />
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
