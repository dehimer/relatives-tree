import type Store from '../store';
import { nodeIds } from '../utils/units';
import type { Family, Unit } from '../types';
import { createFamilyFunc } from './create';
import { updateFamilyFunc } from './update';
import { arrangeFamiliesFunc } from './arrange';

const getParentUnitsWithParents = (family: Family): Unit[] =>
  family.parents.filter((unit) => unit.nodes.some((node) => !!node.parents.length));

export const inParentDirection = (store: Store): Store => {
  const createFamily = createFamilyFunc(store);
  const updateFamily = updateFamilyFunc(store);
  const arrangeFamily = arrangeFamiliesFunc(store);


  console.log('### inParentDirection.store.rootFamily', store.rootFamily)
  let stack = getParentUnitsWithParents(store.rootFamily);
  console.log('### inParentDirection.stack', stack)

  while (stack.length) {
    const childUnit = stack.pop()!;
    console.log('### inParentDirection.childUnit', childUnit)
    const family = createFamily(nodeIds(childUnit));
    console.log('### inParentDirection.family', family)

    updateFamily(family, childUnit);
    arrangeFamily(family);

    store.families.set(family.id, family);
    stack = stack.concat(getParentUnitsWithParents(family).reverse());
  }
  console.log('### inParentDirection', store)

  return store;
};
