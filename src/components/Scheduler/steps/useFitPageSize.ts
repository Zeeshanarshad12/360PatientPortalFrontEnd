import { useCallback, useEffect, useState } from 'react';

// Page size that fills the list container instead of a fixed count, so
// paginated lists use the whole modal height on both laptop and large
// monitors (no empty band between the list and the pagination/footer).
// The container must take the remaining height (flex: 1, minHeight: 0);
// list items carry the `data-fit-item` attribute so a real row height is
// measured, with `fallbackRowHeight` used until the first item renders.
// `containerRef` is a callback ref, so it re-attaches if the container
// unmounts and mounts again (e.g. Step 3's "Change Provider").
export const useFitPageSize = (
  columns: number,
  itemCount: number,
  { minRows = 2, fallbackRowHeight = 42, gapPx = 6 } = {}
) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [rows, setRows] = useState(4);
  const containerRef = useCallback(
    (node: HTMLDivElement | null) => setContainer(node),
    []
  );

  useEffect(() => {
    if (!container) return;
    const measure = () => {
      const item = container.querySelector(
        '[data-fit-item]'
      ) as HTMLElement | null;
      const rowHeight = item?.offsetHeight || fallbackRowHeight;
      const fit = Math.floor(
        (container.clientHeight + gapPx) / (rowHeight + gapPx)
      );
      setRows(Math.max(minRows, fit));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [container, columns, itemCount, minRows, fallbackRowHeight, gapPx]);

  return { containerRef, pageSize: rows * columns };
};
