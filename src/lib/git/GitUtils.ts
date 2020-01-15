import * as chalk from 'chalk'
import { execSync } from 'child_process'

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
      const output = execSync(cmd, { stdio: hideOutput ? 'pipe' : 'inherit', cwd })
      if (!hideSuccessMessage) {
        logger?.info(successMessage + chalk.blue(` >  ${cmd}`))
      }

      return output?.toString('utf8') || ''
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

export class GitUtils {
  public static gitAddFiles(files: string[], root: string, logger: any) {
    const filesStr = files.map(filePath => `"${filePath}"`).join(' ')
    const gitAddCommand = `git add ${filesStr}`
    const successMessage = `Added files: ${filesStr}`
    return runCommand(gitAddCommand, root, successMessage, { hideOutput: false, logger })
  }

  public static gitCommit(commitMessage: string, root: string, logger: any) {
    return runCommand(`git commit -m "${commitMessage}"`, root, 'Commited files', { hideOutput: true, logger })
  }

  public static gitTag(tagName: string, tagMessage: string, root: string, logger: any) {
    return runCommand(`git tag ${tagName} -m "${tagMessage}"`, root, `Tag created: ${tagName}`, {
      hideOutput: true,
      logger
    })
  }

  public static gitPush(tagName: string, root: string, logger: any) {
    return runCommand(`git push && git push origin ${tagName}`, root, 'Pushed commit and tags', {
      hideOutput: true,
      retries: 2,
      logger
    })
  }

  public static isGitRepo(root: string) {
    try {
      execSync('git rev-parse --git-dir', { cwd: root })
      return true
    } catch (e) {
      return false
    }
  }

  public static maybeTriggerGitPushError(root: string) {
    runCommand('git push', root, '', { hideOutput: true })
  }

  public static gitStatus(root: string) {
    return runCommand('git status', root, '', { hideOutput: true })
  }

  public static hasUncommitedChanges(root: string) {
    const response = this.gitStatus(root)
    return !/nothing to commit/.test(response)
  }
}
