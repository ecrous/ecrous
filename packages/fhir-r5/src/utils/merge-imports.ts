import * as t from "@babel/types"
import { Import } from "./types.ts"

export function mergeImports(imports: Import[]): t.ImportDeclaration[] {
  const declarations1 = imports.reduce((obj, imports) => Object.assign(obj, {
    [imports.from]: {
      named: Array.from(
        new Set([
          ...(obj[imports.from]?.named ?? []),
          imports.name,
        ])
      )
    }
  }), {} as Record<string, { named: string[] }>)

  const declarations2 = Object.entries(declarations1).map(([key, value]) => t.importDeclaration(
    [
      ...value.named.map((name) => t.importSpecifier(t.identifier(name), t.identifier(name)))
    ],
    t.stringLiteral(key),
  ))

  return declarations2
}
