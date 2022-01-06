import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
      //有可能此block已经在合并的时候被删除了
      if (!state.columns[id]) return;
      const newState = { ...state };
      newState.columns[id].x = left;
      newState.columns[id].y = top;
      //把最新操作的block置顶
      // const nOrder = newState.columnOrder.filter((x) => x !== id);
      // nOrder.push(id);
      // newState.columnOrder = nOrder; 
      setState((state) => newState);
    },
    [state]
  );
  const [{ isOver, isOverCurrent }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.BLOCK, ItemTypes.STEP],
      drop: (item, monitor) => {
        const itemType = monitor.getItemType();
        const didDrop = monitor.didDrop();
        if (itemType === ItemTypes.BLOCK) {
          //console.log('block droped', item, didDrop);
          let delta = monitor.getDifferenceFromInitialOffset();
          if (didDrop) {
            delta = monitor.getDropResult().delta;
          }
          let left = Math.round(item.left + delta.x);
          let top = Math.round(item.top + delta.y);
          // if (snapToGrid) {
          //     ;
          //     [left, top] = doSnapToGrid(left, top);
          // }
          moveBox(item.id, left, top);
          monitor.getItem().left = left;
          monitor.getItem().top = top;
          return undefined;
        } else if (itemType === ItemTypes.STEP) {
          //console.log('step droped %s , didDrop %s', item, didDrop);
          if (didDrop) return;
          let delta = monitor.getDifferenceFromInitialOffset();
          moveStepIntoNewBlock(item, delta);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    }),
    [moveBox]
  );
  /**
   * 如果Block里只有一个step就移动Block的位置
   * 如果有多个step就将操作中的step移出当前Block，并新建一个Block来包裹它
   */
  const moveStepIntoNewBlock = (item, delta) => {
    const stepDom = document.querySelector('#' + item.id);
    const stepRect = stepDom.getBoundingClientRect();
    const left = delta.x + stepRect.left - 12;
    const top = delta.y + stepRect.top - 52;
    if (state.columns[item.pid].taskIds.length === 1) {
      moveBox(item.pid, left, top);
    } else {
      const nBlock = {
        id: uuidv4(),
        x: left,
        y: top,
        title: 'New Block',
        taskIds: [item.id],
      };
      const nState = { ...state };
      nState.columns[item.pid].taskIds.splice(item.index, 1);
      nState.columns[nBlock.id] = nBlock;
      // nState.columnOrder = [...nState.columnOrder, nBlock.id];
      setState((state) => nState);
    }
  };
  const moveStep = (itemType, source, destination) => {
    //console.log(`move `, itemType, ` from `, source, ` to `, destination);
    if (itemType === ItemTypes.BLOCK) {
      mergeSteps(source, destination);
    } else {
      // droppableId is BlockId or ColumnId
      if (!destination || !source) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;
      const newState = {
        ...state,
      };
      const sTaskIds = newState.columns[source.droppableId].taskIds;
      const dTaskIds = newState.columns[destination.droppableId].taskIds;

      const movingId = removeAtIndex(sTaskIds, source.index);
      insertAtIndex(dTaskIds, destination.index, movingId);
      //如果source block中没有剩余step，则删除此空block
      if (newState.columns[source.droppableId].taskIds.length === 0) {
        delete newState.columns[source.droppableId];
        // newState.columnOrder = newState.columnOrder.filter(
        //   (x) => x !== source.droppableId
        // );
      }

      setState((state) => newState);
    }
  };
  const mergeSteps = (source, destination) => {
    if (source.droppableId === destination.droppableId) return;
    const newState = {
      ...state,
    };
    const sTaskIds = newState.columns[source.droppableId].taskIds;
    const dTaskIds = newState.columns[destination.droppableId].taskIds;
    const index = destination.index;
    const ndTaskIds = dTaskIds
      .slice(0, index)
      .concat(sTaskIds, dTaskIds.slice(index));
    newState.columns[destination.droppableId].taskIds = ndTaskIds;
    //删除空Block
    delete newState.columns[source.droppableId];
    // newState.columnOrder = newState.columnOrder.filter(
    //   (x) => x !== source.droppableId
    // );
    //保留空Block
    //state.columns[source.droppableId].taskIds=[]

    setState((state) => newState);
  };

  return (
    <div className="App" ref={drop}>
      {/* {state.columnOrder.map((cid, cidx) => { */}
       { Object.keys(state.columns).map((cid, cidx) => {
        const cond =
          state.columns[cid] &&
          state.columns[cid].taskIds &&
          state.columns[cid].taskIds.length > 0;
        return cond ? (
          <Block
            key={cid}
            id={cid}
            index={cidx}
            column={state.columns[cid]}
            tasks={state.tasks}
            moveStep={moveStep}
          />
        ) : null;
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
            borderRadius: 6,
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
