const fs = require('fs')
const path = require('path')
const nodemon = require('nodemon')
const chalk = require('chalk')

const nodemonConfigPath = path.join(process.cwd(), 'nodemon.json')
const nodemonConfig = {
  ...JSON.parse(fs.readFileSync(nodemonConfigPath, { encoding: 'utf8' })),
}

const logger = {
  info: msg => console.log(chalk.green(`[nodemon] ${msg}`)),
  warn: msg => console.log(chalk.yellow(`[nodemon] ${msg}`)),
  error: msg => console.log(chalk.red(`[nodemon] ${msg}`)),
}

nodemon(nodemonConfig)