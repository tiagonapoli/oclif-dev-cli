import { Command, flags } from '@oclif/command'
import { Changelog } from '../../lib/Changelog'

export default class GetTag extends Command {
  static description = 'Outputs the content of a tag to stdout'

  static flags = {
    path: flags.string({ char: 'p', description: 'path to changelog', default: './CHANGELOG.md' }),
    tag: flags.string({ char: 't', description: 'desired tag', required: true }),
  }

  async run() {
    const { flags } = this.parse(GetTag)
    const ch = await Changelog.getChangelog(flags.path)
    const content = ch.getVersionContent(flags.tag).split('\n')

    content.shift()
    while (content.length > 0 && !content[content.length - 1]) {
      content.pop()
    }

    while (content.length > 0 && !content[0]) {
      content.shift()
    }

    console.log(content.join('\n'))
  }
}
