"use client";

import { use, Suspense } from "react";
import Board from "@/components/Board";

export default function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = use(params);
  return (
    <Suspense>
      <Board boardId={boardId} />
    </Suspense>
  );
}
