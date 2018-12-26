import { IFamilyNode } from '../types';

class Unit {

  familyId: number;
  nodes: IFamilyNode[];
  shift: number;

  constructor(familyId: number, nodes: IFamilyNode[]) {
    this.familyId = familyId;
    this.nodes = nodes;
    this.shift = 0;
  }

  get size(): number {
    return this.nodes.length;
  }

  get ids(): string[] {
    return this.nodes.map(node => node.id);
  }

  // TODO
  isSame(unit: Unit): boolean {
    return this.ids.join('') === unit.ids.join('')
  }

}

export default Unit;
