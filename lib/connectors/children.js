import { getParentsX, withType } from '../utils/family';
import { getUnitX, nodeCount, nodeIds } from '../utils/units';
import { inAscOrder, max, min, withId, withIds } from '../utils';
import { HALF_SIZE, NODES_IN_COUPLE, SIZE } from '../constants';
import { FamilyType } from '../types';
export const children = (families) => families.filter(withType(FamilyType.root, FamilyType.child)).reduce((connectors, family) => {
    var _a, _b, _c;
    const parent = family.parents[0];
    const pX = getParentsX(family, parent);
    const mY = family.Y + (parent ? SIZE : 0);
    if (parent && parent.nodes.every((node) => !!node.children.length)) {
        const pY = family.Y + HALF_SIZE;
        connectors.push([pX, pY, pX, mY, { type: 'children1', nodes: parent.nodes }]);
    }
    const parentIds = family.parents.map(nodeIds).flat();
    const positions = [];
    family.children.forEach((unit) => {
        const left = getUnitX(family, unit) + HALF_SIZE;
        unit.nodes.forEach((node, index) => {
            if (node.parents.some(withIds(parentIds))) {
                const nX = left + index * SIZE;
                positions.push({ x: nX, node });
                connectors.push([nX, mY, nX, mY + HALF_SIZE, { type: 'children2', node }]);
            }
        });
        if (nodeCount(unit) === NODES_IN_COUPLE) {
            connectors.push([left, mY + HALF_SIZE, left + SIZE, mY + HALF_SIZE, { type: 'children3' }]);
        }
        else if (nodeCount(unit) === 1 && unit.nodes[0].spouses.length) {
            family.children.forEach((nUnit) => {
                if (nUnit.nodes.some(withId(unit.nodes[0].spouses[0].id))) {
                    const xX = [left, getUnitX(family, nUnit) + HALF_SIZE].sort(inAscOrder);
                    connectors.push([xX[0], mY + HALF_SIZE, xX[1], mY + HALF_SIZE, { type: 'children4' }]);
                }
            });
        }
    });
    if (positions.length > 1) {
        const minPosition = min(positions.map(({ x }) => x));
        const maxPosition = max(positions.map(({ x }) => x));
        connectors.push([minPosition, mY, maxPosition, mY, { type: 'children5', nodes: parent.nodes }]);
        positions.forEach((_position, index) => {
            if (index !== 0) {
                const positionA = positions[index - 1];
                const positionB = positions[index];
                connectors.push([positionA.x, mY, positionB.x, mY, { type: 'children55', nodes: [positionA.node, positionB.node] }]);
            }
        });
    }
    else if (positions.length === 1 && pX !== ((_a = positions[0]) === null || _a === void 0 ? void 0 : _a.x)) {
        connectors.push([Math.min(pX, (_b = positions[0]) === null || _b === void 0 ? void 0 : _b.x), mY, Math.max(pX, (_c = positions[0]) === null || _c === void 0 ? void 0 : _c.x), mY, { type: 'children6', nodes: parent.nodes }]);
    }
    return connectors;
}, []);
