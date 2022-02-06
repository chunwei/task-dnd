import { useEffect } from 'react';
import { useDragLayer } from 'react-dnd';
import { useSelector, useDispatch } from 'react-redux';
import { updateNodeRect } from './store/flow';
import { ItemTypes } from './DnDConstants';
import { snapToGrid } from './snapToGrid';
import ColumnDragPreview from './ColumnDragPreview';
import TaskDragPreview from './TaskDragPreview';
const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};
function getItemStyles(initialOffset, currentOffset, isSnapToGrid) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }
  let { x, y } = currentOffset;
  if (isSnapToGrid) {
    x -= initialOffset.x;
    y -= initialOffset.y;
    [x, y] = snapToGrid(x, y);
    x += initialOffset.x;
    y += initialOffset.y;
  }
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}
function getNodeRect(nodeId) {
  const rect = document
    .getElementById('preview_' + nodeId)
    .getBoundingClientRect();
  const nodeRect = {
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
    x: rect.x,
    y: rect.y,
  };
  nodeRect.in = { x: rect.left - 16, y: rect.top + rect.height / 2 };
  nodeRect.out = { x: rect.right + 16, y: rect.top + rect.height / 2 };
  //console.log('preview noderect ', nodeRect);
  return nodeRect;
}

export const CustomDragLayer = (props) => {
  const columns = useSelector((state) => state.flow.columns);
  const tasks = useSelector((state) => state.flow.tasks);
  const dispatch = useDispatch();

  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));
  useEffect(() => {
    if (itemType === ItemTypes.STEP) {
      const rect = getNodeRect(item.id);
      if (!(rect.height === 0 && rect.width === 0)) {
        dispatch(updateNodeRect({ id: item.id, rect }));
      }
    }
  }, [currentOffset]);
  function renderItem() {
    switch (itemType) {
      /* case ItemTypes.BLOCK:
        return columns[item.id]
          ? <ColumnDragPreview column={columns[item.id]} tasks={tasks} />:
            null; */
      case ItemTypes.STEP:
        return tasks[item.id] ? (
          <TaskDragPreview
            id={item.id}
            standalone={true}
            task={tasks[item.id]}
          />
        ) : null;
      default:
        return null;
    }
  }
  if (!isDragging) {
    return null;
  }
  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(initialOffset, currentOffset, props.snapToGrid)}
      >
        {renderItem()}
      </div>
    </div>
  );
};
