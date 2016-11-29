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
    mergeStream = require('merge-stream'),
    weechatLog = require('./'),

    package = require('./package.json');

var argv = require('minimist')(process.argv.slice(2));

var nicks = argv.n || argv.nicks,
    start = argv.s || argv.start,
    end = argv.e || argv.end,
    dateFormat = argv.d || argv.datef,
    useFormat = ((argv.j || argv.json ? 'json' : null) || argv.f ||
                 argv.format || '{message}'),
    help = argv.h || argv.help,
    files = argv._,
    input, parsed, emptyFormat, stringify;

if (help) {
    console.log('usage: ' + package.name + ' [-nsedfjh] <log filenames>\n');
    console.log('  -n, --nicks    nicks separated by commas to filter')
    console.log('  -s, --start    start date (in any format accepted by Date)');
    console.log('  -e, --end      end date (in any format accepted by Date)');
    console.log('  -d, --date     date format');
    console.log('  -f, --format   line output format');
    console.log('  -j, --json     output in JSON format (overrides format)');
    console.log('  -h, --help     show this screen\n');
    console.log('<log filenames> are optional. stdin is used by default.');
    return;
}

input = mergeStream();
parsed = weechatLog.fromStream(input);

if (files.length) {
    files.forEach(function (file) {
        input.add(fs.createReadStream(file, { encoding: 'utf8' }));
    });
} else {
    input.add(process.stdin);
}

if (useFormat === 'json') {
    console.log('[');
} else {
    emptyFormat = useFormat.replace(/\{.*?\}/g, '').length;
}

parsed.on('data', function (entry) {
    var formatted;

    if (useFormat === 'json') {
        console.log(JSON.stringify(entry) + ',');
    } else {
        if (dateFormat) {
            entry.time = datef(dateFormat, entry.time);
        }

        formatted = format(useFormat, entry).trim();

        if (formatted.length > emptyFormat) {
            console.log(formatted);
        }
    }
});

if (useFormat === 'json') {
    parsed.on('end', function () {
        console.log(']');
    });
}
