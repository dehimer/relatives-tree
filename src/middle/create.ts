import type Store from '../store';
import { createChildUnitsFunc } from '../utils/createChildUnitsFunc';
import { createFamilyFunc } from '../children/create';
import { getSpouseNodesFunc } from '../utils/getSpouseNodesFunc';
import { setDefaultUnitShift } from '../utils/setDefaultUnitShift';
import { prop, withRelType } from '../utils';
import { newFamily } from '../utils/family';
import { unitsToNodes } from '../utils/units';
import { NODES_IN_COUPLE } from '../constants';
import { Family, FamilyType, Node, RelType } from '../types';
import { correctOverlaps } from './correctOverlaps';

export const createFamilyWithoutParents = (store: Store): readonly Family[] => {
  console.log('### createFamilyWithoutParents', store.getNextId(), store)
  const family = newFamily(store.getNextId(), FamilyType.root, true);
  console.log('### createFamilyWithoutParents.family', family)
  family.children = createChildUnitsFunc(store)(family.id, store.root);
  console.log('### createFamilyWithoutParents.family.children', family.children)
  setDefaultUnitShift(family);
  return [family];
};

const getParentIDs = (root: Node, type: RelType): readonly string[] =>
  root.parents.filter(withRelType(type)).map(prop('id'));

// Show: parents, my spouses, my siblings (for both parents)
// Hide: another spouses for parents, half-siblings (for both parents)
export const createDiffTypeFamilies = (store: Store): readonly Family[] => {
  const createFamily = createFamilyFunc(store);
  console.log('### createDiffTypeFamilies.createFamily', createFamily)

  const bloodFamily = createFamily(getParentIDs(store.root, RelType.blood), FamilyType.root, true);
  console.log('### createDiffTypeFamilies.bloodFamily', bloodFamily)
  const adoptedFamily = createFamily(getParentIDs(store.root, RelType.adopted));
  console.log('### createDiffTypeFamilies.adoptedFamily', adoptedFamily)

  correctOverlaps(bloodFamily, adoptedFamily);
  return [bloodFamily, adoptedFamily];
};

// Show: parents + their spouses, my siblings + half-siblings, my spouses
export const createBloodFamilies = (store: Store): readonly Family[] => {
  const createFamily = createFamilyFunc(store);
  console.log('### createBloodFamilies.createFamily', createFamily)

  const mainFamily = createFamily(store.root.parents.map(prop('id')), FamilyType.root, true);
  console.log('### createBloodFamilies.mainFamily', mainFamily)
  const parents = unitsToNodes(mainFamily.parents);
  console.log('### createBloodFamilies.parents', parents)

  if (parents.length === NODES_IN_COUPLE) {
    const { left, right } = getSpouseNodesFunc(store)(parents);
    console.log('### createBloodFamilies(left/right)',left, right)

    return [
      left.map((node) => createFamily([node.id])),
      mainFamily,
      right.map((node) => createFamily([node.id])),
    ].flat();
  }

  return [mainFamily];
};
