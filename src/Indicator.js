import './Column.css';
export const IndicatorType = {
  Indicator: 'Indicator',
  IllegalMoveHover: 'Illegal',
  LegalMoveHover: 'Legal',
  PossibleMove: 'Possible',
  Placeholder: 'Placeholder',
};
export const Indicator = ({ type, id }) => {
  //const color = getIndicatorColor(type);
  return (
    <div id={id} className={'Indicator ' + type}>
      {/* <div className='inset'></div> */}
    </div>
  );
};
function getIndicatorColor(type) {
  switch (type) {
    case IndicatorType.IllegalMoveHover:
      return 'red';
    case IndicatorType.LegalMoveHover:
      return 'green';
    case IndicatorType.PossibleMove:
      return 'rgb(60, 105, 151)';
  }
}
