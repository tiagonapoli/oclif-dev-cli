import * as chalk from 'chalk'
import * as execa from 'execa'

const runCommand = (
  cmd: string,
  cwd: string,
  successMessage: string,
  opts?: { hideOutput?: boolean; retries?: number; hideSuccessMessage?: boolean; logger?: any }
) => {
  const { hideOutput, retries, hideSuccessMessage, logger } = {
    hideOutput: false,
    retries: 0,
    hideSuccessMessage: false,
    ...opts,
  }

  for (let i = 0; i <= retries; i += 1) {
    try {
      const [bin, ...args] = cmd.split(' ')
      console.log(bin, args)
      const { stdout: output } = execa.sync(bin, args, { stdio: hideOutput ? 'pipe' : 'inherit', cwd })
      if (!hideSuccessMessage) {
        logger?.info(successMessage + chalk.blue(` >  ${cmd}`))
      }

      return output
    } catch (e) {
      logger?.error(`Command '${cmd}' exited with error code: ${e.status}`)
      if (i === retries) {
        throw e
      }

      logger?.info(`Retrying...`)
    }
  }
}

export class NotGitRepoException extends Error {
  public code = 'not_git_repo'
  constructor(root: string) {
    super(`The path ${root} is not a Git repository`)
  }
}

interface GitReleaseArgs {
  root: string
  tagName: string
  versionFile: string
  isPrerelease?: boolean
  changelogPath?: string
}

export class GitRelease {
  private static gitAddFiles(files: string[], root: string) {
    const filesStr = files.map(filePath => `"${filePath}"`).join(' ')
    const gitAddCommand = `git add ${filesStr}`
    const successMessage = `Added files: ${filesStr}`
    return runCommand(gitAddCommand, root, successMessage, { hideOutput: true })
  }

  private static gitCommit(commitMessage: string, root: string) {
    return runCommand(`git commit -m "${commitMessage}`, root, 'Commited files', { hideOutput: true })
  }

  private static gitTag(tagName: string, tagMessage: string, root: string) {
    return runCommand(`git tag ${tagName} -m "${tagMessage}"`, root, `Tag created: ${tagName}`, {
      hideOutput: true,
    })
  }

  private static gitPush(tagName: string, root: string) {
    return runCommand(`git push && git push origin ${tagName}`, root, 'Pushed commit and tags', {
      hideOutput: true,
      retries: 2,
    })
  }

  private static isGitRepo(root: string) {
    try {
      execa.sync('git', ['rev-parse', '--git-dir'], { cwd: root })
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  private static maybeTriggerGitPushError(root: string) {
    runCommand('git push', root, '', { hideOutput: true })
  }

  private static gitStatus(root: string) {
    return runCommand('git status', root, '', { hideOutput: true })
  }

  private static hasUncommitedChanges(root: string) {
    const response = this.gitStatus(root)
    return !/nothing to commit/.test(response)
  }

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

    GitRelease.gitAddFiles(files, this.root)
    const commitMessage = `${this.isPrerelease ? 'Prerelease' : 'Release'} ${this.tagName}`
    GitRelease.gitCommit(commitMessage, this.root)
  }

  public release() {
    if (!GitRelease.isGitRepo(this.root)) {
      throw new NotGitRepoException(this.root)
    }

    if (GitRelease.hasUncommitedChanges(this.root)) {
      throw new Error('Please commit your changes before proceeding.')
    }

    GitRelease.maybeTriggerGitPushError(this.root)
    this.addAndCommitTagFiles()
    GitRelease.gitTag(this.tagName, `Release ${this.tagName}`, this.root)
    GitRelease.gitPush(this.tagName, this.root)
  }

  public createReleaseNote() {}
}
