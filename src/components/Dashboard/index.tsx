import { useDispatch } from '@/store/index';
import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useInitialLayout } from './contexts/widgetData';
import SortableItem from './components/SortableItem';
import WidgetWrapper from './components/WidgetWrapper';
import HeartProgressLoader from '@/components/ProgressLoaders/components/HeartLoader';
import { saveDashboardConfiguration } from '@/slices/patientprofileslice';

const DroppableColumn = ({
  id,
  children
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minWidth: '300px',
        minHeight: '200px'
      }}
    >
      {children}
    </div>
  );
};

const PatientDashboard = () => {
  const [heartLoading, setHeartLoading] = useState(true);
  const layout = useInitialLayout();
  const [columns, setColumns] = useState(layout);
  const [activeId, setActiveId] = useState<string | null>('');
  const dispatch = useDispatch();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setColumns(layout);
  }, [layout]);

  const findColumn = (id: string): string | undefined => {
    return Object.keys(columns).find((key) =>
      columns[key as keyof typeof columns].includes(id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumn(activeId);
    const overCol = columns[overId] !== undefined ? overId : findColumn(overId);

    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const activeItems = [...prev[activeCol]];
      const overItems = [...prev[overCol]];

      const activeIndex = activeItems.indexOf(activeId);
      if (activeIndex === -1) return prev;

      activeItems.splice(activeIndex, 1);
      overItems.push(activeId); // Add to end of target column

      return {
        ...prev,
        [activeCol]: activeItems,
        [overCol]: overItems
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = findColumn(activeId);
    const targetColumn =
      columns[overId] !== undefined ? overId : findColumn(overId);

    if (!sourceColumn || !targetColumn) {
      setActiveId(null);
      return;
    }

    let newColumns = { ...columns };

    if (sourceColumn === targetColumn) {
      const items = [...newColumns[sourceColumn]];
      const oldIndex = items.indexOf(activeId);
      const newIndex = items.indexOf(overId);
      newColumns[sourceColumn] = arrayMove(items, oldIndex, newIndex);
    } else {
      const activeItems = [...newColumns[sourceColumn]];
      const overItems = [...newColumns[targetColumn]];
      const activeIndex = activeItems.indexOf(activeId);
      activeItems.splice(activeIndex, 1);
      overItems.push(activeId);
      newColumns[sourceColumn] = activeItems;
      newColumns[targetColumn] = overItems;
    }

    setColumns(newColumns);
    setActiveId(null);
  };

  useEffect(() => {
    if (!columns) return;
    if (!localStorage.getItem('patientID')) return;

    const payload: any[] = [];
    Object.entries(columns).forEach(([columnKey, widgets]) => {
      const column = parseInt(columnKey.replace('column', ''), 10);
      widgets.forEach((header, rowIndex) => {
        payload.push({
          header,
          column,
          row: rowIndex + 1
        });
      });
    });

    const obj = {
      PatientID: localStorage.getItem('patientID'),
      payload
    };

    dispatch(saveDashboardConfiguration(obj));
  }, [columns, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeartLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {heartLoading ? (
        <HeartProgressLoader />
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            padding: 1,
            overflowY: 'auto',
            height: 'calc(100vh - 100px)'
          }}
          tabIndex={0}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div style={{ display: 'flex', gap: '25px', paddingRight: '10px' }}>
              {Object.entries(columns).map(([columnKey, widgets]) => (
                <DroppableColumn key={columnKey} id={columnKey}>
                  <SortableContext
                    items={widgets}
                    strategy={verticalListSortingStrategy}
                  >
                    {widgets.length > 0 ? (
                      widgets.map((widgetId) => (
                        <SortableItem key={widgetId} id={widgetId}>
                          <WidgetWrapper id={widgetId}></WidgetWrapper>
                        </SortableItem>
                      ))
                    ) : (
                      <div
                        style={{
                          minHeight: '100px',
                          color: '#aaa',
                          textAlign: 'center',
                          lineHeight: '100px'
                        }}
                      ></div>
                    )}
                  </SortableContext>
                </DroppableColumn>
              ))}
            </div>

            <DragOverlay>
              {activeId ? <WidgetWrapper id={activeId}></WidgetWrapper> : null}
            </DragOverlay>
          </DndContext>
        </Box>
      )}
    </>
  );
};

export default PatientDashboard;