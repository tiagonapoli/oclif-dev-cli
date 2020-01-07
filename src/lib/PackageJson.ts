import { pathExists, readJson, writeJson } from 'fs-extra'
import { dirname, join } from 'path'
import * as semver from 'semver'

export type ReleaseType = 'major' | 'minor' | 'patch' | 'prerelease'

namespace InvalidVersionBump {
  export interface Codes {
    prereleaseOnStable: string
  }
}

class InvalidVersionBump extends Error {
  static codes: InvalidVersionBump.Codes = {
    prereleaseOnStable: 'Not allowed to prerelease bump on stable version',
  }

  constructor(public code: keyof InvalidVersionBump.Codes) {
    super(InvalidVersionBump.codes.prereleaseOnStable)
  }
}

export class PackageJson {
  private static async findProjectRoot(base: string) {
    let prev = null
    let dir = base

    do {
      if (await pathExists(join(dir, 'package.json'))) {
        return dir
      }

      prev = dir
      dir = dirname(dir)
    } while (dir !== prev)

    if (!(await pathExists(join(base, 'package.json')))) {
      throw new Error('package.json not found')
    }

    return base
  }

  public static async getProjectPackageJson(logger: any) {
    const root = await PackageJson.findProjectRoot(process.cwd())
    const pkg = new PackageJson(join(root, 'package.json'), logger)
    await pkg.init()
    return pkg
  }

  public static getNextVersion(curVersion: string, type: ReleaseType, stable: boolean) {
    if (!semver.prerelease(curVersion) && type === 'prerelease') {
      throw new InvalidVersionBump('prereleaseOnStable')
    }

    if (stable || type === 'prerelease') {
      return semver.inc(curVersion, type)
    }

    return semver.inc(curVersion, `pre${type}` as 'premajor' | 'preminor' | 'prepatch', 'beta')
  }

  public content: any
  constructor(private path: string, private logger: any) {}

  public get filePath() {
    return this.path
  }

  public get version() {
    return this.content.version ?? '0.0.0'
  }

  public async init() {
    this.content = await readJson(this.path)
  }

  public flush(): Promise<void> {
    return writeJson(this.path, this.content, { spaces: 2 })
  }

  public writeNewVersion(version: string) {
    this.content.version = version
    return this.flush()
  }
}
