import fs from "node:fs"
import path from "node:path"
import * as t from "@babel/types"
import generate from "@babel/generator"
import * as tt from "../types.ts"
import * as p from "../paths.ts"
import * as u from "../utils/index.ts"

export function makeResourcesSchemes(files: tt.index["files"]) {
  const importTypebox = t.importDeclaration(
    [
      t.importNamespaceSpecifier(t.identifier("t"))
    ],
    t.stringLiteral("@sinclair/typebox")
  )

  const moduleObject = t.objectExpression([])

  const moduleExport = t.exportNamedDeclaration(
    t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier("Module"),
        t.callExpression(
          t.memberExpression(
            t.memberExpression(
              t.identifier("t"),
              t.identifier("Type"),
            ),
            t.identifier("Module")
          ),
          [moduleObject]
        )
      )
    ]),
    []
  )

  const moduleProgram = t.program([
    importTypebox,
  ], [], "module")
  const schemesIndexProgram = t.program([], [], "module")

  for (const file of files) {
    if (file.type != file.id) continue
    const structureDefinition = tt.structureDefinitionSchema.parse(
      u.readJson(path.resolve(p.fhirCoreRootPath, file.filename))
    )

    if (!structureDefinition.snapshot) {
      continue
    }

    const tree = u.treeify(structureDefinition.snapshot.element)

    const root = tree.children[0]

    u.treeTraverse(root, (node) => node.expression = u.makeAst(node, root))

    const schema = t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier(root.key),
        root.expression,
      )
    ])

    const exportSchema = t.exportNamedDeclaration(
      schema,
      []
    )

    const body = [
      importTypebox,
      exportSchema,
    ]

    const program = t.program(body, [], "module")
    const code = generate.default(program).code
    fs.writeFileSync(path.resolve(p.outResourcesSchemesPath, `${root.key}.ts`), code)

    schemesIndexProgram.body.push(
      t.exportNamedDeclaration(
        null,
        [
          t.exportSpecifier(
            t.identifier(root.key),
            t.identifier(root.key),
          )
        ],
        t.stringLiteral(`./${root.key}.ts`)
      )
    )

    moduleProgram.body.push(
      t.importDeclaration(
        [
          t.importSpecifier(t.identifier(root.key), t.identifier(root.key))
        ],
        t.stringLiteral(`./${root.key}.ts`)
      )
    )

    moduleObject.properties.push(
      t.objectProperty(
        t.identifier(root.key),
        t.identifier(root.key),
        undefined,
        true,
      )
    )

    // break
  }

  moduleProgram.body.push(moduleExport)

  const moduleCode = generate.default(moduleProgram).code
  fs.writeFileSync(path.resolve(p.outResourcesSchemesPath, "index.ts"), moduleCode)
}
