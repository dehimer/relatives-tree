import Family from '../models/family';
import { nodeCount, nodeIds } from '../utils/units';
import { flat, inAscOrder, max, min, withId, withType } from '../utils';
import { SIZE } from '../constants';
import { IConnector } from '../types';

export default (families: Family[]): IConnector[] => {
  const connectors: IConnector[] = [];

  families.filter(withType('root', 'child')).forEach(family => {
    let pX = 0;
    const mY = family.top + (family.pUnits.length ? SIZE : 0);

    if (family.pUnits.length === 1) {
      const pUnit = family.pUnits[0];
      pX = family.left + pUnit.pos + nodeCount(pUnit); // TODO

      // from parent(s) to child
      if (pUnit.nodes.every(node => !!node.children.length)) {
        const pY = family.top + 1;
        connectors.push({ points: [pX, pY, pX, mY] });
      }
    }

    const parentIds = family.pUnits
      .map(nodeIds)
      .reduce(flat, []);

    const cXs: number[] = [];

    family.cUnits.forEach(cUnit => {
      const cX = family.left + cUnit.pos + 1;

      // from child to parent(s)
      cUnit.nodes.forEach((node, index) => {
        if (node.parents.find(rel => parentIds.indexOf(rel.id) !== -1)) {
          const nX = cX + (index * 2);
          cXs.push(nX);
          connectors.push({
            points: [nX, mY, nX, mY + 1],
          });
        }
      });

      // between child and child's spouse
      if (nodeCount(cUnit) === 2) {
        connectors.push({
          points: [cX, mY + 1, cX + 2, mY + 1],
        });
      }
      else if (nodeCount(cUnit) === 1 && cUnit.nodes[0].spouses.length) {
        family.cUnits.forEach(nUnit => {
          if (nUnit.nodes.findIndex(withId(cUnit.nodes[0].spouses[0].id)) !== -1) {
            const xX = [cX, family.left + nUnit.pos + 1].sort(inAscOrder);
            connectors.push({
              points: [xX[0], mY + 1, xX[1], mY + 1],
            });
          }
        });
      }
    });

    if (cXs.length > 1) {
      // horizontal above children
      connectors.push({
        points: [min(cXs), mY, max(cXs), mY],
      });
    }
    else if (cXs.length === 1 && pX !== cXs[0]) {
      // horizontal between parent(s) and child
      connectors.push({
        points: [Math.min(pX, cXs[0]), mY, Math.max(pX, cXs[0]), mY],
      });
    }
  });

  return connectors;
};
