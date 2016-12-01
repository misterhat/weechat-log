#!/usr/bin/env node
/*
 * weechat-log - stream plaintext weechat logs into objects
 * Copyright (C) 2016 Mister Hat
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 */

var fs = require('fs'),
    datef = require('datef'),
    format = require('string-template'),
    byline = require('byline'),
    mergeStream = require('merge-stream'),
    filter = require('through2-filter').obj,
    map = require('through2-map').obj,
    parseLine = require('./').parseLine,
    package = require('./package.json');

var opts = {
  string: ['nicks', 'date', 'format'],
  boolean: ['help', 'json'],
  alias: {
    n: 'nicks',
    d: 'date',
    f: 'format',
    j: 'json',
    h: 'help'
  }
};

var fromStream = function (source) {
  var parsed = map(function (line) {
    return parseLine(line.toString());
  });
  
  byline.createStream(source).pipe(parsed);
  return parsed;
};

var argv = require('minimist')(process.argv.slice(2), opts);

var files = argv._,
  nicks = argv.nicks && argv.nicks.indexOf(',') > -1 ? argv.nicks.split(',') : argv.nicks,
  useFormat = argv.format || '{message}',
  input, parsed;

if (argv.help) {
    console.log('usage: ' + package.name + ' [-ndfjh] <log filenames>\n');
    console.log('  -n, --nicks    nicks separated by commas to filter');
    console.log('  -d, --date     date format');
    console.log('  -f, --format   line output format');
    console.log('  -j, --json     output in JSON format (overrides format)');
    console.log('  -h, --help     show this screen\n');
    console.log('<log filenames> are optional. stdin is used by default.');
    return;
}

input = mergeStream();
parsed = fromStream(input);

if (files && files.length >= 1 && files !== '-') {
    files.forEach(function (file) {
        input.add(fs.createReadStream(file, { encoding: 'utf8' }));
    });
} else {
    input.add(process.stdin);
}

if (!argv.format) {
  parsed = parsed.pipe(filter(function (entry) {
    if (nicks) {
      return (Array.isArray(nicks) ? nicks.indexOf(entry.nick) > -1 : nicks === entry.nick) && entry.action === 'privmsg' && entry.message;
    }

    return entry.action === 'privmsg' && entry.message;
  }))
}

parsed.pipe(map(function (entry) {
  if (argv.date) {
    entry.time = datef(argv.date, entry.time);
  } 
  
  if (argv.json) {
    return JSON.stringify(entry) + '\n';
  }
  
  var emptyFormat = useFormat.replace(/\{.*?\}/g, '');
  var formatted = format(useFormat, entry).trim();
    
  if (formatted.length > emptyFormat.length) {
    return formatted + '\n';
  }

  return '';
})).pipe(process.stdout);
