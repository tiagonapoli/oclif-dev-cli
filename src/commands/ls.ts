import fs from 'fs'

import { Command } from '@oclif/command'

export default class LS extends Command {
  static description = 'List local files'

  static examples = [`cli ls`]

  static flags = {}
  static args = []

  async run() {
    console.log(
      fs.readdirSync(process.cwd()).reduce((acc, dir) => {
        return acc + dir + '\n'
      }, '')
    )
  }
}
