import type { Column } from '@/types';

export const initialColumns: Column[] = [
  {
    id: 'col-1',
    title: 'Backlog',
    cards: [
      {
        id: 'card-1',
        title: 'Design system audit',
        details:
          'Review all existing UI components and identify inconsistencies in spacing, color, and typography. Produce a report with recommendations for standardization across the product.',
      },
      {
        id: 'card-2',
        title: 'Mobile responsive layout',
        details:
          'Refactor the main dashboard layout to be fully responsive on screens from 320px to 1440px wide. Ensure all interactive elements are touch-friendly with appropriate tap targets.',
      },
      {
        id: 'card-3',
        title: 'Accessibility review',
        details:
          'Audit the application against WCAG 2.1 AA standards. Address issues with keyboard navigation, screen reader support, and color contrast across all primary user flows.',
      },
    ],
  },
  {
    id: 'col-2',
    title: 'In Progress',
    cards: [
      {
        id: 'card-4',
        title: 'User authentication flow',
        details:
          'Implement sign-up, login, and password reset flows using JWT-based authentication. Includes email verification and secure token storage on the client side.',
      },
      {
        id: 'card-5',
        title: 'Dashboard analytics widget',
        details:
          'Build a summary widget displaying key project metrics including task completion rate, active members, and recent activity. Data should update in real time via polling.',
      },
    ],
  },
  {
    id: 'col-3',
    title: 'In Review',
    cards: [
      {
        id: 'card-6',
        title: 'API rate limiting',
        details:
          'Add rate limiting middleware to all public API endpoints to prevent abuse. Implement a sliding window algorithm with configurable limits per user and IP address.',
      },
      {
        id: 'card-7',
        title: 'Search functionality',
        details:
          'Implement full-text search across project cards and comments using a debounced input. Results should highlight matching terms and be filterable by column status.',
      },
    ],
  },
  {
    id: 'col-4',
    title: 'Testing',
    cards: [
      {
        id: 'card-8',
        title: 'Payment integration',
        details:
          'Integrate Stripe for subscription billing with support for monthly and annual plans. Requires end-to-end testing of checkout, webhook handling, and invoice generation.',
      },
    ],
  },
  {
    id: 'col-5',
    title: 'Done',
    cards: [
      {
        id: 'card-9',
        title: 'Project setup',
        details:
          'Initialized the Next.js repository with TypeScript, ESLint, and Tailwind CSS. Configured path aliases and established the base folder structure for the application.',
      },
      {
        id: 'card-10',
        title: 'Database schema',
        details:
          'Designed and migrated the initial PostgreSQL schema covering users, projects, columns, and cards. Indexes added for all foreign keys and frequently queried columns.',
      },
      {
        id: 'card-11',
        title: 'CI/CD pipeline',
        details:
          'Set up GitHub Actions workflows for linting, unit testing, and automated deployment to the staging environment on every merge to the main branch.',
      },
    ],
  },
];
