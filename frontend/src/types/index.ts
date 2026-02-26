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
