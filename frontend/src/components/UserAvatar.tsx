"use client";

interface UserAvatarProps {
  user: { id: string; name: string | null; email: string; image: string | null };
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: 24, md: 32, lg: 40 };

const COLORS = [
  "#209dd7", "#753991", "#ecad0a", "#10b981", "#ef4444",
  "#f97316", "#8b5cf6", "#06b6d4", "#84cc16", "#f43f5e",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(h);
}

export default function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const px = sizes[size];
  const fontSize = size === "sm" ? 10 : size === "md" ? 13 : 16;
  const initial = (user.name ?? user.email).charAt(0).toUpperCase();
  const bg = COLORS[hashString(user.id) % COLORS.length];

  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name ?? user.email}
        title={user.name ?? user.email}
        width={px}
        height={px}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <span
      title={user.name ?? user.email}
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white select-none"
      style={{ width: px, height: px, background: bg, fontSize }}
    >
      {initial}
    </span>
  );
}
