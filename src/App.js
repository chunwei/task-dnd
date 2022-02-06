import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
  moveStep as moveStepAction,
  mergeSteps as mergeStepsAction,
  moveStepTo,
  moveBlockTo,
  createBlock,
} from './store/flow';
import { nanoid } from '@reduxjs/toolkit';
import { CustomDragLayer } from './CustomDragLayer';
//import initData from './init-data';
import './App.css';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './DnDConstants';
import Block from './Block';
import Edges from './Edges';
/* function insertAtIndex(arr, index, value) {
  arr.splice(index, 0, value);
  return arr;
}
function removeAtIndex(arr, index) {
  const removed = arr.splice(index, 1);
  return removed[0];
} */

function App() {
  //console.log('App render');
  const dispatch = useDispatch();
  //const state = useSelector((state) => state.flow);
  // columns =['','']
  const columns = useSelector(
    (state) => Object.keys(state.flow.columns),
    shallowEqual //避免引起不必要的渲染
  );
  //const [state, setState] = useState(initData);
  const moveBox = useCallback((id, left, top) => {
    dispatch(moveBlockTo({ id, left, top }));
  }, []);
  const moveStepBox = useCallback((id, left, top) => {
    dispatch(moveStepTo({ id, left, top }));
  }, []);
  const moveStep = useCallback((itemType, source, destination) => {
    dispatch(moveStepAction({ itemType, source, destination }));
  }, []);
  const mergeSteps = useCallback((source, destination) => {
    dispatch(mergeStepsAction({ source, destination }));
  }, []);
  /*   const moveBoxx = useCallback(
    (id, left, top) => {
      //有可能此block已经在合并的时候被删除了
      if (!state.columns[id]) return;
      const newState = { ...state };
      newState.columns[id].x = left;
      newState.columns[id].y = top;
      newState.currentBlock = id;
      //把最新操作的block置顶
      // const nOrder = newState.columnOrder.filter((x) => x !== id);
      // nOrder.push(id);
      // newState.columnOrder = nOrder;
      setState((state) => newState);
    },
    [state]
  ); */
  const [{ isOver, isOverCurrent }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.BLOCK, ItemTypes.STEP],
      hover: (item, monitor) => {
        //console.log('hover app ', item);
        const itemType = monitor.getItemType();
        if (itemType === ItemTypes.BLOCK) {
          let delta = monitor.getDifferenceFromInitialOffset();

          let left = Math.round(item.left + delta.x);
          let top = Math.round(item.top + delta.y);
          // if (snapToGrid) {
          //     ;
          //     [left, top] = doSnapToGrid(left, top);
          // }
          moveBox(item.id, left, top);
          // monitor.getItem().left = left;
          //monitor.getItem().top = top;
        } /* else if (itemType === ItemTypes.STEP) {
          //相对parent absolute定位,设置translates时用以下
          //const diffOffset = monitor.getDifferenceFromInitialOffset();
          //相对视口fixed定位，设置top,left时用以下
          const offset = monitor.getSourceClientOffset();
          moveStepBox(item.id, offset.x, offset.y);
        } */
      },
      drop: (item, monitor) => {
        const itemType = monitor.getItemType();
        const didDrop = monitor.didDrop();
        //console.log('droped in app ', item, didDrop);
        if (itemType === ItemTypes.BLOCK) {
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
    [moveBox, moveStepBox]
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
    const stepsCount = document
      .getElementById(item.pid)
      .querySelectorAll('.Task').length;
    if (stepsCount === 1) {
      moveBox(item.pid, left, top);
    } else {
      const nBlock = {
        id: nanoid(),
        x: left,
        y: top,
        title: 'New Block',
        taskIds: [item.id],
      };
      /* const nState = { ...state };
      nState.columns[item.pid].taskIds.splice(item.index, 1);
      nState.columns[nBlock.id] = nBlock;
      // nState.columnOrder = [...nState.columnOrder, nBlock.id];
      setState((state) => nState); */
      dispatch(createBlock({ block: nBlock, item }));
    }
  };

  /*   const moveStepx = (itemType, source, destination) => {
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

      const movingId = removeAtIndex(sTaskIds, source.index)[0];
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
  }; */

  /*
     const mergeStepsx = (source, destination) => {
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
  */

  return (
    <div className="App" ref={drop}>
      <Edges></Edges>
      {columns.map((cid, cidx) => {
        return <Block key={cid} id={cid} index={cidx} moveStep={moveStep} />;
      })}
      {<CustomDragLayer snapToGrid={false} />}
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
