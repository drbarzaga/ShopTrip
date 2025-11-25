"use client";

import Link from "next/link";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm text-muted-foreground mb-4", className)}
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        <LayoutDashboard className="h-4 w-4" />
        <span>Panel de Control</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}




