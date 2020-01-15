import { GitUtils } from './GitUtils'

interface GitReleaseArgs {
  root: string
  tagName: string
  versionFile: string
  logger: any
  isPrerelease?: boolean
  changelogPath?: string
}

export class GitRelease {
  private versionFile: string
  private changelogPath?: string
  private root: string
  private tagName: string
  private isPrerelease: boolean
  private logger: any

  constructor(args: GitReleaseArgs,) {
    const mergedArgs = {
      isPrerelease: false,
      ...args,
    }

    this.versionFile = mergedArgs.versionFile
    this.changelogPath = mergedArgs.changelogPath
    this.root = mergedArgs.root
    this.logger = mergedArgs.logger
    this.tagName = mergedArgs.tagName
    this.isPrerelease = mergedArgs.isPrerelease
  }

  private addAndCommitTagFiles() {
    const files = [this.versionFile]
    if (this.changelogPath) {
      console.log('CHANGELOG', this.changelogPath)
      files.push(this.changelogPath)
    }

    console.log(files)
    GitUtils.gitAddFiles(files, this.root, this.logger)
    const commitMessage = `${this.isPrerelease ? 'Prerelease' : 'Release'} ${this.tagName}`
    GitUtils.gitCommit(commitMessage, this.root, this.logger)
  }

  public release() {
    this.addAndCommitTagFiles()
    GitUtils.gitTag(this.tagName, `Release ${this.tagName}`, this.root, this.logger)
    GitUtils.gitPush(this.tagName, this.root)
  }

  public createReleaseNote() {}
}
