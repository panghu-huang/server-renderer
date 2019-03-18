import * as http from 'http'
import * as cheerio from 'cheerio'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { genWebpackConfig } from './webpack-config'
import { getConfig } from './config'
import chalk from 'chalk'

const config = getConfig()
