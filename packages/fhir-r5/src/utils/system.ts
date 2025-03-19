import fs from "node:fs"
import stream from "node:stream"
import { extract } from "tar-fs"
import { createGunzip } from "node:zlib"
import * as p from "../paths.ts"

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
