import fs from "node:fs"
import stream from "node:stream"
import { extract } from "tar-fs"
import { createGunzip } from "node:zlib"
import * as p from "../paths.ts"

export function cleanUp() {
  fs.rmSync(p.assetsPath, { recursive: true, force: true })
}

export function downloadTgz(url: string, tgzPath: string): Promise<void> {
  return new Promise(async (res, rej) => {
    console.log(`downloading ${url}`)
    const response = await fetch(url);

    if (!response.body) return rej(new Error("body is empty"))

    stream.Readable
      .fromWeb(response.body)
      .pipe(fs.createWriteStream(tgzPath))
      .on("finish", () => {
        res()
        console.log(`downloaded ${url}`)
      });
  });
}

export function unpackTgz(tgzPath: string, outPath: string): Promise<void> {
  return new Promise((res) => {
    console.log(`unpacking ${tgzPath} to ${outPath}`)
    fs.createReadStream(tgzPath)
      .pipe(createGunzip())
      .pipe(extract(outPath))
      .on("finish", () => {
        res()
        console.log(`unpacked ${tgzPath}`)
      });
  })
}

export function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath).toString())
}
