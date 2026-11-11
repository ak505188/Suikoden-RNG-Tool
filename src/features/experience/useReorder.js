import { useEffect, useRef, useState } from 'react';

// Drag and drop for reordering a list of rows or columns. Call it once per list with
// `onMove(from, to)`; it hands back what the markup needs:
//   dragging  the index being dragged (set just after the drag starts, so the drag image isn't
//             dimmed along with the item), or null
//   overIndex the index being dragged over, or null
//   start(index) · over(event, index) · drop(index) · end()  for the matching drag events
// Dragging something that isn't from this list (another list's items, a file) is ignored.
export const useReorder = (onMove) => {
  const from = useRef(null);
  const timer = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const reset = () => {
    clearTimeout(timer.current);
    from.current = null;
    setDragging(null);
    setOverIndex(null);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return {
    dragging,
    overIndex,
    start: (index) => {
      from.current = index;
      timer.current = setTimeout(() => setDragging(index), 0);
    },
    over: (event, index) => {
      if (from.current === null) return;
      event.preventDefault(); // lets the item be dropped here
      setOverIndex(index);
    },
    drop: (to) => {
      const start = from.current;
      reset();
      if (start !== null && start !== to) onMove(start, to);
    },
    end: reset,
  };
};
