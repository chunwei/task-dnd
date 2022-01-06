import { memo, useEffect } from 'react';
import { Droppable } from 'react-beautiful-dnd'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemTypes } from './DnDConstants'
import Task from './Task'
import './Column.css'

function getStyles(left, top, isDragging) {
  const transform = `translate3d(${left}px, ${top}px, 0)`;
  return {
      position: 'absolute',
      transform,
      WebkitTransform: transform,
      // IE fallback: hide the real node using CSS when dragging
      // because IE will ignore our custom "empty image" drag preview.
      opacity: isDragging ? 0.5 : 1,
      //height: isDragging ? 0 : '',
  };
}
const Column = memo(({ index, column, tasks }) => {
  const {x:left,y:top,id}=column
  const [{isDragging}, drag, dragPreview]=useDrag(()=>({
    type:ItemTypes.BLOCK,
    item:{id,left,top,column,tasks},
    collect:monitor=>({
      isDragging:!!monitor.isDragging()
    })
  }),[id,left,top,column,tasks])
  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, []);
  return (
    <div className='Column' ref={drag} role="DraggableBox"
    style={getStyles(left,top,isDragging)}
    >
      <div className='header'
      >
        {column.title}
      </div>
      <Droppable droppableId={column.id} type='task'>
        {provided => (
          <div className='TaskList'
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {column.taskIds.map((tid, idx) => <Task key={tid} task={tasks[tid]} index={idx} />)}
            {provided.placeholder}
          </div>)
        }
      </Droppable>
    </div>
 )
})
export default Column