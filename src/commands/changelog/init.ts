import { Command } from '@oclif/command'
import { pathExists, writeFile } from 'fs-extra'

const template = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]`

export default class Init extends Command {
  static description = 'Initializes a changelog on the current directory'

  async run() {
    if (await pathExists('CHANGELOG.md')) {
      console.error('CHANGELOG.md already exists on the current directory')
      process.exit(1)
    }

    await writeFile('CHANGELOG.md', template)
  }
}
