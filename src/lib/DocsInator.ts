import * as Config from '@oclif/config'
import Help from '@oclif/plugin-help'
import GithubSlugger from 'github-slugger'
import normalizePackageJsonData from 'normalize-package-data'
import path from 'path'
import { castArray, template } from '../util'
import { pathExistsSync } from 'fs-extra'

class CommandDocs {
  constructor(public config: Config.IConfig, public plugin: Config.IPlugin, public cmd: Config.Command) {}

  private renderCommand(config: Config.IConfig, c: Config.Command, columns: number): string {
    const help = new Help(config, { stripAnsi: true, maxWidth: columns })

    const title = template({ config, command: c })(c.description || '')
      .trim()
      .split('\n')[0]

    const header = `## \`${config.bin} ${this.commandUsage(config, c)}\``
    const commandCodePath = this.commandCode(config, c)

    const commandHelpOutput = help.command(c).trim()

    return [header, title, '```\n' + commandHelpOutput + '\n```', commandCodePath].join('\n\n')
  }

  private commandCode(config: Config.IConfig, c: Config.Command): string | undefined {
    const pluginName = c.pluginName
    if (!pluginName) return

    const plugin = config.plugins.find(p => p.name === c.pluginName)
    if (!plugin) return

    const repo = this.repo(plugin)
    if (!repo) return

    let label = plugin.name
    let version = plugin.version

    const commandPath = this.commandPath(plugin, c)
    if (!commandPath) return

    if (config.name === plugin.name) {
      label = commandPath
      version = process.env.OCLIF_NEXT_VERSION || version
    }

    const cmdCodePathTemplate =
      plugin.pjson.oclif.repositoryPrefix || '<%- repo %>/blob/v<%- version %>/<%- commandPath %>'

    return `_See code: [${label}](${template({
      repo,
      version,
      commandPath,
      config,
      c,
    })(cmdCodePathTemplate)})_`
  }

  private commandPath(plugin: Config.IPlugin, c: Config.Command): string | undefined {
    const commandsDir = plugin.pjson.oclif.commands
    if (!commandsDir) return

    let p = path.join(plugin.root, commandsDir, ...c.id.split(':'))
    const libRegex = new RegExp('^lib' + (path.sep === '\\' ? '\\\\' : path.sep))

    if (pathExistsSync(path.join(p, 'index.js'))) {
      p = path.join(p, 'index.js')
    } else if (pathExistsSync(p + '.js')) {
      p += '.js'
    } else if (plugin.pjson.devDependencies.typescript) {
      // check if non-compiled scripts are available
      const base = p.replace(plugin.root + path.sep, '')

      p = path.join(plugin.root, base.replace(libRegex, 'src' + path.sep))
      if (pathExistsSync(path.join(p, 'index.ts'))) {
        p = path.join(p, 'index.ts')
      } else if (pathExistsSync(p + '.ts')) {
        p += '.ts'
      } else {
        return
      }
    } else {
      return
    }

    p = p.replace(plugin.root + path.sep, '')
    if (plugin.pjson.devDependencies.typescript) {
      p = p.replace(libRegex, 'src' + path.sep)
      p = p.replace(/\.js$/, '.ts')
    }

    return p
  }

  private commandUsage(config: Config.IConfig, command: Config.Command): string {
    const arg = (arg: Config.Command.Arg) => {
      const name = arg.name.toUpperCase()
      if (arg.required) return `${name}`
      return `[${name}]`
    }

    const defaultUsage = () => {
      const args = command.args
        .filter(a => !a.hidden)
        .map(a => arg(a))
        .join(' ')

      return [command.id, args].join(' ')
    }

    const usages = castArray(command.usage)

    return template({ config, command })(usages.length === 0 ? defaultUsage() : usages[0])
  }
}

export class DocsInator {
  slugify: any

  constructor() {
    this.slugify = new GithubSlugger()
  }

  public replaceTag(content: string, tag: string, body: string, fileName: string, logger?: any): string {
    if (content.includes(`<!-- ${tag} -->`)) {
      if (content.includes(`<!-- ${tag}stop -->`)) {
        content = content.replace(new RegExp(`<!-- ${tag} -->(.|\n)*<!-- ${tag}stop -->`, 'm'), `<!-- ${tag} -->`)
      }

      logger?.info(`replacing <!-- ${tag} --> in ${fileName}`)
    }

    return content.replace(`<!-- ${tag} -->`, `<!-- ${tag} -->\n${body}\n<!-- ${tag}stop -->`)
  }

  private tableOfContents(__: Config.IConfig, content: string): string {
    return content
      .split('\n')
      .filter(l => l.startsWith('# '))
      .map(l => l.trim().slice(2))
      .map(l => `* [${l}](#${this.slugify.slug(l)})`)
      .join('\n')
  }

  private usageInfo(config: Config.IConfig): string {
    return [
      `\`\`\`sh-session`,
      `$ yarn global add ${config.name}`,
      `$ ${config.bin} COMMAND`,
      `running command...`,
      `$ ${config.bin} (-v|--version|version)`,
      `${config.name}/${config.version} ${process.platform}-${process.arch} node-v${process.versions.node}`,
      `$ ${config.bin} --help [COMMAND]`,
      `USAGE`,
      `$ ${config.bin} COMMAND`,
      `...`,
      `\`\`\`\n`,
    ]
      .join('\n')
      .trim()
  }

  private commands(config: Config.IConfig, commands: Config.Command[]): string {
    return [
      ...commands.map(c => {
        const usage = this.commandUsage(config, c)
        return `* [\`${config.bin} ${usage}\`](#${this.slugify.slug(`${config.bin}-${usage}`)})`
      }),
      '',
      ...commands.map(c => this.renderCommand(config, c)).map(s => s.trim() + '\n'),
    ]
      .join('\n')
      .trim()
  }

  private repo(plugin: Config.IPlugin): string | undefined {
    const packageJson = { ...plugin.pjson }
    normalizePackageJsonData(packageJson)

    const repo = packageJson?.repository?.url
    const url = new URL(repo)

    if (!['github.com', 'gitlab.com'].includes(url.hostname) && !packageJson.oclif.repositoryPrefix) {
      return
    }

    return `https://${url.hostname}${url.pathname.replace(/\.git$/, '')}`
  }
}
