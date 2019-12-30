// tslint:disable no-implicit-dependencies

import { Command, flags } from '@oclif/command'
import * as Config from '@oclif/config'
import Help from '@oclif/plugin-help'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as path from 'path'
import { URL } from 'url'

import { castArray, compact, sortBy, template, uniqBy, sortAndUniq } from '../util'

export default class Readme extends Command {
  static description = `adds commands to README.md in current directory
The readme must have any of the following tags inside of it for it to be replaced or else it will do nothing:
# Usage
<!-- usage -->
# Commands
<!-- commands -->

Customize the code URL prefix by setting oclif.repositoryPrefix in package.json.
`

  static flags = {
    dir: flags.string({
      description: 'output directory for multi docs',
      default: 'docs',
      required: true,
    }),
    multi: flags.boolean({
      description: 'create a different markdown page for each topic',
    }),
    'space-separated': flags.boolean({
      description: 'output space separated commands on docs',
    }),
  }

  async run() {
    const { flags } = this.parse(Readme)
    const config = await Config.load({
      root: process.cwd(),
      devPlugins: false,
      userPlugins: false,
    })

    let readme = await fs.readFile('README.md', 'utf8')
    let commands = config.commands
    commands = commands.filter(c => !c.hidden)
    commands = commands.filter(c => c.pluginType === 'core')
    this.debug('commands:', commands.map(c => c.id).length)
    commands = uniqBy(commands, c => c.id)
    commands = sortBy(commands, c => c.id)

    console.log(config.name)

    // readme = this.replaceTag(readme, 'usage', this.usage(config))
    // readme = this.replaceTag(
    //   readme,
    //   'commands',
    //   flags.multi ? this.multiCommands(config, commands, flags.dir) : this.commands(config, commands)
    // )
    // readme = this.replaceTag(readme, 'toc', this.toc(config, readme))

    // readme = readme.trimRight()
    // readme += '\n'
    // await fs.outputFile('README.md', readme)
  }

  createTopicFile(file: string, config: Config.IConfig, topic: Config.Topic, commands: Config.Command[]) {
    const bin = `\`${config.bin} ${topic.name}\``
    const doc =
      [
        bin,
        '='.repeat(bin.length),
        '',
        template({ config })(topic.description || '').trim(),
        '',
        this.commands(config, commands),
      ]
        .join('\n')
        .trim() + '\n'
    fs.outputFileSync(file, doc)
  }

  multiCommands(config: Config.IConfig, commands: Config.Command[], dir: string): string {
    let topics = config.topics

    topics = topics.filter(t => !t.hidden && !t.name.includes(':'))
    topics = topics.filter(t => commands.find(c => c.id.startsWith(t.name)))
    topics = sortAndUniq(topics, t => t.name)
    for (const topic of topics) {
      this.createTopicFile(
        path.join('.', dir, topic.name.replace(/:/g, '/') + '.md'),
        config,
        topic,
        commands.filter(c => c.id === topic.name || c.id.startsWith(topic.name + ':'))
      )
    }

    return (
      [
        '# Command Topics\n',
        ...topics.map(t => {
          return [
            `* [\`${config.bin} ${t.name}\`](${dir}/${t.name.replace(/:/g, '/')}.md)`,
            template({ config })(t.description || '')
              .trim()
              .split('\n')[0],
          ].join(' - ')
        }),
      ]
        .join('\n')
        .trim() + '\n'
    )
  }
}
