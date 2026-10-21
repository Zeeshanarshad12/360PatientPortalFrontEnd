import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, IconButton, alpha, useTheme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface ScrollableChipTabsProps {
  items: { key: string; label: string }[];
  value: number;
  onChange: (index: number) => void;
  ariaLabel?: string;
}

// YouTube-style filter bar: one row of pill tabs, no visible scrollbar,
// arrow buttons with a fade appear only on the side that has more tabs.
// Built instead of MUI <Tabs variant="scrollable"> because the theme
// forces `scrollableX: overflow: visible`, which makes the whole step
// scroll horizontally.
const ScrollableChipTabs: React.FC<ScrollableChipTabsProps> = ({
  items,
  value,
  onChange,
  ariaLabel
}) => {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [items, updateArrows]);

  // Keep the selected tab visible (e.g. after a reset back to "All").
  useEffect(() => {
    const el = scrollRef.current;
    const tab = el?.children[value] as HTMLElement | undefined;
    if (!el || !tab) return;
    const left = tab.offsetLeft - el.offsetLeft;
    if (left < el.scrollLeft || left + tab.offsetWidth > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: Math.max(0, left - 40), behavior: 'smooth' });
    }
  }, [value]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: 'smooth' });
  };

  const paper = theme.palette.background.paper;

  const renderArrow = (direction: 1 | -1) => (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [direction === 1 ? 'right' : 'left']: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: direction === 1 ? 'flex-end' : 'flex-start',
        width: 64,
        pointerEvents: 'none',
        background: `linear-gradient(to ${
          direction === 1 ? 'left' : 'right'
        }, ${paper} 45%, ${alpha(paper, 0)})`,
        zIndex: 6
      }}
    >
      <IconButton
        size="small"
        aria-label={direction === 1 ? 'Scroll tabs right' : 'Scroll tabs left'}
        onClick={() => scrollBy(direction)}
        sx={{
          pointerEvents: 'auto',
          width: 30,
          height: 30,
          bgcolor: paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: `0 1px 4px ${alpha(theme.palette.common.black, 0.12)}`,
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
        }}
      >
        {direction === 1 ? (
          <ChevronRightIcon fontSize="small" />
        ) : (
          <ChevronLeftIcon fontSize="small" />
        )}
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', minWidth: 0 }}>
      {canScrollLeft && renderArrow(-1)}
      <Box
        ref={scrollRef}
        role="tablist"
        aria-label={ariaLabel}
        onScroll={updateArrows}
        sx={{
          display: 'flex',
          gap: 0.75,
          overflowX: 'auto',
          overflowY: 'hidden',
          py: 0.5,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {items.map((item, index) => {
          const selected = index === value;
          return (
            <ButtonBase
              key={item.key}
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(index)}
              sx={{
                flexShrink: 0,
                height: 30,
                px: 1.75,
                borderRadius: '6px',
                fontSize: 13,
                fontWeight: selected ? 700 : 500,
                whiteSpace: 'nowrap',
                border: '1px solid',
                transition: 'all .2s',
                borderColor: selected
                  ? theme.palette.primary.dark
                  : theme.palette.divider,
                color: selected
                  ? theme.palette.common.white
                  : theme.palette.text.secondary,
                bgcolor: selected
                  ? theme.palette.primary.main
                  : alpha(theme.palette.text.primary, 0.04),
                boxShadow: selected
                  ? `0px 2px 10px ${alpha(theme.palette.primary.main, 0.35)}`
                  : 'none',
                '&:hover': selected
                  ? undefined
                  : {
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.06)
                    }
              }}
            >
              {item.label}
            </ButtonBase>
          );
        })}
      </Box>
      {canScrollRight && renderArrow(1)}
    </Box>
  );
};

export default ScrollableChipTabs;
