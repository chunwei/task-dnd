import React, { useState, useCallback } from 'react';
import { CustomDragLayer } from './CustomDragLayer';
import initData from './init-data';
import './App.css';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './DnDConstants';
import Block from './Block';
function insertAtIndex(arr, index, value) {
  arr.splice(index, 0, value);
  return arr;
}
function removeAtIndex(arr, index) {
  const removed = arr.splice(index, 1);
  return removed[0];
}

function App() {
  const [state, setState] = useState(initData);
  const moveBox = useCallback(
    (id, left, top) => {
      const newState = { ...state };
      newState.columns[id].x = left;
      newState.columns[id].y = top;
      setState(state=>newState);
    },
    [state]
  );
  const [{ isOver ,isOverCurrent}, drop] = useDrop(
    () => ({
      accept: [ItemTypes.BLOCK,ItemTypes.STEP],
      drop: (item, monitor) => {
        const itemType=monitor.getItemType()
        if(itemType===ItemTypes.BLOCK){
        console.log('block droped', item, monitor.didDrop());
        let delta = monitor.getDifferenceFromInitialOffset();
        if(monitor.didDrop()){
          delta=monitor.getDropResult().delta
        }
        let left = Math.round(item.left + delta.x);
        let top = Math.round(item.top + delta.y);
        // if (snapToGrid) {
        //     ;
        //     [left, top] = doSnapToGrid(left, top);
        // }
        moveBox(item.id, left, top);
        monitor.getItem().left=left
        monitor.getItem().top=top
        return undefined;
      }else if(itemType===ItemTypes.STEP){
        console.log('step droped %s , didDrop %s', item, monitor.didDrop());
      }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent:monitor.isOver({shallow:true})
      }),
    }),
    [moveBox]
  );

  const moveStep = (itemType,source, destination) => {
    console.log('moveStep',itemType, source, destination);
    if(itemType===ItemTypes.BLOCK){
      mergeSteps(source, destination)
    }else{
      // droppableId is BlockId or ColumnId
    if (!destination || !source) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sTaskIds = state.columns[source.droppableId].taskIds;
    const dTaskIds = state.columns[destination.droppableId].taskIds;

    const movingId = removeAtIndex(sTaskIds, source.index);
    insertAtIndex(dTaskIds, destination.index, movingId);
    const newState = {
      ...state,
    };
    setState(newState);
    }
    
  };
  const mergeSteps = (source, destination) => {
    if(source.droppableId === destination.droppableId)return;
    const sTaskIds = state.columns[source.droppableId].taskIds;
    const dTaskIds = state.columns[destination.droppableId].taskIds;
    const index=destination.index
    const ndTaskIds=dTaskIds.slice(0,index).concat(sTaskIds,dTaskIds.slice(index))
    state.columns[destination.droppableId].taskIds=ndTaskIds
    //删除空Block
    //delete state.columns[source.droppableId]
    //保留空Block
    state.columns[source.droppableId].taskIds=[]
    const newState = {
      ...state
    };
    setState(newState);
  }

  return (
    <div className="App" ref={drop}>
      {state.columnOrder.map((cid, cidx) => {
        return (
          <Block
            key={cid}
            id={cid}
            index={cidx}
            column={state.columns[cid]}
            tasks={state.tasks}
            moveStep={moveStep}
          />
        );
      })}
      <CustomDragLayer snapToGrid={false} />
      {isOverCurrent && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            height: 6,
            width: 6,
            borderRadius:6,
            zIndex: 1,
            opacity: 0.5,
            backgroundColor: 'green',
          }}
        />
      )}
    </div>
  );
}

export default App;
