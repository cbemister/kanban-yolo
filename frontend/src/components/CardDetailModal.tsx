"use client";

import type { Card } from "@/types";

interface CardDetailModalProps {
  card: Card;
  onClose: () => void;
}

export default function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-800 text-sm font-bold"
          aria-label="Close"
        >
          x
        </button>
        <h2
          className="text-xl font-bold mb-3 pr-8 leading-snug"
          style={{ color: "#032147" }}
        >
          {card.title}
        </h2>
        {card.details ? (
          <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
            {card.details}
          </p>
        ) : (
          <p className="text-sm italic" style={{ color: "#888888" }}>
            No details provided.
          </p>
        )}
      </div>
    </div>
  );
}
