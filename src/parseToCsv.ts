import { parse, compact } from "parse-gedcom"

/**
 * Takes the raw text of a GEDCOM file as input and writes three CSV files to disk.
 */
export default function parseToCsv(gedcomFile: string) {
  const compactData = compact(parse(gedcomFile))

  const individuals = compactData.children
    .filter((item) => item.type === "INDI")
    .map((item) => item.data)
    .filter(notEmpty)

  const families = compactData.children
    .filter((item) => item.type === "FAM")
    .map((item) => item.data)
    .filter(notEmpty)

  const other = compactData.children
    .filter((item) => item.type !== "INDI" && item.type !== "FAM")
    .map((item) => item.data)
    .filter(notEmpty)

  Bun.write("individuals.csv", toCsv(individuals))
  Bun.write("families.csv", toCsv(families))
  Bun.write("other.csv", toCsv(other))
}

/**
 * Convert an array of objects to a CSV string.
 * Sanitizes the values and sorts the keys based on a few ancestry related rules.
 */
function toCsv<T extends object>(data: T[]): string {
  const keys = allKeys(data).sort(sortSpecialCharactersLast)
  const header = keys.join(",") + "\n"
  const rows = data
    .map((item) =>
      keys
        .map((key) => {
          // @ts-expect-error
          const value = item[key]
          const clean = (
            typeof value === "string" ? value.trim() : JSON.stringify(value)
          )?.replaceAll(",", ";")
          return clean
        })
        .join(",")
    )
    .join("\n")
  return header + rows
}

/**
 * Get all keys from an array of objects.
 */
function allKeys(value: {}[]) {
  return [...new Set(value.flatMap((object) => Object.keys(object)))]
}

/**
 * Filter out null and undefined values. Typescript safe.
 */
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value != null
}

/**
 * Sort special characters last, and put some keys first.
 */
function sortSpecialCharactersLast(a: string, b: string) {
  const keysToPutFirst = ["MARRIAGE/DATE", "NAME"].map((key) =>
    key.toLowerCase()
  )
  const startsWithSpecialA = /^[^a-zA-Z0-9]/.test(a)
  const startsWithSpecialB = /^[^a-zA-Z0-9]/.test(b)
  const lowerA = a.toLowerCase()
  const lowerB = b.toLowerCase()

  if (keysToPutFirst.includes(lowerA)) return -1
  if (keysToPutFirst.includes(lowerB)) return 1

  if (startsWithSpecialA && !startsWithSpecialB) {
    // If only a starts with a special character, sort b before a
    return 1
  } else if (!startsWithSpecialA && startsWithSpecialB) {
    // If only b starts with a special character, sort a before b
    return -1
  } else {
    // If both or neither start with a special character, sort alphabetically
    return a.localeCompare(b)
  }
}
