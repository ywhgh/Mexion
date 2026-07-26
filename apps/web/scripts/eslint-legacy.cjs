#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
process.env.ESLINT_USE_FLAT_CONFIG = 'false'
const path = require('node:path')
const eslintPkg = require.resolve('eslint/package.json')
require(path.join(path.dirname(eslintPkg), 'bin', 'eslint.js'))
