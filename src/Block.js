import {
  Fragment,
  memo,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemTypes } from './DnDConstants';
import Step from './Step';
import './Column.css';
import { Indicator, IndicatorType } from './Indicator';
import { ReactComponent as PlayLogo } from './play.svg';
import { batchUpdateNodeRect } from './store/flow';

function getStyles(left, top, isDragging, currentOne) {
  //const transform = `translate3d(${left}px, ${top}px, 0)`;
  return {
    position: 'absolute',
    top,
    left,
    zIndex: currentOne ? 3 : 'auto',
    //transform,
    //WebkitTransform: transform,
    // IE fallback: hide the real node using CSS when dragging
    // because IE will ignore our custom "empty image" drag preview.
    //opacity: isDragging ? 0.3 : 1,
    // height: isDragging ? 0 : 'auto',
  };
}
const Block = ({ id, index, moveStep }) => {
  const currentBlock = useSelector((state) => state.flow.currentBlock);
  const currentOne = currentBlock === id;
  const column = useSelector((state) => state.flow.columns[id]);

  const { x: left, y: top } = column;
  const iids = ['iid-' + column.id].concat(
    column.taskIds.map((id) => 'iid-' + id)
  );

  const placeholderRef = useRef('x');
  const [placeholderId, setPlaceholderId] = useState(placeholderRef.current);
  const ref = useRef();
  /*   console.log(
    `Block re-render %c(${id}), ${left},${top},${placeholderId}`,
    'color:red'
  ); */
  const [{ isOver, isOverCurrent, sourceItem }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.STEP, ItemTypes.BLOCK], //TODO handle Block hover
      hover: (item, monitor, component) => {
        //console.log('hover block', id, item);
        //注意：item === monitor.getItem()
        //if (!isOverCurrent) return;
        //if (id === item.id) return; //hover itself
        if (!ref) return;
        // node = HTML Div element from ref
        const node = ref.current;
        if (!node) return;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        const possibles = node.querySelectorAll(
          '.' + IndicatorType.PossibleMove
        );
        const opened = node.querySelector('.' + IndicatorType.Placeholder);
        const candis = Array.from(possibles);
        if (opened) candis.unshift(opened);
        //console.log(candis)
        const found = candis.find((iddom) => {
          const idRect = iddom.getBoundingClientRect();
          const upBound = idRect.top - clientOffset.y;
          const lowBound = clientOffset.y - idRect.bottom;

          if (
            (upBound < 30 && upBound >= 0) ||
            (lowBound < 30 && lowBound >= 0) ||
            (idRect.top <= clientOffset.y && clientOffset.y <= idRect.bottom)
          )
            return true;
          return false;
        });
        const newplaceholderId = !!found ? found.id : 'x';

        /*       console.log(
        `%cp & np (${placeholderRef.current}) & ${newplaceholderId} `,
        'color:blue'
      ); */
        if (newplaceholderId !== placeholderRef.current) {
          /* console.log(
          `%cp -> np (${placeholderRef.current}) => ${newplaceholderId} `,
          'color:red'
        ); */
          placeholderRef.current = newplaceholderId;
          setPlaceholderId((placeholderId) => newplaceholderId);
        }
      },
      drop: (item, monitor) => {
        let delta = monitor.getDifferenceFromInitialOffset();
        if (monitor.didDrop()) {
          //STEP中已经处理过drop,可以在monitor的drag end中获取dropResult，含delta
          delta = monitor.getDropResult().delta;
        }
        const itemType = monitor.getItemType();
        const iids = Array.from(
          ref.current.querySelectorAll('.' + IndicatorType.Indicator)
        ).map((n) => n.id);
        let dIndex = iids.findIndex((iid) => iid === placeholderRef.current);
        /*       console.log(
        `%cpref , pid (${placeholderRef.current}) => ${placeholderId} `,
        'color:red'
      );
      console.log('drop ', dIndex, iids); */
        if (dIndex > -1) {
          if (itemType === ItemTypes.STEP) {
            if (item.pid === id && dIndex > item.index) {
              dIndex -= 1;
            }
            const sDroppableId = item.pid;
            // 当type是Block时source.index用不上
            const source = { index: item.index, droppableId: sDroppableId };
            const destination = { index: dIndex, droppableId: id };
            moveStep(itemType, source, destination);
          }
          if (itemType === ItemTypes.BLOCK) {
            if (id === item.id) return; //hover itself
            const sDroppableId = item.id;
            // 当type是Block时source.index用不上
            const source = { index: item.index, droppableId: sDroppableId };
            const destination = { index: dIndex, droppableId: id };
            moveStep(itemType, source, destination);
          }
        }
        if (itemType === ItemTypes.BLOCK) {
          //如果只是一个block的位置移动到另一个block上，但没有触发合并
          return { delta };
          //如果触发插入合并
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        sourceItem: monitor.getItem(),
      }),
    }),
    [id]
  );
  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: ItemTypes.BLOCK,
      item: { id, left, top, index, type: ItemTypes.BLOCK },
      // end:(item,monitor)=>{
      //   const delta = monitor.getDifferenceFromInitialOffset();
      //   if(monitor.didDrop())
      //   console.log('block drag ended', item, monitor.getDropResult(),delta);
      // },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [id, left, top, index]
  );
  drag(drop(ref));

  const dispatch = useDispatch();

  const onAnimaEnd = useCallback(() => {
    //console.log('transitionend');
    dispatch(batchUpdateNodeRect({ id }));
  }, []);

  /**
   * 对动画结束事件 onEnd 回调的处理函数
   *
   * @param {string} type - 事件解绑定类型: add - 绑定事件，remove - 移除事件绑定
   */
  const handleEndListener = (type = 'add') => {
    if (ref && ref.current) {
      const el = ref.current.querySelector('.Indicator.Placeholder');
      if (el) {
        const events = ['animationend', 'transitionend'];
        if (type === 'add') {
          //remove first
          events.forEach((ev) => {
            el[`removeEventListener`](ev, onAnimaEnd, false);
          });
        }
        events.forEach((ev) => {
          el[`${type}EventListener`](ev, onAnimaEnd, false);
        });
      }
    }
  };

  useEffect(() => {
    handleEndListener('add');
    return () => {
      handleEndListener('remove');
    };
  }, [placeholderId, placeholderRef.current]);
  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, []);
  useEffect(() => {
    if (!isOverCurrent) setPlaceholderId((x) => 'x');
  }, [isOverCurrent]);
  const isPossibleMove = (indicatorId) => {
    if (sourceItem.id === id) return false;
    if (!!sourceItem.pid) {
      //拖动的是STEP
      if (sourceItem.pid === id) {
        //同一个block内
        //排除拖动中的元素及其前面的元素
        /* const iids = ['iid-' + column.id].concat(
          column.taskIds.map((id) => 'iid-' + id)
        ); */
        //console.log('isPossibleMove iids ', iids);
        const indexOfId = iids.findIndex(
          (iid) => iid === 'iid-' + sourceItem.id
        );
        if (indicatorId === iids[indexOfId]) return false;
        if (indicatorId === iids[indexOfId - 1]) return false;
        return true;
      } else {
        //跨block
        return true;
      }
    }
    if (sourceItem.type === ItemTypes.BLOCK) {
      return true;
    }
    return false;
  };
  const getIndicatorType = (indicatorId) => {
    if (isOver) {
      if (indicatorId === placeholderId) {
        return IndicatorType.Placeholder + ' boxes innerShadow';
      }
      return isPossibleMove(indicatorId) ? IndicatorType.PossibleMove : '';
    }
    return '';
  };
  if (!isDragging) {
    placeholderRef.current = 'x';
  }
  return (
    <div
      ref={ref}
      id={id}
      className="Column"
      role="DraggableBox"
      style={getStyles(left, top, isDragging, currentOne)}
    >
      <div className="header">
        <div className="title">{column.title}</div>
        <div className="rightArea">
          <div className="testBtn">
            <span className="svg-icon">
              <PlayLogo />
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
          let iid = iids[idx + 1];
          return (
            <Fragment key={tid}>
              <Step
                pid={id}
                id={tid}
                key={tid}
                index={idx}
                moveStep={moveStep}
              />
              <Indicator
                key={iid}
                id={iid}
                type={getIndicatorType(iid)}
              ></Indicator>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
export default memo(Block);
