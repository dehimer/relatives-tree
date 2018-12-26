import Family from '../models/family';
import Unit from '../models/unit';

const shiftUnits = (units: Unit[], shift: number): void => {
  units.forEach((unit) => {
    unit.shift = shift;
    shift += unit.size * 2;
  });
};

export default (family: Family): void => {
  const diff = family.cCount - family.pCount;
  shiftUnits(family.pUnits, diff > 0 ? Math.abs(diff) : 0);
  shiftUnits(family.cUnits, diff < 0 ? Math.abs(diff) : 0);
};
