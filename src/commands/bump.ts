import { Command, flags } from '@oclif/command'
import * as Parser from '@oclif/parser'
import { prompt } from 'inquirer'
import { PackageJson, ReleaseType } from '../lib/PackageJson'
import { Changelog, ChangelogNotFound } from '../lib/Changelog'
import { dirname, join } from 'path'
import * as chalk from 'chalk'

const boolToInt = (val: boolean) => {
  return val ? 1 : 0
}

export default class Version extends Command {
  static description = 'Bumps version and updates changelog'

  static flags = {
    'no-changelog': flags.boolean({ char: 'n', description: 'No changelog update', default: false }),
    major: flags.boolean({ description: 'Bump major' }),
    minor: flags.boolean({ description: 'Bump minor' }),
    patch: flags.boolean({ description: 'Bump patch' }),
    prerelease: flags.boolean({ description: 'Bump the beta identifier' }),
    stable: flags.boolean({ description: 'Create a new stable', default: false }),
  }

  private static checkFlagsValidity(flags: Parser.OutputFlags<typeof Version.flags>) {
    const count = boolToInt(flags.major) + boolToInt(flags.minor) + boolToInt(flags.patch) + boolToInt(flags.prerelease)
    if (count === 0) {
      throw new Error('You need to select one bump type: major, minor, patch or prerelease')
    }

    if (count > 1) {
      throw new Error('You can select only one bump: major, minor, patch or prerelease')
    }

    if (flags.prerelease && flags.stable) {
      throw new Error(`You can't select prerelease and stable`)
    }

    let type: ReleaseType
    if (flags.major) {
      type = 'major'
    } else if (flags.minor) {
      type = 'minor'
    } else if (flags.patch) {
      type = 'patch'
    } else if (flags.prerelease) {
      type = 'prerelease'
    }

    return { type, stable: flags.stable }
  }

  private static async bumpPackageJsonVersion(type: ReleaseType, stable: boolean) {
    try {
      const pkg = await PackageJson.getProjectPackageJson(console)
      console.log(`Current version: ${pkg.version}`)
      const newVersion = PackageJson.getNextVersion(pkg.version, type, stable)
      console.log(`New version: ${newVersion}`)

      const { confirmBump } = await prompt({
        type: 'confirm',
        name: 'confirmBump',
        message: 'Confirm?',
      })

      if (!confirmBump) {
        console.log('Cancelled')
        process.exit(1)
      }

      console.log('> Bumping version on package.json')
      await pkg.writeNewVersion(newVersion)
      return { newVersion: pkg.version, pkgPath: pkg.filePath }
    } catch (err) {
      console.error(chalk.red(err.message))
      process.exit(1)
    }
  }

  private static createGitTag() {}

  private static async updateChangelog(newVersion: string, packageJsonPath: string) {
    try {
      const changelogPath = join(dirname(packageJsonPath), 'CHANGELOG.md')
      const ch = await Changelog.getChangelog(changelogPath)
      console.log('> Updating CHANGELOG.md')
      await ch.releaseNewVersion(newVersion)
    } catch (err) {
      if (err instanceof ChangelogNotFound) {
        console.error(
          chalk.red(
            [
              'Changelog not found!',
              "If you already have one please run 'oclif-dev bump' on the project root. Make sure that CHANGELOG.md is on the project root as well.",
              "You can create a new changelog with 'oclif-dev changelog:init'.",
            ].join('\n')
          )
        )
      }

      process.exit(1)
    }
  }

  async run() {
    const { flags } = this.parse(Version)
    const { type, stable } = Version.checkFlagsValidity(flags)
    const { newVersion, pkgPath } = await Version.bumpPackageJsonVersion(type, stable)

    if (!flags['no-changelog'] && !flags.prerelease && flags.stable) {
      await Version.updateChangelog(newVersion, pkgPath)
    }
  }
}