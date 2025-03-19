import fs from "node:fs"
import path from "node:path"
import * as p from "./paths.ts"
import * as u from "./utils/index.ts"
import * as l from "./logic/index.ts"
import * as tt from "./types.ts"

// u.cleanUp()
fs.rmSync(p.outPath, { recursive: true })

fs.mkdirSync(p.assetsPath, { recursive: true })
fs.mkdirSync(p.fhirPath, { recursive: true })
fs.mkdirSync(path.resolve(p.outPath, "types"), { recursive: true })

if (!fs.existsSync(p.fhirTgzPath)) u.downloadFhirTgz()
if (!fs.existsSync(p.fhirIndexPath)) u.unpackFhirTgz()

const index = tt.indexSchema.parse(u.readJson(p.fhirIndexPath))
const structureDefinitions = index.files.filter((f) => f.resourceType == "StructureDefinition")

l.makeTypes(structureDefinitions)

