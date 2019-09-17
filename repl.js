#!/usr/bin/env node
const lo = require('lodash')
const Repl = require('repl')

const repl = Repl.start('> ')
if (repl.setupHistory) {
  repl.setupHistory('.node_repl_history', (err, r) => {
    if (err) console.log(err)
  })
}

repl.context.process.env = {
  ...repl.context.process.env,
  NODE_ENV: 'development',
  DEBUG: 'app:*',
  DEBUG_COLORS: true
}

repl.context.lo = lo
repl.context.log = require('debug')('app:repl')
repl.context.index = require('./index')
