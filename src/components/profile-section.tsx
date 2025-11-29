"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSectionProps {
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileSection({ userName, userEmail, userImage }: ProfileSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/20 p-8 transition-all duration-300 hover:shadow-lg">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="relative">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-background shadow-xl">
              {userImage && (
                <AvatarImage src={userImage} alt={userName || ""} />
              )}
              <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary border-2 border-primary/20">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-500 border-4 border-background shadow-lg ring-2 ring-green-500/20" />
          </div>
        </div>

        {/* Información */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 truncate">
              {userName || "Usuario"}
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <p className="text-sm sm:text-base truncate">{userEmail}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Activo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
