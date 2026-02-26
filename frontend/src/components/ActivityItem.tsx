"use client";

import { formatDistanceToNow } from "date-fns";
import type { Activity } from "@/types";
import UserAvatar from "./UserAvatar";

interface ActivityItemProps {
  activity: Activity;
}

function formatAction(action: string, metadata: Record<string, unknown>): string {
  switch (action) {
    case "created card":
      return `created card "${metadata.cardTitle ?? ""}"`;
    case "updated card":
      return `updated card "${metadata.cardTitle ?? ""}"`;
    case "deleted card":
      return `deleted card "${metadata.cardTitle ?? ""}"`;
    case "moved card":
      return `moved card "${metadata.cardTitle ?? ""}" to "${metadata.targetColumnTitle ?? ""}"`;
    case "created column":
      return `created column "${metadata.columnTitle ?? ""}"`;
    case "deleted column":
      return `deleted column "${metadata.columnTitle ?? ""}"`;
    default:
      return action;
  }
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const userName = activity.user.name ?? activity.user.email;
  const description = formatAction(activity.action, activity.metadata);

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0">
        <UserAvatar user={activity.user} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: "#032147" }}>
          <span className="font-semibold">{userName}</span>{" "}
          <span>{description}</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
