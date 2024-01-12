import { getSpouseNodesFunc } from './getSpouseNodesFunc';
import { newUnit } from './units';
const toArray = (nodes) => nodes.map((node) => Array.of(node));
export const createChildUnitsFunc = (store) => {
    const getSpouseNodes = getSpouseNodesFunc(store);
    return (familyId, child) => {
        const { left, middle, right } = getSpouseNodes([child]);
        console.log('### createChildUnitsFunc.getSpouseNodes', { left, middle, right });
        return [...toArray(left), middle, ...toArray(right)].map((nodes) => newUnit(familyId, nodes, true));
    };
};
