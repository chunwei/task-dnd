import './Task.css';

// const TaskDragPreview = memo(({ task })=>{
//   return (<>AA</>
//     // <div className='Task'>
//     //   <div className='left'>
//     //     <span className='icon'>
//     //       {/* <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M15.966 8.203l-1.582 4.667A1.665 1.665 0 0112.805 14H1.667C.747 14 0 13.253 0 12.333V3.667C0 2.747.746 2 1.667 2H4.52c.303 0 .59.137.78.377l.733.913c.19.24.477.377.78.377h5.52c.92 0 1.667.746 1.667 1.666 0 .37-.299.667-.667.667H6.11c-.943 0-1.79.563-2.153 1.437l-1.24 2.973c-.14.34.02.73.36.873a.668.668 0 00.873-.36L5.187 7.95a.997.997 0 01.923-.617l9.223-.003c.453 0 .775.443.633.873" ></path></svg> */}
//     //     </span>
//     //   </div>
//     //   <span className='labelSpan'><div className='label'>{task.content}</div></span>
//     //   <div className='port'><div className='out'></div></div>
//     // </div>
//   )
// })
const TaskDragPreview = ({ task, standalone }) => {
  const styles = {
    width: 306,
    opacity: 0.95,
    boxShadow: standalone ? 'rgb(17 49 96 / 20%) 0px 4px 8px 0px' : '',
  };
  return (
    <div className="Task" style={styles}>
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
        <div className="label">{task.content}</div>
      </span>
      <div className="port">
        <div className="out"></div>
      </div>
    </div>
  );
};
export default TaskDragPreview;
