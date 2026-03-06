export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  columns: string[];
}

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: "sprint",
    name: "Software Sprint",
    description: "Track tasks through a standard development workflow.",
    columns: ["Backlog", "In Progress", "In Review", "Testing", "Done"],
  },
  {
    id: "blank",
    name: "Blank Board",
    description: "Start from scratch with a minimal three-column layout.",
    columns: ["To Do", "In Progress", "Done"],
  },
  {
    id: "roadmap",
    name: "Product Roadmap",
    description: "Prioritize features by time horizon.",
    columns: ["Now", "Next", "Later", "Done"],
  },
  {
    id: "marketing",
    name: "Marketing Campaign",
    description: "Manage content and campaigns from idea to publish.",
    columns: ["Ideas", "Planning", "In Progress", "Review", "Published"],
  },
  {
    id: "personal",
    name: "Personal Tasks",
    description: "A simple board for day-to-day personal task tracking.",
    columns: ["To Do", "Today", "Done"],
  },
];

export const DEFAULT_TEMPLATE_ID = "sprint";

export function getTemplateColumns(templateId: string): string[] {
  const template = BOARD_TEMPLATES.find((t) => t.id === templateId);
  return template?.columns ?? BOARD_TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID)!.columns;
}
