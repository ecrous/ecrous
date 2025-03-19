import { ElementTree } from "./types.ts"

export function treeify(elements: any[]): ElementTree {
  const root: ElementTree = {
    path: "",
    key: "",
    children: [],
    imports: [],
  }

  for (const element of elements) {
    const paths: string[] = element.path.split(".")

    paths.reduce((parent: ElementTree, key: string) => {
      let el = parent.children.find((tt) => tt.key == key)

      if (el) return el

      el = {
        path: "",
        key,
        parent,
        children: [],
        imports: [],
      }

      parent.children.push(el)

      return el
    }, root)

    const el = paths.reduce((parent: ElementTree, key: string) => parent.children.find(t => t.key == key)!, root)

    el.path = element.path
    el.value = element
  }

  return root
}
