import * as t from "@babel/types"
import { ElementTree } from "./types.ts"
import { mapTypes } from "./map-types.ts"
import { setCardinality } from "./set-cardinality.ts"

export function makeAst(node: ElementTree, _: ElementTree): t.Expression {
  const element = node.value
  if (!element) return t.identifier("")

  const typeExpressions0 = mapTypes(element.type)

  const isRoot = node.path == node.key

  let typeExpressions = typeExpressions0

  if (!isRoot) {
    typeExpressions = typeExpressions0.map(([code, expression]) => [code, setCardinality(element, expression)])
  }

  // imports.push(...typeImports)

  if (node.children.length == 0) {
    if (typeExpressions.length == 0) {
      return t.identifier("undefined")
    }

    const [, typeExpression] = typeExpressions[0]

    return typeExpression
  }

  const entries = t.objectExpression(
    node.children.map((tree) => (
      t.objectProperty(
        t.stringLiteral(tree.key),
        tree.expression!,
      )
    ))
  )

  const [typeCode, typeExpression] = typeExpressions[0]

  let expression: t.Expression

  if (typeCode == "") {
    expression = t.callExpression(
      t.memberExpression(
        t.memberExpression(
          t.identifier("t"),
          t.identifier("Type"),
        ),
        t.identifier("Object"),
      ),
      [entries],
    )

  } else {
    expression = t.callExpression(
      t.memberExpression(
        typeExpression,
        t.identifier("extend"),
      ),
      [entries],
    )
  }

  return expression
}
