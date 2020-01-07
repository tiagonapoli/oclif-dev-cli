import * as findVersions from 'find-versions'
import { readFile, writeFile, pathExists } from 'fs-extra'
import * as marked from 'marked'
import * as mdRenderer from 'marked-to-md'
import * as semver from 'semver'

export class ChangelogNotFound extends Error {}

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
    if (!(await pathExists(path))) {
      throw new ChangelogNotFound(`CHANGELOG.md not found at ${path}`)
    }

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

  public getMostRecentVersion() {
    for (const token of this.tokens) {
      if (isVersionToken(token)) {
        const version = getVersionFromTitle(token.text)?.version
        if (version) {
          return version
        }
      }
    }

    return null
  }

  public getUnreleasedPositions() {
    const mostRecentVersion = this.getMostRecentVersion()
    const ini = this.content.indexOf('[Unreleased]') - 3
    const end = mostRecentVersion == null ? this.content.length : this.content.indexOf(`[${mostRecentVersion}]`) - 4
    return { ini, end }
  }

  public getContentAfterNewRelease(newVersion: string, date: Date) {
    const { ini, end } = this.getUnreleasedPositions()
    let newVersionContent = this.content.substring(ini, end)

    const dateFormat = [
      date.getFullYear(),
      ('0' + (date.getMonth() + 1)).slice(-2),
      ('0' + date.getDate()).slice(-2),
    ].join('-')

    newVersionContent = newVersionContent.replace('## [Unreleased]', '')
    newVersionContent = newVersionContent.trim()
    newVersionContent =
      `## [${newVersion}] - ${dateFormat}\n\n` + newVersionContent + (newVersionContent.length > 0 ? '\n\n' : '')

    const newContent =
      this.content.substring(0, ini) + '## [Unreleased]\n\n' + newVersionContent + this.content.substring(end).trimLeft()
    return newContent
  }

  public releaseNewVersion(newVersion: string) {
    this.content = this.getContentAfterNewRelease(newVersion, new Date())
    return this.flush()
  }
}
