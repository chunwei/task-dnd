import { Fragment, memo, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemTypes } from './DnDConstants';
import Step from './Step';
import './Column.css';
import { Indicator, IndicatorType } from './Indicator';
import { ReactComponent as PlayLogo } from './play.svg'

function getStyles(left, top, isDragging) {
  const transform = `translate3d(${left}px, ${top}px, 0)`;
  return {
    position: 'absolute',
    transform,
    WebkitTransform: transform,
    // IE fallback: hide the real node using CSS when dragging
    // because IE will ignore our custom "empty image" drag preview.
    opacity: isDragging ? 0.3 : 1,
    // height: isDragging ? 0 : 'auto',
  };
}
const Block = ({ index, column, tasks, moveStep }) => {
  const { x: left, y: top, id } = column;
  const iids=['iid-'+column.id].concat(column.taskIds.map(id=>'iid-'+id))
  //useEffect(()=>{iids=['iid-'+column.id].concat(column.taskIds.map(id=>'iid-'+id))},[])
  const placeholderRef=useRef('x')
  const [placeholderId, setPlaceholderId] = useState(placeholderRef.current);
  const ref = useRef();
  //console.log( `Block re-render %c(${id}), ${left},${top},${placeholderId}`,'color:red')
  //console.log('iids ',iids)
  const [{ isOver,isOverCurrent,sourceItem }, drop] = useDrop(() => ({
    accept: [ItemTypes.STEP, ItemTypes.BLOCK], //TODO handle Block hover
    hover: (item, monitor, component) => {
      //注意：item === monitor.getItem()
      //if (!isOverCurrent) return;
      if (id === item.id) return; //hover itself
      if (!ref) return;
      // node = HTML Div element from ref
      const node = ref.current;
      if (!node) return;
/*       console.log(item.id,//source, which item is being dragged
        ' hover block ',
        id //target item id
        //node, // target item dom
        //ref
      ); */

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      const possibles=node.querySelectorAll('.'+IndicatorType.PossibleMove)
      const opened=node.querySelector('.'+IndicatorType.Placeholder)
      const candis=Array.from(possibles)
      if(opened)candis.unshift(opened)
      //console.log(candis)
      const found=candis.find((iddom)=>{
        const iid=iddom.id
        const idRect = iddom.getBoundingClientRect();
        const upBound = idRect.top - clientOffset.y;
        const lowBound = clientOffset.y - idRect.bottom;
        //console.log(`${iid} up ${upBound}=(t ${idRect.top} - y ${clientOffset.y}), low ${lowBound}=(y ${clientOffset.y} - b ${idRect.bottom})`);
        if((upBound<30 && upBound>=0)
          ||(lowBound<30 && lowBound>=0)
          ||(idRect.top<=clientOffset.y&&clientOffset.y<=idRect.bottom))
          return true
        return false
      })
      const newplaceholderId=(!!found)?found.id:'x'

      //console.log(`%cp & np (${placeholderRef.current}) & ${newplaceholderId} `,'color:blue')
      if(newplaceholderId!==placeholderRef.current)
      {
        //console.log(`%cp -> np (${placeholderRef.current}) => ${newplaceholderId} `,'color:red')
        placeholderRef.current=newplaceholderId
        setPlaceholderId(placeholderId=>newplaceholderId)
      }
    },
    drop: (item, monitor) => {
      let delta = monitor.getDifferenceFromInitialOffset();
      if (monitor.didDrop()) {
        //STEP中已经处理过drop,可以在monitor的drag end中获取dropResult，含delta
        delta = monitor.getDropResult().delta;
      }
      const itemType=monitor.getItemType()
      const iids=['iid-'+column.id].concat(column.taskIds.map(id=>'iid-'+id))
      const dIndex=iids.findIndex(iid=>iid===placeholderRef.current)
      //console.log(`%cpref , pid (${placeholderRef.current}) => ${placeholderId} `,'color:red')
      //console.log(dIndex, iids)
      if (itemType === ItemTypes.STEP) {
        const sDroppableId=item.pid
        // 当type是Block时source.index用不上
        const source={index:item.index,droppableId:sDroppableId}
        const destination={index:dIndex,droppableId:id}
        moveStep(itemType,source, destination)
      }
      if (itemType === ItemTypes.BLOCK) {
        const sDroppableId=item.id
        // 当type是Block时source.index用不上
        const source={index:item.index,droppableId:sDroppableId}
        const destination={index:dIndex,droppableId:id}
        moveStep(itemType,source, destination)
      }
      if (itemType === ItemTypes.BLOCK) {
        //如果只是一个block的位置移动到另一个block上，但没有触发合并
        return { delta };
        //如果触发插入合并
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent:monitor.isOver({shallow:true}),
      sourceItem:monitor.getItem()
    }),
  }));
  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: ItemTypes.BLOCK,
      item: { id, left, top, column, tasks, type: ItemTypes.BLOCK},
      // end:(item,monitor)=>{
      //   const delta = monitor.getDifferenceFromInitialOffset();
      //   if(monitor.didDrop())
      //   console.log('block drag ended', item, monitor.getDropResult(),delta);
      // },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    []
  );
  drag(drop(ref));
  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, []);
  useEffect(()=>{
    if(!isOverCurrent)setPlaceholderId(x=>'x')
  },[isOverCurrent])
  const isPossibleMove=(indicatorId)=>{
    if(sourceItem.id===id)return false;
    if(!!sourceItem.pid){//拖动的是STEP
      if(sourceItem.pid===id){//同一个block内
        //排除拖动中的元素及其前面的元素
        const iids=['iid-'+column.id].concat(column.taskIds.map(id=>'iid-'+id))
        const indexOfId=iids.findIndex(iid=>iid ==='iid-'+sourceItem.id)
        if(indicatorId===iids[indexOfId])return false;
        if(indicatorId===iids[indexOfId-1])return false;
        return true
      }else{//跨block
        return true
      }
    }
    if(sourceItem.type===ItemTypes.BLOCK){
      return true
    }
    return false
  }
  const getIndicatorType=(indicatorId)=>{
    if(isOver) {
      if(indicatorId===placeholderId){
        return IndicatorType.Placeholder+' boxes innerShadow'
      }
      return isPossibleMove(indicatorId)?IndicatorType.PossibleMove:''
    }
    return ''
  }
  return (
    <div
      ref={ref}
      //ref={drag}
      className="Column"
      role="DraggableBox"
      style={getStyles(left, top, isDragging)}
    >
      <div className="header">
        <div className='title'>{column.title}</div>
        <div className='rightArea'>
          <div className='testBtn'>
          <span className='svg-icon'>
            <PlayLogo/>
          </span>
          </div>
        </div>
        
      </div>

      <div /* ref={drop} */ className="TaskList">
        {
          <Indicator
            key={iids[0]}
            id={iids[0]}
            type={getIndicatorType(iids[0])}
          ></Indicator>
        }
        {column.taskIds.map((tid, idx) => {
          let iid=iids[idx+1]
          return (
          <Fragment key={tid}>
            <div key={tid} className="TaskItem">
              <Step
                pid={id}
                id={tid}
                key={tid}
                task={tasks[tid]}
                index={idx}
                moveStep={moveStep}
              />
            </div>
            <Indicator key={iid} id={iid} type={getIndicatorType(iid)}></Indicator>
          </Fragment>
        )})}
      </div>
    </div>
  );
};
export default Block;
