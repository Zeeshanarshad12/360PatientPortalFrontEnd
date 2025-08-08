// components/SortableItem.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import IconButton from '@mui/material/IconButton';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '16px'
  };

  // Clone and inject `listeners` as prop to the only child (WidgetWrapper)
  const childWithProps = React.cloneElement(
    children as React.ReactElement<any>,
    { dragHandleProps: listeners }
  );

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drag handle must be a specific child with listeners
      <IconButton {...listeners} size="small" style={{ cursor: 'grab' }}>
        <DragIndicatorIcon />
      </IconButton>
      <div>{children}</div> */}
      {childWithProps}
    </div>
  );
};

export default SortableItem;