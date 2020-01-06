import * as findVersions from 'find-versions'
import { readFile, writeFile } from 'fs-extra'
import * as marked from 'marked'
import * as mdRenderer from 'marked-to-md'
import * as semver from 'semver'

const isVersionToken = (token: marked.Token): boolean => {
  return token.type === 'heading' && token.depth === 2
}

const semverize = (title: string) => {
  title = title.replace(/(\d+\.\d+)\.x/, '$1.99999')
  title = title.replace(/(\d+)\.x/, '$1.99999.99999')

  const versions = findVersions(title, { loose: true })
  if (!versions || versions.length === 0) {
    return null
  }

  const version = versions.sort(semver.compare).pop()
  return version
}

const getVersionFromTitle = (title: string) => {
  const version = semverize(title)
  if (!semver.valid(version)) {
    return null
  }

  return {
    version,
  }
}

export class Changelog {
  public static async getChangelog(path: string) {
    const changelog = new Changelog(path)
    await changelog.init()
    return changelog
  }

  private content: string
  private tokens: any
  constructor(private path: string) {}

  public async init() {
    this.content = await readFile(this.path, { encoding: 'utf8' })
    const lexer = new marked.Lexer()
    this.tokens = lexer.lex(this.content)
  }

  public flush() {
    return writeFile(this.path, this.content)
  }

  public getVersionContent(version: string) {
    const versionTokens = [] as marked.TokensList
    versionTokens.links = {}

    let started = false
    for (const token of this.tokens) {
      if (isVersionToken(token)) {
        if (started) {
          break
        }

        if (getVersionFromTitle(token.text)?.version === version) {
          started = true
        }
      }

      if (started) {
        versionTokens.push(token)
      }
    }

    if (!started) {
      throw new Error(`Version ${version} not found on Changelog`)
    }

    const versionContent = marked.parser(versionTokens, {
      renderer: mdRenderer(new marked.Renderer()),
    })

    return versionContent
  }
}
