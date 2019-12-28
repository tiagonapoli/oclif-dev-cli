import { Command } from '@oclif/command'

export default class Bye extends Command {
  static description = 'Say bye'

  static examples = [`cli say bye`]

  static flags = {}
  static args = []

  async run() {
    this.log(`bye from ${__dirname}`)
  }
}
