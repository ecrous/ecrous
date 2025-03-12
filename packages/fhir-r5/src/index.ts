import fs from "node:fs"
import path from "node:path"
import * as t from "@babel/types"
import generate from "@babel/generator"
import * as p from "./paths.ts"
import * as u from "./utils.ts"
import * as tt from "./types.ts"

// u.cleanUp()
fs.rmSync(p.outPath, { recursive: true })

fs.mkdirSync(p.assetsPath, { recursive: true })
fs.mkdirSync(p.fhirPath, { recursive: true })
fs.mkdirSync(p.outPath, { recursive: true })

if (!fs.existsSync(p.fhirTgzPath)) u.downloadFhirTgz()
if (!fs.existsSync(p.fhirIndexPath)) u.unpackFhirTgz()

const index = tt.indexSchema.parse(u.readJson(p.fhirIndexPath))
const structureDefinitions = index.files.filter((f) => f.resourceType == "StructureDefinition")

for (const fileDescription of structureDefinitions) {
  const structureDefinition = tt.structureDefinitionSchema.parse(
    u.readJson(path.resolve(p.fhirRootPath, fileDescription.filename))
  )

  if (!structureDefinition.snapshot) {
    continue
  }

  const tree = u.treeify(structureDefinition.snapshot.element)
  let imports: u.Import[] = [
    { type: "named", name: "z", from: "zod"}
  ]

  const root = tree.children[0]

  u.treeTraverse(tree, (node) => {
    const element = node.value
    if (!element) return

    const [typeExpression, typeImports] = u.mapTypesToZod(element.type)
    imports.push(...typeImports)

    if (node.children.length == 0) {
      let expression = u.setCardinality(element, typeExpression)

      if (typeExpression.type == "Identifier" && typeExpression.name == root.key) {
        expression = t.callExpression(
          t.memberExpression(
            t.identifier("z"),
            t.identifier("lazy"),
          ),
          [
            t.arrowFunctionExpression(
              [],
              expression
            )
          ]
        )
      }

      node.expression = expression

      return
    }

    const entries = t.objectExpression(
      node.children.map((tree) => (
        t.objectProperty(
          t.stringLiteral(tree.key),
          tree.expression!,
        )
      ))
    )

    if (typeExpression.type != "Identifier") {
      return
    }

    let expression: t.Expression

    if (typeExpression.name == "") {
      expression = t.callExpression(
        t.memberExpression(
          t.identifier("z"),
          t.identifier("object"),
        ),
        [entries],
      )

      imports.push({ type: "named", name: "z", from: "zod"})
    } else {
      expression = t.callExpression(
        t.memberExpression(
          typeExpression,
          t.identifier("extend"),
        ),
        [entries],
      )
    }

    const isRoot = node.path == node.key

    if (isRoot) {
      imports = imports.filter((i) => i.name != node.key)
    } else {
      expression = u.setCardinality(element, expression)
    }

    node.expression = expression
  })

  const constants = tree.children.map((node) => t.exportNamedDeclaration(
    t.variableDeclaration("const", [
      t.variableDeclarator(t.identifier(node.key), node.expression)
    ])
  ))

  const importDeclarations = u.mergeImports(imports)

  const body = [
    ...importDeclarations,
    ...constants,
  ]

  const program = t.program(body, [], "module")

  const code = generate.default(program).code

  fs.writeFileSync(path.resolve(p.outPath, `${tree.children[0].key}.ts`), code)

  // break
}
