import path from "node:path"

export const rootPath = path.resolve(import.meta.filename, "../..");
export const assetsPath = path.resolve(rootPath, "assets")
export const fhirPath = path.resolve(assetsPath, "fhir")
export const fhirTgzPath = path.resolve(assetsPath, "fhir.tgz")
// http://hl7.org/fhir/directory.html
export const fhirTgzUrl = "https://hl7.org/fhir/hl7.fhir.r5.core.tgz"
export const fhirRootPath = path.resolve(fhirPath, "package")
export const fhirIndexPath = path.resolve(fhirRootPath, ".index.json")
export const outPath = path.resolve(rootPath, "out")
