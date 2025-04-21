import fs from "node:fs"
import * as p from "./paths.ts"
import * as u from "./utils/index.ts"
import * as l from "./logic/index.ts"
import * as tt from "./types.ts"

// u.cleanUp()
fs.rmSync(p.outPath, { recursive: true })

fs.mkdirSync(p.assetsPath, { recursive: true })
fs.mkdirSync(p.fhirCoreRootPath, { recursive: true })
fs.mkdirSync(p.fhirExamplesRootPath, { recursive: true })
fs.mkdirSync(p.outResourcesSchemesPath, { recursive: true })
fs.mkdirSync(p.outResourcesSchemesTestsPath, { recursive: true })

if (!fs.existsSync(p.fhirCoreTgzPath)) await u.downloadTgz(p.fhirCoreTgzUrl, p.fhirCoreTgzPath)
if (!fs.existsSync(p.fhirCoreIndexPath)) await u.unpackTgz(p.fhirCoreTgzPath, p.fhirCorePath)

if (!fs.existsSync(p.fhirExamplesTgzPath)) await u.downloadTgz(p.fhirExamplesTgzUrl, p.fhirExamplesTgzPath)
if (!fs.existsSync(p.fhirExamplesIndexPath)) await u.unpackTgz(p.fhirExamplesTgzPath, p.fhirExamplesPath)

const coreIndex = tt.indexSchema.parse(u.readJson(p.fhirCoreIndexPath))
const structureDefinitions = coreIndex.files.filter((f) => f.resourceType == "StructureDefinition")

l.makeResourcesSchemes(structureDefinitions)

const examplesIndex = tt.indexSchema.parse(u.readJson(p.fhirExamplesIndexPath))

l.makeResourcesSchemesTests(examplesIndex.files)

