oclif-template
==============

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-template.svg)](https://npmjs.org/package/oclif-template)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-template.svg)](https://npmjs.org/package/oclif-template)
[![License](https://img.shields.io/npm/l/oclif-template.svg)](https://github.com/tiagonapoli/oclif-template/blob/master/package.json)


# Development

Starting a development session is easy, just run `yarn nodemon` once all dependencies are installed. You can create an alias to the absolute path to `./bin/run` so you can easily run the CLI in development to test. In Linux, if you use `bash`, you can add to the end of `~/.bashrc` the following line:
```sh
alias YOUR_CLI_NAME-test="ABSOLUTE_PATH_TO_YOUR_CLI_FOLDER/bin/run"
```
After restarting the active terminals you'll be able to run `YOUR_CLI_NAME-test` and you'll be running the dev version of your CLI.

In MacOS you can add to the end of `~/.bash_profile` (if you use `bash`) the same line presented above - maybe you'll have to restart the computer for the new alias to take effect.

<!-- toc -->
* [Development](#development)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g oclif-template
$ cli COMMAND
running command...
$ cli (-v|--version|version)
oclif-template/0.0.1 linux-x64 node-v12.13.0
$ cli --help [COMMAND]
USAGE
  $ cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`cli help [COMMAND]`](#cli-help-command)
* [`cli ls`](#cli-ls)
* [`cli say:bye`](#cli-saybye)
* [`cli say:hello [FILE]`](#cli-sayhello-file)
* [`cli update [CHANNEL]`](#cli-update-channel)

## `cli help [COMMAND]`

display help for cli

```
USAGE
  $ cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `cli ls`

List local files

```
USAGE
  $ cli ls

EXAMPLE
  cli ls
```

_See code: [src/commands/ls.ts](https://github.com/tiagonapoli/oclif-template/blob/v0.0.1/src/commands/ls.ts)_

## `cli say:bye`

Say bye

```
USAGE
  $ cli say:bye

EXAMPLE
  cli say bye
```

_See code: [src/commands/say/bye.ts](https://github.com/tiagonapoli/oclif-template/blob/v0.0.1/src/commands/say/bye.ts)_

## `cli say:hello [FILE]`

Say hello

```
USAGE
  $ cli say:hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLES
  cli say hello
  cli say hello --name="tiago"
  cli say hello -n tiago
  cli say hello --force --file asdf.txt
```

_See code: [src/commands/say/hello.ts](https://github.com/tiagonapoli/oclif-template/blob/v0.0.1/src/commands/say/hello.ts)_

## `cli update [CHANNEL]`

update the cli CLI

```
USAGE
  $ cli update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.9/src/commands/update.ts)_
<!-- commandsstop -->
