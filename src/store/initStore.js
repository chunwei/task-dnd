const initData = {
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
      x: 20,
      y: 20,
      title: 'To do',
      taskIds: ['task-1', 'task-2', 'task-3'],
    },
    'column-2': {
      id: 'column-2',
      x: 200,
      y: 290,
      title: 'Done',
      taskIds: ['task-4', 'task-5'],
    },
    'column-3': {
      id: 'column-3',
      x: 20,
      y: 500,
      title: 'Account Balance',
      taskIds: ['task-6', 'task-7', 'task-8'],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};
export default initData;
