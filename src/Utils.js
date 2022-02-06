export function getNodeRect(nodeId) {
  const rect = document.getElementById(nodeId).getBoundingClientRect();
  const nodeRect = {
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
    x: rect.x,
    y: rect.y,
  };
  nodeRect.in = { x: rect.left - 16, y: rect.top + rect.height / 2 };
  nodeRect.out = { x: rect.right + 16, y: rect.top + rect.height / 2 };
  //console.log('step nodeRect ', nodeId, nodeRect);
  return nodeRect;
}
