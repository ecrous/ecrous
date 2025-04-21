import fs from "node:fs"
import path from "node:path"
import * as tt from "../types.ts"
import * as p from "../paths.ts"
import * as u from "../utils/index.ts"
import * as t from "@babel/types"
import generate from "@babel/generator"
import { parse } from "@babel/parser"

export function makeResourcesSchemesTests(files: tt.index["files"]) {
  for (const file of files) {
    console.log(file)
    const example = u.readJson(path.resolve(p.fhirCoreRootPath, file.filename))
    console.log(example)

    const importTypebox = t.importDeclaration(
      [
        t.importSpecifier(t.identifier("Value"), t.identifier("Value"))
      ],
      t.stringLiteral("@sinclair/typebox/value")
    )

    const importModule = t.importDeclaration(
      [
        t.importSpecifier(t.identifier("Module"), t.identifier("Module"))
      ],
      t.stringLiteral(`../${p.outResourcesSchemesPath.split("/").at(-1)}/index.ts`)
    )

    const exampleObject = parse(`
      const example = ${JSON.stringify(example)}
      
      test("${file.id}", () => {
        expect(Value.Assert(Module.Import("${file.resourceType}"), example)).toBe(true)
      })
    `)


    const program = t.program([
      importTypebox,
      importModule,
      ...exampleObject.program.body,
    ], [], "module")

    const code = generate.default(program).code
    fs.writeFileSync(path.resolve(p.outResourcesSchemesTestsPath, `${file.id}.test.ts`), code)

    break
  }
}
