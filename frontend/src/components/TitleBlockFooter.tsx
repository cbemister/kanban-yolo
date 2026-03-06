"use client";

import { useEffect, useState } from "react";

interface TitleBlockFooterProps {
  projectName: string;
  taskCount: number;
}

function getCurrentMonth(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function TitleBlockFooter({ projectName, taskCount }: TitleBlockFooterProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          setCompact(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer className={`page-footer${compact ? " compact" : ""}`} aria-label="Project info">
      <div className="title-block">
        <div className="title-block-main">
          <div className="title-block-cell">
            <span className="title-block-label">Project</span>
            <span className="title-block-value">{projectName}</span>
          </div>
          <div className="title-block-cell">
            <span className="title-block-label">Date</span>
            <span className="title-block-value">{getCurrentMonth()}</span>
          </div>
          <div className="title-block-cell">
            <span className="title-block-label">Tasks</span>
            <span className="title-block-value">{taskCount}</span>
          </div>
          <div className="title-block-cell">
            <span className="title-block-label">Scale</span>
            <span className="title-block-value">1 : 1</span>
          </div>
        </div>
        <div className="title-block-project">
          <span className="title-block-project-name">{projectName}</span>
        </div>
      </div>
    </footer>
  );
}
