import { NODES_IN_COUPLE } from '../constants';
import { RelType } from '../types';
import { byGender, relToNode, withRelType } from './index';
const inDescOrderOfChildCount = (a, b) => b.children.length - a.children.length;
const getSpouse = (store, spouses) => {
    const toNode = relToNode(store);
    const married = spouses.find(withRelType(RelType.married));
    if (married)
        return toNode(married);
    if (spouses.length >= 1)
        return spouses.map(toNode).sort(inDescOrderOfChildCount)[0];
    return;
};
const getCoupleNodes = (store, target) => {
    return [target, getSpouse(store, target.spouses)]
        .filter((node) => Boolean(node))
        .sort(byGender(store.root.gender));
};
const excludeRel = (target) => (rel) => rel.id !== target.id;
export const getSpouseNodesFunc = (store) => {
    const toNode = relToNode(store);
    return (parents) => {
        console.log('### getSpouseNodesFunc.parents', parents);
        let middle = parents;
        console.log('### getSpouseNodesFunc.parents', parents);
        if (middle.length !== NODES_IN_COUPLE) {
            console.log('### getSpouseNodesFunc !== NODES_IN_COUPLE');
            middle = getCoupleNodes(store, middle[0]);
            console.log('### getSpouseNodesFunc.middle', middle);
        }
        ;
        const result = { left: [], middle: middle.toSorted(({ id: b }, { id: a }) => (isNaN(parseInt(a)) ? 0 : parseInt(a)) - (isNaN(parseInt(b)) ? 0 : parseInt(b))), right: [] };
        if (middle.length === NODES_IN_COUPLE) {
            const [first, second] = middle;
            result.left = first.spouses.filter(excludeRel(second)).map(toNode);
            result.right = second.spouses.filter(excludeRel(first)).map(toNode);
        }
        return result;
    };
};
