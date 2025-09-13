import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: "primary" | "success" | "warning" | "destructive" | "accent"
  onClick?: () => void
  clickable?: boolean
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend = "neutral", 
  trendValue,
  color = "primary",
  onClick,
  clickable = false
}: StatCardProps) {
  const colorClasses = {
    primary: "from-primary/10 to-primary/5 text-primary border-primary/20",
    success: "from-success/10 to-success/5 text-success border-success/20",
    warning: "from-warning/10 to-warning/5 text-warning border-warning/20",
    destructive: "from-destructive/10 to-destructive/5 text-destructive border-destructive/20",
    accent: "from-accent/10 to-accent/5 text-accent border-accent/20"
  }

  const trendColors = {
    up: "text-success",
    down: "text-destructive", 
    neutral: "text-muted-foreground"
  }

  const CardComponent = clickable ? "button" : "div"

  return (
    <Card className={cn(
      "relative overflow-hidden border transition-all duration-300 hover:shadow-lg",
      colorClasses[color],
      clickable && "cursor-pointer hover:scale-105"
    )}>
      <CardContent className="p-6">
        <CardComponent 
          className={cn("w-full text-left", clickable && "focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg")}
          onClick={clickable ? onClick : undefined}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {title}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {value}
              </p>
              {subtitle && (
                <p className="text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
              {trend !== "neutral" && trendValue && (
                <div className={cn("flex items-center gap-1 text-sm font-medium", trendColors[trend])}>
                  <span>{trend === "up" ? "↗" : "↘"}</span>
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            <div className={cn(
              "p-3 rounded-lg",
              color === "primary" && "bg-primary/10",
              color === "success" && "bg-success/10",
              color === "warning" && "bg-warning/10", 
              color === "destructive" && "bg-destructive/10",
              color === "accent" && "bg-accent/10"
            )}>
              <Icon className={cn("h-6 w-6", colorClasses[color].split(" ")[2])} />
            </div>
          </div>
        </CardComponent>
      </CardContent>
    </Card>
  )
}