import { memo } from 'react';
import TaskDragPreview from './TaskDragPreview';
import './Column.css'

function getStyles() {
  return {
    display: 'inline-block',
  };
}
const ColumnDragPreview =({ column, tasks })=> {
  return (
    <div className='Column DragPreview'
      style={getStyles()}
    >
      <div className="header">
        <div className='title'>{column.title}</div>
      </div>
      <div className='TaskList'
      >
        {column.taskIds.map((tid, idx) =>(
          <div key={tid} className='TaskItem'> 
            <TaskDragPreview key={tid} task={tasks[tid]} index={idx} />
          </div>
        ))}
      </div>
    </div>
  )
}
export default ColumnDragPreview