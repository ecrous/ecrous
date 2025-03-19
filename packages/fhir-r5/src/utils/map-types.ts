import * as t from "@babel/types"
import * as tt from "../types.ts"

export function mapTypes(elementTypes: tt.elementDefinition["type"]): [string, t.Expression][] {
  if (!elementTypes || elementTypes.length == 0) {
    return [["", t.identifier("")]]
  }

  const expressions: [string, t.Expression][] = []

  for (const type of elementTypes) {
    switch (type.code) {
      case "http://hl7.org/fhirpath/System.Integer":
      case "http://hl7.org/fhirpath/System.Boolean":
      case "http://hl7.org/fhirpath/System.Time":
      case "http://hl7.org/fhirpath/System.DateTime":
      case "http://hl7.org/fhirpath/System.Date":
      case "http://hl7.org/fhirpath/System.Decimal":
      case "http://hl7.org/fhirpath/System.String": {
        expressions.push([
          "",
          t.callExpression(
            t.memberExpression(
              t.memberExpression(
                t.identifier("t"),
                t.identifier("Type"),
              ),
              t.identifier("String"),
            ),
            []
          )
        ])
        break
      }
      default: {
        if (type.code.startsWith("http")) {
          throw new Error("all http cases should be handled: " + type.code)
        }

        expressions.push([
          type.code,
          t.callExpression(
            t.memberExpression(
              t.memberExpression(
                t.identifier("t"),
                t.identifier("Type"),
              ),
              t.identifier("Ref"),
            ),
            [
              t.stringLiteral(type.code)
            ]
          )
        ])
        break
      }
    }
  }

  return expressions
}
