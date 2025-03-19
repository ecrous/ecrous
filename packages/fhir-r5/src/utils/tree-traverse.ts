import { ElementTree } from "./types.ts"

export function treeTraverse(tree: ElementTree, action: (tree: ElementTree) => void) {
  if (!tree.children.length) return action(tree)
  tree.children.forEach((tree) => treeTraverse(tree, action))
  return action(tree)
}
