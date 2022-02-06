import { createSlice, createAction } from '@reduxjs/toolkit';
import { ItemTypes } from '../DnDConstants';
import { getNodeRect } from '../Utils';

export const flowSlice = createSlice({
  name: 'flow',
  initialState: {
    tasks: {
      'task-1': { id: 'task-1', content: 'Cook dinner' },
      'task-2': { id: 'task-2', content: 'Cook coffee' },
      'task-3': { id: 'task-3', content: 'Watch my favorite show' },
      'task-4': { id: 'task-4', content: 'Charge my phone' },
      'task-5': { id: 'task-5', content: 'Take out the garbage' },
      'task-6': { id: 'task-6', content: 'Your account balance is {balance}' },
      'task-7': { id: 'task-7', content: 'What else can I help you with?' },
      'task-8': { id: 'task-8', content: 'Listening for an intent...' },
    },
    columns: {
      'column-1': {
        id: 'column-1',
        x: 80,
        y: 20,
        title: 'To do',
        taskIds: ['task-1', 'task-2', 'task-3'],
      },
      'column-2': {
        id: 'column-2',
        x: 500,
        y: 290,
        title: 'Done',
        taskIds: ['task-4', 'task-5'],
      },
      'column-3': {
        id: 'column-3',
        x: 80,
        y: 500,
        title: 'Account Balance',
        taskIds: ['task-6', 'task-7'],
      },
      'column-4': {
        id: 'column-4',
        x: 880,
        y: 300,
        title: 'Plan',
        taskIds: ['task-8'],
      },
    },
    columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
    currentBlock: 'column-3',
    currentStep: '',
    shouldUpdateEdge: false,
    edges: {
      'edge-1': {
        id: 'edge-1',
        source: 'task-1',
        target: 'task-4',
        sourcePort: {},
        targetPort: {},
      },
      'edge-2': {
        id: 'edge-2',
        source: 'task-6',
        target: 'task-5',
        sourcePort: {},
        targetPort: {},
      },
      'edge-3': {
        id: 'edge-3',
        source: 'task-5',
        target: 'task-8',
        sourcePort: {},
        targetPort: {},
      },
    },
  },
  reducers: {
    setShouldUpdateEdge(state) {
      state.shouldUpdateEdge = new Date().getTime();
    },
    createBlock(state, { payload }) {
      const { block, item } = payload;
      state.columns[item.pid].taskIds.splice(item.index, 1);
      state.columns[block.id] = block;
    },
    moveBlockTo(state, { payload }) {
      const { id, left, top } = payload;
      if (!state.columns[id]) return;
      state.columns[id].x = left;
      state.columns[id].y = top;
      state.currentBlock = id;
      //trigger egdes re-render
      flowSlice.caseReducers.batchUpdateNodeRect(state, { payload: { id } });
    },
    moveStepTo(state, { payload }) {
      const { id, left, top } = payload;
      if (!state.tasks[id]) return;
      state.tasks[id]['x'] = left;
      state.tasks[id]['y'] = top;
      // state.currentStep = id;
    },
    batchUpdateNodeRect(state, { payload }) {
      state.columns[payload.id].taskIds.forEach((tid) => {
        flowSlice.caseReducers.updateNodeRect(state, {
          payload: {
            id: tid,
            rect: getNodeRect(tid),
          },
        });
      });
    },
    updateNodeRect(state, { payload }) {
      const { id, rect } = payload;
      state.tasks[id]['rect'] = rect;
    },
    moveStep(state, { payload }) {
      const { itemType, source, destination } = payload;
      if (itemType === ItemTypes.BLOCK) {
        flowSlice.caseReducers.mergeSteps(state, {
          payload: { source, destination },
        });
      } else {
        // droppableId is BlockId or ColumnId
        if (!destination || !source) return;
        if (
          source.droppableId === destination.droppableId &&
          source.index === destination.index
        )
          return;

        const sTaskIds = state.columns[source.droppableId].taskIds;
        const dTaskIds = state.columns[destination.droppableId].taskIds;

        const movingId = sTaskIds.splice(source.index, 1)[0];
        dTaskIds.splice(destination.index, 0, movingId);
        //removeAtIndex(sTaskIds, source.index);
        //insertAtIndex(dTaskIds, destination.index, movingId);
        //如果source block中没有剩余step，则删除此空block
        if (sTaskIds.length === 0) {
          delete state.columns[source.droppableId];
        }
        //trigger edge re-render
        //!! not necessary, index change will trigger Step useEffect
        /* flowSlice.caseReducers.updateNodeRect(state, {
          payload: {
            id: movingId,
            rect: getNodeRect(movingId),
          },
        }); */
      }
      //flowSlice.caseReducers.setShouldUpdateEdge(state);
    },
    mergeSteps(state, { payload }) {
      const { source, destination } = payload;
      if (source.droppableId === destination.droppableId) return;

      const sTaskIds = state.columns[source.droppableId].taskIds;
      const dTaskIds = state.columns[destination.droppableId].taskIds;
      const index = destination.index;
      const ndTaskIds = dTaskIds
        .slice(0, index)
        .concat(sTaskIds, dTaskIds.slice(index));
      state.columns[destination.droppableId].taskIds = ndTaskIds;
      //删除空Block
      delete state.columns[source.droppableId];
      //trigger edges re-render
      flowSlice.caseReducers.batchUpdateNodeRect(state, {
        payload: { id: destination.droppableId },
      });
    },
  },
  /*   extraReducers: (builder) => {
    builder.addMatcher(
      ({ type }) => {
        console.log('extra startsWith ', type);
        return type.startsWith('flow/m');
      },
      (state, action) => {
        console.log('extra addDefaultCase', action);
        // flow的各种变动都触发edge连线重新渲染，TODO：此次需细化条件
        state.shouldUpdateEdge = new Date().getTime();
      }
    );
  }, */
});

export const {
  moveStep,
  mergeSteps,
  moveStepTo,
  updateNodeRect,
  batchUpdateNodeRect,
  moveBlockTo,
  createBlock,
  setShouldUpdateEdge,
} = flowSlice.actions;
export default flowSlice.reducer;
