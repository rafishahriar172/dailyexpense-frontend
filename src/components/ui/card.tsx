import * as React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-gray-100",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold text-gray-800 tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "px-6 py-4",
        className
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardContent };