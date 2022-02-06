import { useDispatch, useSelector, shallowEqual } from 'react-redux';

const C = () => {
  const state = useSelector(
    (state) => Object.keys(state.flow.columns),
    shallowEqual
  );
  const cs = Object.keys(state);
  console.log('C render');
  return <div>{JSON.stringify(state)}</div>;
};

export default C;
