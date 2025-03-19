import * as t from "@babel/types"
import * as tt from "../types.ts"

export type Result = {
  fileName: string,
  path: string,
  content: string,
}

export type Import = { type: "named", name: string, from: string }

export interface ElementTree {
  path: string,
  key: string,
  value?: tt.elementDefinition,
  expression?: t.Expression,
  parent?: ElementTree,
  children: ElementTree[],
  imports: Import[],
}
