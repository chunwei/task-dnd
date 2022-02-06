import { useSelector, shallowEqual } from 'react-redux';
import './Edges.css';

function getPatchPath(start, end) {
  const path = [
    'M',
    { x: start.x - 38, y: start.y },
    'L',
    start,
    // 'M',
    // end,
    // 'L',
    // { x: end.x + 16, y: end.y },
  ];
  const d = path
    .map((p) => ('string' === typeof p ? p : p.x + ',' + p.y))
    .join(' ');
  //d like `M 70,40 L100,40`
  return d;
}
function getPath(start, end, dir = 'h') {
  //微调:给箭头留位置
  const ex = end.x - 10;
  const ey = end.y;
  const c1 = {},
    c2 = {};
  const dx = Math.max(30, Math.min(200, Math.abs(ex - start.x)));
  const dy = Math.max(30, Math.min(200, Math.abs(ey - start.y)));

  if (dir === 'h') {
    c1.x = start.x + dx;
    c1.y = start.y;
    c2.x = ex - dx;
    c2.y = ey;
  } else {
    c1.y = start.y + dy;
    c1.x = start.x;
    c2.y = ey - dy;
    c2.x = ex;
  }
  const path = [
    'M',
    { x: start.x - 20, y: start.y },
    'L',
    start,
    'C',
    c1,
    c2,
    { x: ex, y: ey },
    'L',
    { x: ex + 10, y: ey },
    ,
  ];
  const d = path
    .map((p) => ('string' === typeof p ? p : p.x + ',' + p.y))
    .join(' ');
  //d like `M 70,40 C220,40 220,160 430,160`
  return d;
}

const Edge = ({ id }) => {
  const edge = useSelector((state) => state.flow.edges[id]);
  const { source, target } = edge || {};
  const sourceStep = useSelector((state) => state.flow.tasks[source]);
  const targetStep = useSelector((state) => state.flow.tasks[target]);
  if (
    !!!sourceStep ||
    !!!targetStep ||
    !!!sourceStep.rect ||
    !!!targetStep.rect
  )
    return null;
  //console.log('egde render ', id, sourceStep.rect.out, targetStep.rect.in);
  const d = getPath(sourceStep.rect.out, targetStep.rect.in);
  return <path fill="none" d={d} markerEnd="url(#marker)"></path>;
};
const EdgePatch = ({ id }) => {
  const edge = useSelector((state) => state.flow.edges[id]);
  const { source, target } = edge || {};
  const sourceStep = useSelector((state) => state.flow.tasks[source]);
  const targetStep = useSelector((state) => state.flow.tasks[target]);
  if (
    !!!sourceStep ||
    !!!targetStep ||
    !!!sourceStep.rect ||
    !!!targetStep.rect
  )
    return null;
  const d = getPatchPath(sourceStep.rect.out, targetStep.rect.in);
  return <path fill="none" d={d}></path>;
};
const Edges = () => {
  //console.log('edges');
  const edges = useSelector(
    (state) => Object.keys(state.flow.edges),
    shallowEqual
  );
  return (
    <div>
      <svg className="edgesvg">
        <defs>
          <marker
            id="marker"
            overflow="visible"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              stroke="rgba(98, 119, 140,0.8)"
              fill="rgba(98, 119, 140,0.8)"
              transform="rotate(180)"
              d="M 0 0 L 8 -3 L 8 3 Z"
            ></path>
          </marker>
        </defs>
        {edges.map((edgeid) => (
          <Edge key={edgeid} id={edgeid}></Edge>
        ))}
      </svg>
      <svg className="edgesvg patch">
        {edges.map((edgeid) => (
          <EdgePatch key={edgeid} id={edgeid}></EdgePatch>
        ))}
      </svg>
    </div>
  );
};

export default Edges;
