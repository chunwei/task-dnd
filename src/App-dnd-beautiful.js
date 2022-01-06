import React,{useState,useCallback} from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column';
import { CustomDragLayer } from './CustomDragLayer';
import initData from './init-data';
import './App.css'
import { DndProvider,useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ItemTypes } from './DnDConstants';
function insertAtIndex(arr,index,value){
  arr.splice(index,0,value)
  return arr
}
function removeAtIndex(arr,index){
  arr.splice(index,1)
  return arr
}

function App() {
  const [state, setState] = useState(initData)
  const moveBox =useCallback(
    (id, left, top) => {

        const newState={...state}
        newState.columns[id].x=left
        newState.columns[id].y=top
        setState(newState)

    },
    [state],
  )
  const [{isOver},drop]=useDrop(()=>({
    accept:ItemTypes.BLOCK,
    drop:(item,monitor)=>{console.log('block droped',item,monitor)
      const delta = monitor.getDifferenceFromInitialOffset();
      let left = Math.round(item.left + delta.x);
      let top = Math.round(item.top + delta.y);
      // if (snapToGrid) {
      //     ;
      //     [left, top] = doSnapToGrid(left, top);
      // }
      moveBox(item.id, left, top);
      return undefined;
    },
    collect:(monitor)=>({
      isOver:!!monitor.isOver()
    })
  }),
  [moveBox]
  )

/**
 * Life cycle:
 * onBeforeCapture: a drag is about to start and dimensions have not been collected from the DOM
 * onBeforeDragStart: a drag is about to start and dimensions have been captured from the DOM
 * onDragStart: A drag has started
 * onDragUpdate: Something has changed during a drag
 * onDragEnd (required): A drag has ended. 
 * It is the responsibility of this responder to synchronously apply changes that has resulted from the drag
 */
  const onBeforeCapture=(before /*BeforeCapture*/)=>{
    // type BeforeCapture = {
    //   draggableId: DraggableId,
    //   mode: MovementMode,
    // };
    console.log('onBeforeCapture',before)

  }
  const onBeforeDragStart=(start)=>{
    console.log('onBeforeDragStart',start)
  }
  const onDragStart=(start,provided)=>{
    console.log('onDragStart',start,provided)
  }
  const onDragUpdate=(update,provided)=>{
    console.log('onDragUpdate',update,provided)
  }
  /**
   * 
   * @param {*} result 
   * {
   *  draggableId:'task-1',
   *  type:'TYPE',
   *  reason:'DROP',
   *  source:{
   *    droppableId:'column-1'，
   *    index:0
   *  },
   *  destination:{
   *    droppableId:'column-1'，
   *    index:0
   *  }
   * }
   */
  const onDragEnd=(result,provided)=>{
    console.log('onDragEnd',result,provided)
    if(result.type=='block')return
    const {draggableId,source,destination}=result
    if(!destination)return 
    if(source.droppableId===destination.droppableId
      &&source.index===destination.index)return
    
    const sTaskIds=state.columns[source.droppableId].taskIds
    const dTaskIds=state.columns[destination.droppableId].taskIds

    const nsTaskIds=removeAtIndex(sTaskIds,source.index)
    const ndTaskIds=insertAtIndex(dTaskIds,destination.index,draggableId)

    // const newDistinationCol={
    //   ...state.columns[destination.droppableId],
    //   taskIds:ndTaskIds
    // }
    // const newSourceCol={
    //   ...state.columns[source.droppableId],
    //   taskIds:nsTaskIds
    // }
    const newState={
      ...state,
      // columns:{
      //   ...state.columns,
      //   [source.droppableId]:newSourceCol,
      //   [destination.droppableId]:newDistinationCol
      // }
    }
    setState(newState)
  }
  
  return (
    
      <DragDropContext
      onBeforeCapture={onBeforeCapture}
      onBeforeDragStart={onBeforeDragStart}
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      onDragEnd={onDragEnd}
      >
        <div className="App" ref={drop}>
          {state.columnOrder.map((cid,cidx)=>{
            return <Column key={cid} index={cidx} column={state.columns[cid]} tasks={state.tasks} />
          })}
          <CustomDragLayer snapToGrid={false}/>
          {isOver && (
            <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100px',
                  width: '100px',
                  zIndex: 1,
                  opacity: 0.5,
                  backgroundColor: 'yellow',
                }}
              />
            )}
        </div>
      </DragDropContext>
    
  );
}

export default App;
