import {
  memo,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
} from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { useSelector } from 'react-redux';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemTypes } from './DnDConstants';
import './Task.css';

const Step = forwardRef(function Step(
  { id, isDragging, dragPreview, connectDragSource, connectDropTarget },
  ref
) {
  const task = useSelector((state) => state.flow.tasks[id]);
  console.log('step ', task);

  const elementRef = useRef(null);
  connectDragSource(elementRef);
  connectDropTarget(elementRef);

  const TaskClass = isDragging ? 'Task innerShadow diagonal' : 'Task';

  useImperativeHandle(ref, () => ({
    getNode: () => elementRef.current,
  }));
  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, []);
  const getStyle = () => {
    const transform = `translate(${task.x}px, ${task.y}px)`;
    return isDragging
      ? {
          position: 'absolute',
          transform,
          WebkitTransform: transform,
        }
      : null;
  };
  return (
    <div id={id} ref={elementRef} className={TaskClass} style={getStyle()}>
      {isDragging ? null : (
        <>
          <div className="left">
            <span className="icon">
              <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="currentColor"
                  d="M15.966 8.203l-1.582 4.667A1.665 1.665 0 0112.805 14H1.667C.747 14 0 13.253 0 12.333V3.667C0 2.747.746 2 1.667 2H4.52c.303 0 .59.137.78.377l.733.913c.19.24.477.377.78.377h5.52c.92 0 1.667.746 1.667 1.666 0 .37-.299.667-.667.667H6.11c-.943 0-1.79.563-2.153 1.437l-1.24 2.973c-.14.34.02.73.36.873a.668.668 0 00.873-.36L5.187 7.95a.997.997 0 01.923-.617l9.223-.003c.453 0 .775.443.633.873"
                ></path>
              </svg>
            </span>
          </div>
          <span className="labelSpan">
            <div className="label">{task.id}</div>
          </span>
          <div className="port">
            <div className="out"></div>
          </div>
        </>
      )}
    </div>
  );
});
export default DropTarget(
  [ItemTypes.STEP, ItemTypes.BLOCK],
  {
    drop(props, monitor) {
      if (monitor.getItemType() === ItemTypes.BLOCK) {
        const delta = monitor.getDifferenceFromInitialOffset();
        return { delta };
      }
    },
    hover(props, monitor, component) {
      if (1) return;
      if (!component) {
        return null;
      }
      // node = HTML Div element from imperative API
      const node = component.getNode();
      if (!node) {
        return null;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = node.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      const itemType = monitor.getItemType();

      if (itemType === ItemTypes.STEP) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;
        // console.log('hover',dragIndex,hoverIndex,monitor.getItem(), node)
        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return;
        }

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%
        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }
        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }
        // Time to actually perform the action
        props.moveStep(
          itemType,
          { index: dragIndex, droppableId: monitor.getItem().pid }, //source
          { index: hoverIndex, droppableId: props.pid }
        ); //destination
        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
        monitor.getItem().pid = props.pid;
      } else if (itemType === ItemTypes.BLOCK) {
        //TODO condition
        // props.moveStep(itemType,
        //     {index:-1,droppableId:monitor.getItem().id},
        //     {index:hoverIndex,droppableId:props.pid})
      }
    },
  },
  (connect) => ({
    connectDropTarget: connect.dropTarget(),
  })
)(
  DragSource(
    ItemTypes.STEP,
    {
      beginDrag: (props) => ({
        id: props.task.id,
        pid: props.pid,
        index: props.index,
        task: props.task,
      }),
      isDragging: (props, monitor) => {
        // If your component gets unmounted while dragged
        // (like a card in Kanban board dragged between lists)
        // you can implement something like this to keep its
        // appearance dragged:
        return monitor.getItem().id === props.id;
      },
    },
    (connect, monitor) => ({
      connectDragSource: connect.dragSource(),
      dragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging(),
    })
  )(Step)
);
