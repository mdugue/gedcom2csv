import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import parseToCsv from "./parseToCsv"

const args = await yargs(hideBin(process.argv))
  .usage("Usage: $0 <file>")
  .demandCommand(1, "You need to specify a file")
  .check((argv) => {
    if (argv._.length !== 1) {
      throw new Error("You need to specify exactly one file")
    }
    return true
  })
  .help().argv

const path = args._[0] as string
const file = Bun.file(path)
const text = await file.text()
parseToCsv(text)
