import fs from "node:fs"
import path from "node:path"
import stream from "node:stream"
import { extract } from "tar-fs"
import { createGunzip } from "node:zlib"
import * as t from "@babel/types"
import * as p from "./paths.ts"
import * as tt from "./types.ts"

export function cleanUp() {
  fs.rmSync(p.assetsPath, { recursive: true, force: true })
}

export async function downloadFhirTgz() {
  const response = await fetch(p.fhirTgzUrl);
  if (!response.body) throw new Error("body is empty")

  stream.Readable
    .fromWeb(response.body)
    .pipe(fs.createWriteStream(p.fhirTgzPath));
}

export function unpackFhirTgz() {
  fs.createReadStream(p.fhirTgzPath)
    .pipe(createGunzip())
    .pipe(extract(p.fhirPath))
}

export function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath).toString())
}

type Result = {
  fileName: string,
  path: string,
  content: string,
}

export function recursiveFind(path: string, json: any, searchTerm: string): Result[] {
  if (Array.isArray(json)) {
    return json.map((value, index) => recursiveFind(path + `[${index}]`, value, searchTerm)).flat()
  }

  if (json == null || json == undefined) return []

  if (typeof json == "object") {
    return Object.entries(json).map(([key, value]) => recursiveFind(path == "" ? key : path + `.${key}`, value, searchTerm)).flat()
  }

  const value: string = json.toString()

  if (!value.includes(searchTerm)) return []

  return [{ fileName: "", path, content: value }]
}

export function recursiveFindInIndex(index: any, searchTerm: string) {
  const results: Result[] = []

  for (const { filename: fileName } of index.files) {
    const file = readJson(path.resolve(p.fhirRootPath, fileName))
    const fileResults = recursiveFind("", file, searchTerm).map((r) => ({ ...r, fileName }))
    results.push(...fileResults)
  }

  return results
}

export function mapTypesToZod(elementTypes: tt.elementDefinition["type"]): [t.Expression, Import[]]{
  const expressions: t.Expression[] = []
  const imports: Import[] = []

  if (!elementTypes || elementTypes.length == 0) {
    return [t.identifier(""), []]
  }

  for (const type of elementTypes) {
    switch (type.code) {
      case "http://hl7.org/fhirpath/System.Integer":
      case "http://hl7.org/fhirpath/System.Boolean":
      case "http://hl7.org/fhirpath/System.Time":
      case "http://hl7.org/fhirpath/System.DateTime":
      case "http://hl7.org/fhirpath/System.Date":
      case "http://hl7.org/fhirpath/System.Decimal":
      case "http://hl7.org/fhirpath/System.String": {
        expressions.push(
          t.callExpression(
            t.memberExpression(
              t.identifier("z"),
              t.identifier("string"),
            ),
            []
          )
        )
        break
      }
      default: {
        if (type.code.startsWith("http")) {
          throw new Error("all http cases should be handled: " + type.code)
        }

        expressions.push(t.identifier(type.code))
        imports.push({ type: "named", name: type.code, from: `./${type.code}.ts`})
        break
      }
    }
  }

  if (expressions.length == 1) {
    return [expressions[0], imports]
  } else {
    return [
      t.callExpression(
        t.memberExpression(t.identifier("z"), t.identifier("union")),
        [t.arrayExpression(expressions)],
      ),
      imports,
    ]
  }
}

export type Import = { type: "named", name: string, from: string }

interface ElementTree {
  path: string,
  key: string,
  value?: tt.elementDefinition,
  expression?: t.Expression,
  parent?: ElementTree,
  children: ElementTree[],
  imports: Import[],
}

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

export function treeTraverse(tree: ElementTree, action: (tree: ElementTree) => void) {
  if (!tree.children.length) return action(tree)
  tree.children.forEach((tree) => treeTraverse(tree, action))
  return action(tree)
}

export function setCardinality(element: tt.elementDefinition, expression: t.Expression): t.Expression {
  const min = element.min ?? 0
  const max = parseInt(element.max ?? "")
  const hasMax = !Number.isNaN(max)
  const isArray = max > 1 || element.max == "*"
  const isOptional = min == 0

  let newExpression = expression

  if (isArray) {
    newExpression = t.callExpression(
      t.memberExpression(
        newExpression,
        t.identifier("array")
      ),
      []
    )
  }

  if (isArray && min > 1) {
    newExpression = t.callExpression(
      t.memberExpression(
        newExpression,
        t.identifier("min")
      ),
      [
        t.numericLiteral(min),
      ]
    )
  }

  if (isArray && hasMax) {
    newExpression = t.callExpression(
      t.memberExpression(
        newExpression,
        t.identifier("max")
      ),
      [
        t.numericLiteral(max),
      ]
    )
  }

  if (isOptional) {
    newExpression = t.callExpression(
      t.memberExpression(
        newExpression,
        t.identifier("optional")
      ),
      []
    )
  }

  return newExpression
}

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
