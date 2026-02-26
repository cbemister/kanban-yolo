export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface CardLabel {
  cardId: string;
  labelId: string;
  label: Label;
}

export interface CardAssignee {
  cardId: string;
  userId: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

export interface Card {
  id: string;
  title: string;
  details: string;
  dueDate?: string | null;
  labels?: CardLabel[];
  assignees?: CardAssignee[];
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface BoardMember {
  boardId: string;
  userId: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  joinedAt: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

export interface Invitation {
  id: string;
  boardId: string;
  email: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  token: string;
  expiresAt: string;
}

export interface ActiveFilters {
  labelIds: string[];
  assigneeId: string | null;
  dueSoon: boolean;
  overdue: boolean;
}

export interface Comment {
  id: string;
  content: string;
  cardId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

export interface Activity {
  id: string;
  boardId: string;
  cardId: string | null;
  userId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

export interface Attachment {
  id: string;
  cardId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

export interface SavedFilter {
  id: string;
  boardId: string;
  userId: string;
  name: string;
  filters: ActiveFilters;
  createdAt: string;
}
