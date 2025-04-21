import path from "node:path"

export const rootPath = path.resolve(import.meta.filename, "../..");
export const assetsPath = path.resolve(rootPath, "assets")

export const fhirCorePath = path.resolve(assetsPath, "fhir-core")
export const fhirExamplesPath = path.resolve(assetsPath, "fhir-examples")

export const fhirCoreTgzPath = path.resolve(assetsPath, "fhir-core.tgz")
export const fhirExamplesTgzPath = path.resolve(assetsPath, "fhir-examples.tgz")

// http://hl7.org/fhir/directory.html
export const fhirCoreTgzUrl = "https://hl7.org/fhir/hl7.fhir.r5.core.tgz"
export const fhirExamplesTgzUrl = "https://hl7.org/fhir/hl7.fhir.r5.examples.tgz"

export const fhirCoreRootPath = path.resolve(fhirCorePath, "package")
export const fhirExamplesRootPath = path.resolve(fhirExamplesPath, "package")

export const fhirCoreIndexPath = path.resolve(fhirCoreRootPath, ".index.json")
export const fhirExamplesIndexPath = path.resolve(fhirExamplesRootPath, ".index.json")

export const outPath = path.resolve(rootPath, "out")
export const outResourcesSchemesPath = path.resolve(outPath, "resources-schemes")
export const outResourcesSchemesTestsPath = path.resolve(outPath, "resources-schemes-tests")
