import fs from "node:fs"
import path from "node:path"
import stream from "node:stream"
import { extract } from "tar-fs"
import { createGunzip } from "node:zlib"
import * as p from "./paths.ts"

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
