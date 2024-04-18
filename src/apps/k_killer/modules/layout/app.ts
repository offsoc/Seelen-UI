import { clone } from 'lodash';

import { HWND } from '../shared/utils/domain';
import {
  BranchNode,
  FallbackNode,
  Layout,
  LeafNode,
  Node,
  NodeSubtype,
  NodeType,
  Reservation,
  Sizing,
  StackNode,
} from './domain';

export function removeHandleFromLayout(layout: Layout, handle: number): void {
  let floatingIndex = layout.floating.indexOf(handle);
  if (floatingIndex !== -1) {
    layout.floating.splice(floatingIndex, 1);
    return;
  }
  if (NodeImpl.from(layout.structure).removeHandle(handle)) {
    reIndexContainer(layout.structure);
  }
}

function clearContainer(container: Node): number[] {
  const deleted: number[] = [];
  switch (container.type) {
    case NodeType.Fallback:
      deleted.push(...container.handles);
      container.handles = [];
      container.active = null;
      break;

    case NodeType.Leaf:
      if (container.handle) {
        deleted.push(container.handle);
        container.handle = null;
      }
      break;

    case NodeType.Horizontal:
    case NodeType.Vertical:
      const sortedByPriority = [...container.children].sort((a, b) => a.priority - b.priority);
      for (const child of sortedByPriority) {
        deleted.push(...clearContainer(child));
      }
      break;

    default:
      console.error('Unknown container type');
  }
  return deleted;
}

function reIndexContainer(container: Node): void {
  const handlesToRestore: number[] = clearContainer(container);
  handlesToRestore.forEach((handle) => NodeImpl.from(container).addHandle(handle));
}

export class NodeImpl<T extends Node> {
  private readonly ref: T;

  private constructor(node: T) {
    this.ref = node;
  }

  static from<T extends Node>(node: T): NodeImpl<T> {
    return new NodeImpl(node);
  }

  /**
   * @param handle the handle of the node
   * @param insertAfter the priority of the node to insert after
   * @returns a new leaf node
   */
  static newLeaf(handle: HWND | null, insertAfter: number = 0): LeafNode {
    return {
      type: NodeType.Leaf,
      subtype: NodeSubtype.Temporal,
      priority: insertAfter + 1,
      growFactor: 1,
      handle,
    };
  }

  get inner(): T {
    return this.ref;
  }

  clone_ref(): T {
    return clone(this.ref);
  }

  private unreachable(): never {
    console.error(`Node type ${this.ref.type} is not implemented`);
    throw new Error();
  }

  isLeaf(): this is NodeImpl<LeafNode> {
    return this.ref.type === NodeType.Leaf;
  }

  isFallback(): this is NodeImpl<FallbackNode> {
    return this.ref.type === NodeType.Fallback;
  }

  isStack(): this is NodeImpl<StackNode> {
    return this.ref.type === NodeType.Stack;
  }

  isBranch(): this is NodeImpl<BranchNode> {
    return this.ref.type === NodeType.Horizontal || this.ref.type === NodeType.Vertical;
  }

  isTemporal(): this is NodeImpl<T & { subtype: NodeSubtype.Temporal }> {
    return this.ref.subtype === NodeSubtype.Temporal;
  }

  isEmpty(): boolean {
    if (this.isLeaf()) {
      return !this.ref.handle;
    }

    if (this.isFallback()) {
      return this.ref.handles.length === 0;
    }

    if (this.isBranch()) {
      return this.ref.children.every((node) => NodeImpl.from(node).isEmpty());
    }

    this.unreachable();
  }

  isFull(): boolean {
    if (this.isLeaf()) {
      return !!this.ref.handle;
    }

    if (this.isFallback()) {
      // fallback nodes can be fulled this allow infinite number of handles
      return false;
    }

    if (this.isBranch()) {
      return this.ref.children.every((node) => NodeImpl.from(node).isFull());
    }

    this.unreachable();
  }

  addHandle(handle: number): boolean {
    if (this.isLeaf()) {
      this.ref.handle = handle;
      return true;
    }

    if (this.isFallback()) {
      this.ref.handles.push(handle);
      this.ref.active = handle;
      return true;
    }

    if (this.isBranch()) {
      const sortedByPriority = [...this.ref.children].sort((a, b) => a.priority - b.priority);
      for (const child of sortedByPriority) {
        const node = NodeImpl.from(child);
        if (!node.isFull() && node.addHandle(handle)) {
          return true;
        }
      }
      return false;
    }

    this.unreachable();
  }

  removeHandle(handle: number): boolean {
    if (this.isFallback()) {
      const index = this.ref.handles.indexOf(handle);
      if (index !== -1) {
        this.ref.handles.splice(index, 1);
        if (handle === this.ref.active) {
          this.ref.active = this.ref.handles[0] || null;
        }
        return true;
      }
      return false;
    }

    if (this.isLeaf() && this.ref.handle === handle) {
      this.ref.handle = null;
      return true;
    }

    if (this.isBranch()) {
      for (let index = 0; index < this.ref.children.length; index++) {
        const child = NodeImpl.from(this.ref.children[index]!);
        if (child.removeHandle(handle)) {
          if (child.isTemporal() && child.isEmpty() && (child.isLeaf() || child.isStack())) {
            this.ref.children.splice(index, 1);
          }
          return true;
        }
      }
    }

    return false;
  }

