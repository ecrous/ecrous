import fs from "node:fs"
import * as t from "@babel/types"
import * as p from "./paths.ts"
import * as u from "./utils.ts"

// u.cleanUp()

fs.mkdirSync(p.assetsPath, { recursive: true })
fs.mkdirSync(p.fhirPath, { recursive: true })

if (!fs.existsSync(p.fhirTgzPath)) u.downloadFhirTgz()
if (!fs.existsSync(p.fhirIndexPath)) u.unpackFhirTgz()

const index = u.readJson(p.fhirIndexPath)

// console.log(index)

console.log(u.recursiveFindInIndex(index, "[0]|([1-9][0-9]*)"))
