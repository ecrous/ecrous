import path from "node:path"
import * as p from "../paths.ts"
import { readJson } from "./system.ts"
import { Result } from "./types.ts"

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
