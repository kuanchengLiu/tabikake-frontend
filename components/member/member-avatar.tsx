"use client";

import Image from "next/image";
import type { User } from "@/lib/types";

// Generate a consistent color from user id/name
function avatarColor(seed: string): string {
  const COLORS = [
    "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
    "#EC4899", "#EF4444", "#F97316", "#06B6D4",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

const sizes = { sm: 24, md: 32, lg: 48 };

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
}

export function MemberAvatar({ user, size = "md" }: UserAvatarProps) {
  const px = sizes[size];
  const color = avatarColor(user.id || user.name);
  const initial = user.name.charAt(0);

  if (user.avatar_url) {
    return (
      <div
        className="rounded-full overflow-hidden flex-shrink-0"
        style={{ width: px, height: px }}
      >
        <Image
          src={user.avatar_url}
          alt={user.name}
          width={px}
          height={px}
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-black flex-shrink-0"
      style={{ width: px, height: px, fontSize: px * 0.45, backgroundColor: color }}
    >
      {initial}
    </div>
  );
}
