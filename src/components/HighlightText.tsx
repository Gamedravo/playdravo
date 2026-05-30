import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
}

export const HighlightText = ({ text, query }: HighlightTextProps) => {
  if (!query.trim()) return <>{text}</>;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-accent/30 text-accent rounded-sm px-0.5">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
};
