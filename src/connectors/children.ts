import { getParentsX, withType } from '../utils/family';
import { getUnitX, nodeCount, nodeIds } from '../utils/units';
import { inAscOrder, max, min, withId, withIds } from '../utils';
import { HALF_SIZE, NODES_IN_COUPLE, SIZE } from '../constants';
import { Connector, Family, FamilyType, Node, Unit } from '../types';

export const children = (families: readonly Family[]): readonly Connector[] =>
  families.filter(withType(FamilyType.root, FamilyType.child)).reduce<Connector[]>((connectors, family) => {
    const parent: Unit | undefined = family.parents[0]!;

    const pX = getParentsX(family, parent);
    const mY = family.Y + (parent ? SIZE : 0);

    // from parent(s) to child
    if (parent && parent.nodes.every((node) => !!node.children.length)) {
      const pY = family.Y + HALF_SIZE;
      connectors.push([pX, pY, pX, mY, {type: 'children1', nodes: parent.nodes}]);
    }

    const parentIds = family.parents.map(nodeIds).flat();
    const positions: { x: number; node: Node }[] = [];

    family.children.forEach((unit) => {
      const left = getUnitX(family, unit) + HALF_SIZE;

      // from child to parent(s)
      unit.nodes.forEach((node, index) => {
        if (node.parents.some(withIds(parentIds))) {
          const nX = left + index * SIZE;
          positions.push({ x: nX, node });
          connectors.push([nX, mY, nX, mY + HALF_SIZE, { type: 'children2', node }]);
        }
      });

      // between child and child's spouse
      if (nodeCount(unit) === NODES_IN_COUPLE) {
        connectors.push([left, mY + HALF_SIZE, left + SIZE, mY + HALF_SIZE, { type: 'children3' }]);
      }

      // between child and child's side spouse
      else if (nodeCount(unit) === 1 && unit.nodes[0]!.spouses.length) {
        family.children.forEach((nUnit) => {
          if (nUnit.nodes.some(withId(unit.nodes[0]!.spouses[0]!.id))) {
            const xX = [left, getUnitX(family, nUnit) + HALF_SIZE].sort(inAscOrder);
            connectors.push([xX[0]!, mY + HALF_SIZE, xX[1]!, mY + HALF_SIZE, {type: 'children4'}]);
          }
        });
      }
    });

    // horizontal above children
    if (positions.length > 1) {
      const minPosition = min(positions.map(({ x }) => x))
      const maxPosition = max(positions.map(({ x }) => x))

      connectors.push([minPosition, mY, maxPosition, mY, {type: 'children5', nodes: parent.nodes}]);

      // positions.forEach((_position, index) => {
      //   // console.log('### position', position)
      //   if (index !== 0) {
      //     const positionA = positions[index - 1]
      //     const positionB = positions[index]
      //     connectors.push([positionA!.x, mY, positionB!.x, mY, {type: 'children55', nodes: [positionA!.node, positionB!.node]}]);
      //   }
      // })
      positions.forEach((position) => {
        // console.log('### position', position)
        const minPosition = min([position.x, pX])
        const maxPosition = max([position.x, pX])

        connectors.push([minPosition, mY, maxPosition, mY, {type: 'children55', node: position.node}]);
      })
    // horizontal between parent(s) and child
    } else if (positions.length === 1 && pX !== positions[0]?.x) {
      connectors.push([Math.min(pX, positions[0]?.x!), mY, Math.max(pX, positions[0]?.x!), mY, {type: 'children6', nodes: parent.nodes}]);
    }

    return connectors;
  }, []);
