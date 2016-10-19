#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('child_process');

const cwd = __dirname;

console.log('Starting mongodb export.');

execSync(`
    git clone git@github.com:circlecell/dnslookup-backup.git dnslookup-backup &&
    mongoexport --db dnslookup --collection domains --out dnslookup-backup/domains.json &&
    cd dnslookup-backup &&
    git config user.email "andrey.a.gubanov@gmail.com" &&
    git config user.name "Andrey Gubanov (his digital clone)" &&
    git add . &&
    git commit -m "${new Date().toUTCString()}" 2>&1
    git push origin master &&
    cd .. &&
    rm -rf dnslookup-backup
`, { cwd });

console.log('Done mongodb export.');
