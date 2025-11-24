"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

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
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información del Perfil
        </CardTitle>
        <CardDescription>
          Tu información de cuenta y perfil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {userImage && (
              <AvatarImage src={userImage} alt={userName || ""} />
            )}
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-base">
              {userName || "Usuario"}
            </p>
            <p className="text-sm text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



