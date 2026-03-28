"use client";

import type { Member } from "@/lib/types";

const sizes = { sm: 24, md: 32, lg: 48 };

interface MemberAvatarProps {
  member: Member;
  size?: "sm" | "md" | "lg";
}

export function MemberAvatar({ member, size = "md" }: MemberAvatarProps) {
  const px = sizes[size];
  const initial = member.name.charAt(0);
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-black flex-shrink-0"
      style={{
        width: px,
        height: px,
        fontSize: px * 0.45,
        backgroundColor: member.avatar_color,
      }}
    >
      {initial}
    </div>
  );
}
