"use client";

import { memo } from "react";
import Image from "next/image";

interface UserAvatarProps {
  user: { id: string; name: string | null; email: string; image: string | null };
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: 24, md: 32, lg: 40 };

function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const px = sizes[size];
  const fontSize = size === "sm" ? 10 : size === "md" ? 13 : 16;
  const initial = (user.name ?? user.email).charAt(0).toUpperCase();

  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name ?? user.email}
        title={user.name ?? user.email}
        width={px}
        height={px}
        className="object-cover flex-shrink-0"
        style={{
          width: px,
          height: px,
          border: "1px solid var(--border-color)",
        }}
      />
    );
  }

  return (
    <span
      title={user.name ?? user.email}
      className="flex items-center justify-center flex-shrink-0 font-bold select-none"
      style={{
        width: px,
        height: px,
        fontSize,
        background: "var(--bg-card)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border-color)",
      }}
    >
      {initial}
    </span>
  );
}

export default memo(UserAvatar);
