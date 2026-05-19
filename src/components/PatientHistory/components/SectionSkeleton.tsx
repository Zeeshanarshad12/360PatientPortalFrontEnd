import React from 'react';

interface SectionSkeletonProps {
  rows?: number;
}

const SectionSkeleton: React.FC<SectionSkeletonProps> = ({ rows = 18 }) => (
  <div className="ph-skeleton-wrapper">
    <div className="ph-skeleton ph-skeleton--title" />
    <div className="ph-skeleton ph-skeleton--subtitle" />
    <div className="ph-skeleton-grid">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ph-skeleton ph-skeleton--item" />
      ))}
    </div>
  </div>
);

export default SectionSkeleton;