  mutateToStacked(): NodeImpl<FallbackNode> {
    if (this.isLeaf()) {
      let ref = this.ref as any;
      ref.type = NodeType.Fallback;
      ref.subtype = NodeSubtype.Temporal;
      ref.handles = [];
      ref.active = null;

      if (this.ref.handle) {
        ref.handles.push(this.ref.handle);
        ref.active = this.ref.handle;
      }

      delete ref.handle;
    }

    if (this.isBranch()) {
      throw new Error('Cannot mutate branch to stacked');
    }

    return this as NodeImpl<FallbackNode>;
  }

  mutateToBranch(type: NodeType.Horizontal | NodeType.Vertical): NodeImpl<BranchNode> {
    if (this.isBranch()) {
      throw new Error('Cannot mutate branch to branch');
    }

    let copy = this.clone_ref();
    let ref = this.ref as any;
    ref.type = type;
    ref.subtype = NodeSubtype.Temporal;
    ref.children = [copy];

    delete ref.handle;
    // TODO(eythan) check priorities for stacked
    delete ref.handles;
    delete ref.active;

    return this as NodeImpl<BranchNode>;
  }

  concreteReservation(hwnd: HWND, reservation: Reservation, activeHandle: number): boolean {
    console.trace(`Reserving ${reservation} for ${hwnd} on ${activeHandle}`);

    const found = this.getNodeContaining(activeHandle);
    if (!found) {
      console.error('Could not find node containing handle', activeHandle);
      return false;
    }

    const node = NodeImpl.from(found);

    switch (reservation) {
      case Reservation.Stack: {
        if (node.isFallback()) {
          node.ref.handles.push(hwnd);
        }
        if (node.isLeaf()) {
          const mutated = node.mutateToStacked();
          mutated.ref.handles.push(hwnd);
        }
        return true;
      }
      case Reservation.Left: {
        const mutated = node.mutateToBranch(NodeType.Horizontal);
        mutated.ref.children.unshift(NodeImpl.newLeaf(hwnd, mutated.ref.children[0]!.priority));
        return true;
      }
      case Reservation.Right: {
        const mutated = node.mutateToBranch(NodeType.Horizontal);
        mutated.ref.children.push(NodeImpl.newLeaf(hwnd, mutated.ref.children[0]!.priority));
        return true;
      }
      case Reservation.Top: {
        const mutated = node.mutateToBranch(NodeType.Vertical);
        mutated.ref.children.unshift(NodeImpl.newLeaf(hwnd, mutated.ref.children[0]!.priority));
        return true;
      }
      case Reservation.Bottom: {
        const mutated = node.mutateToBranch(NodeType.Vertical);
        mutated.ref.children.push(NodeImpl.newLeaf(hwnd, mutated.ref.children[0]!.priority));
        return true;
      }
      default:
        console.throw(`Unknown reservation ${reservation}`);
    }
  }

  getNodeContaining(searched: HWND): LeafNode | FallbackNode | null {
    if (this.isLeaf()) {
      return this.ref.handle === searched ? this.ref : null;
    }

    if (this.isFallback()) {
      return this.ref.handles.includes(searched) ? this.ref : null;
    }

    if (this.isBranch()) {
      for (const child of this.ref.children) {
        const result = NodeImpl.from(child).getNodeContaining(searched);
        if (result) {
          return result;
        }
      }
      return null;
    }

    this.unreachable();
  }

  trace(to: Node, result: Node[] = []): Node[] {
    if (this.isLeaf() && this.ref === to) {
      result.push(this.ref);
    }

    if (this.isFallback() && this.ref === to) {
      result.push(this.ref);
    }

    if (this.isBranch()) {
      for (const child of this.ref.children) {
        const traced = NodeImpl.from(child).trace(to);
        if (traced.length) {
          result.push(this.ref, ...traced);
        }
      }
    }

    return result;
  }

  resetGrowFactor() {
    this.ref.growFactor = 1;
    if (this.isBranch()) {
      for (const child of this.ref.children) {
        NodeImpl.from(child).resetGrowFactor();
      }
    }
  }

  reIndexingGrowFactor() {
    if (this.isBranch()) {
      const noEmptyChildren = this.ref.children.filter((child) => !NodeImpl.from(child).isEmpty());

      const min = noEmptyChildren.reduce((acc, child) => Math.min(acc, child.growFactor), Infinity);
      const scaleFactor = 1 / min;

      noEmptyChildren.forEach((child) => {
        child.growFactor = Number((child.growFactor * scaleFactor).toFixed(2));
      });

      for (const child of this.ref.children) {
        NodeImpl.from(child).reIndexingGrowFactor();
      }
    }
  }

  updateGrowFactor(handle: HWND, axis: 'x' | 'y', action: Sizing) {
    const result = this.getNodeContaining(handle);
    if (!result) {
      console.error('Could not find node containing handle', handle);
      return;
    }

    const trace = this.trace(result);

    const idx = trace.findLastIndex((_node) => {
      const node = NodeImpl.from(_node);
      if (!node.isBranch()) {
        return false;
      }

      if (node.ref.children.filter((child) => !NodeImpl.from(child).isEmpty()).length < 2) {
        return false;
      }

      return axis === 'x' ? node.ref.type === NodeType.Horizontal : node.ref.type === NodeType.Vertical;
    });

    if (idx === -1) {
      console.error('Can\'t resize root');
      return;
    }

    const parent = trace[idx] as BranchNode;
    const nodeToResize = trace[idx + 1]!;

    const noEmptyChildren = parent.children.filter((child) => !NodeImpl.from(child).isEmpty());

    const total = noEmptyChildren.reduce((acc, child) => acc + child.growFactor, 0);
    const delta = 0.1;

    nodeToResize.growFactor =
      action === Sizing.Increase
        ? nodeToResize.growFactor + total * delta
        : nodeToResize.growFactor - total * delta;

    this.reIndexingGrowFactor();
  }
}
