import { GitUtils, NotGitRepoException } from './GitUtils'

interface GitReleaseArgs {
  root: string
  tagName: string
  versionFile: string
  isPrerelease?: boolean
  changelogPath?: string
}

export class GitRelease {
  private versionFile: string
  private changelogPath?: string
  private root: string
  private tagName: string
  private isPrerelease: boolean

  constructor(args: GitReleaseArgs) {
    const mergedArgs = {
      isPrerelease: false,
      ...args,
    }

    this.versionFile = mergedArgs.versionFile
    this.changelogPath = mergedArgs.changelogPath
    this.root = mergedArgs.root
    this.tagName = mergedArgs.tagName
    this.isPrerelease = mergedArgs.isPrerelease
  }

  private addAndCommitTagFiles() {
    const files = [this.versionFile]
    if (!this.changelogPath) {
      files.push(this.changelogPath)
    }

    console.log(files)
    GitUtils.gitAddFiles(files, this.root)
    const commitMessage = `${this.isPrerelease ? 'Prerelease' : 'Release'} ${this.tagName}`
    GitUtils.gitCommit(commitMessage, this.root)
  }

  public release() {
    GitUtils.maybeTriggerGitPushError(this.root)
    this.addAndCommitTagFiles()
    GitUtils.gitTag(this.tagName, `Release ${this.tagName}`, this.root)
    GitUtils.gitPush(this.tagName, this.root)
  }

  public createReleaseNote() {}
}
