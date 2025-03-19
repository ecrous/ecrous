import * as t from "@babel/types"
import * as tt from "../types.ts"

export function setCardinality(element: tt.elementDefinition, expression: t.Expression): t.Expression {
  const min = element.min ?? 0
  const max = parseInt(element.max ?? "")
  const hasMax = !Number.isNaN(max)
  const isArray = max > 1 || element.max == "*"
  const isOptional = min == 0

  let newExpression = expression

  if (isArray) {
    const props = t.objectExpression([])

    if (min > 1) {
      props.properties.push(
        t.objectProperty(
          t.identifier("minItems"),
          t.numericLiteral(min)
        )
      )
    }

    if (hasMax) {
      props.properties.push(
        t.objectProperty(
          t.identifier("maxItems"),
          t.numericLiteral(max)
        )
      )
    }

    newExpression = t.callExpression(
      t.memberExpression(
        t.memberExpression(
          t.identifier("t"),
          t.identifier("Type")
        ),
        t.identifier("Array")
      ),
      [
        newExpression,
      ]
    )

    if (props.properties.length) {
      newExpression.arguments.push(props)
    }
  }

  if (isOptional) {
    newExpression = t.callExpression(
      t.memberExpression(
        t.memberExpression(
          t.identifier("t"),
          t.identifier("Type")
        ),
        t.identifier("Optional")
      ),
      [
        newExpression,
      ]
    )
  }

  return newExpression
}
