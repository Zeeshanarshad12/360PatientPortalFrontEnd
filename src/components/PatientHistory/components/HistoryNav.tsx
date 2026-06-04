'use client';

import React, { useState, useMemo } from 'react';
import type { SectionItem, SectionStatus } from '../types/patientHistory.types';

interface HistoryNavProps {
  sections: SectionItem[];
  activeSection: number;
  onSelect: (id: number) => void;
  sectionStatus: Record<number, SectionStatus>;
  loading?: boolean;
  totalCount?: number;
}

const HistoryNav: React.FC<HistoryNavProps> = ({
  sections,
  activeSection,
  onSelect,
  sectionStatus,
  loading = false,
  totalCount
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? sections.filter((s) => s.name.toLowerCase().includes(q))
      : sections;
  }, [sections, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 12px'
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 20, color: '#111827' }}>
          History
        </span>
        {/* {totalCount != null && (
          <span
            style={{
              background: '#6b7280',
              color: '#fff',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0
            }}
          >
            {totalCount}
          </span>
        )} */}
      </div>

      {/* ── Section list ────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: '8px 16px', color: '#9ca3af', fontSize: 14 }}>
          Loading…
        </div>
      ) : (
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((section) => {
            const isActive = section.id === activeSection;
            const status = sectionStatus[section.id];
            const isIdle = status === 'idle';

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '11px 16px',
                  background: isActive ? '#eff6ff' : 'transparent',
                  border: 'none',

                  borderLeft: isActive
                    ? '3px solid #3b82f6'
                    : '3px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',

                  color: isActive ? '#2563eb' : isIdle ? '#9ca3af' : '#374151',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  lineHeight: 1.4,
                  boxSizing: 'border-box',
                  // No outline/box-shadow that could add red
                  outline: 'none',
                  boxShadow: 'none'
                }}
              >
                {section.name}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default HistoryNav;
