import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

export function deleteDir(directory: string) {
  if (directory && fs.existsSync(directory)) {
    const files = fs.readdirSync(directory)
    if (files.length) {
      files.forEach(filename => {
        const filePath = path.join(directory, filename)
        const stats = fs.statSync(filePath)
        if (stats.isDirectory()) {
          deleteDir(filePath)
        } else {
          fs.unlinkSync(filePath)
        }
      })
    }
    fs.rmdirSync(directory)
  }
}

export function copyDir(source: string, dest: string) {
  if (fs.existsSync(source)) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest)
    }
    const files = fs.readdirSync(source)
    if (files.length) {
      files.forEach(filename => {
        const filePath = path.join(source, filename)
        const targetPath = path.join(dest, filename)
        const stats = fs.statSync(filePath)
        if (stats.isDirectory()) {
          fs.mkdirSync(targetPath)
          copyDir(filePath, targetPath)
        } else {
          fs.copyFileSync(filePath, targetPath)
        }
      })
    }
  }
}

export function logError(msg: string) {
  console.log(chalk.red(msg))
}

export function logSuccess(msg: string) {
  console.log(chalk.green(msg))
}