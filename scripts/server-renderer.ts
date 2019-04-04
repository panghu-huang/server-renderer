#!/usr/bin/env node
import * as program from 'commander'

program
  .command('dev')
  .description('启动开发服务器')
  .action(function () {
    require('./dev')
  })

program
  .command('build')
  .description('编译打包代码')
  .action(function () {
    require('./build')
  })


program
  .command('start')
  .description('启动正式服务')
  .action(function () {
    require('./start')
  })


program.parse(process.argv)