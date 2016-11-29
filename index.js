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

var byline = require('byline'),
    map = require('through2-map');

var TIME_MATCH = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/,
    NICK_MATCH = /([@|~|&|%|+]?\S+)/,
    HOST_MATCH = /([A-Za-z0-9\-\.\:]{1,63})/,
    CHAN_MATCH = /([&|#|\!|\+]\S+)/,
    TOPIC_MATCH = new RegExp('Topic for ' + CHAN_MATCH.source + ' is \\"(.*)"$'),
    POP_CHAN_MATCH = new RegExp('^Channel ' + CHAN_MATCH.source + ': (\\d+) ' +
                                'nicks? \\((\\d+) ops?, (\\d+) halfops?, ' +
                                '(\\d+) voices?, (\\d+) normals?\\)$'),
    CREATE_CHAN_MATCH = new RegExp('Channel created on (.*)$'),
    SET_TOPIC_MATCH = new RegExp(NICK_MATCH.source + ' has changed topic for ' +
                                 CHAN_MATCH.source + ' (:?from "(.*?)"\\s*)?' +
                                 'to "(.*?)"$'),
    SET_NICK_MATCH = new RegExp('^' + NICK_MATCH.source + ' is now known as ' +
                                NICK_MATCH.source);
    PRE_MATCH = new RegExp('^' + NICK_MATCH.source + ' \\((.+?)@' +
                           HOST_MATCH.source + '\\) has'),
    COMMENT_MATCH = new RegExp('(:?\\s*\\(?(.*)\\))?$'),
    JOIN_MATCH = new RegExp(PRE_MATCH.source + ' joined ' + CHAN_MATCH.source),
    PART_MATCH = new RegExp(PRE_MATCH.source + ' left ' + CHAN_MATCH.source +
                            COMMENT_MATCH.source),
    QUIT_MATCH = new RegExp(PRE_MATCH.source + ' quit' + COMMENT_MATCH.source),
    KICK_MATCH = new RegExp('^' + NICK_MATCH.source + ' has kicked ' +
                            NICK_MATCH.source + COMMENT_MATCH.source),
    MODE_MATCH = new RegExp('^Mode ' + CHAN_MATCH.source + ' \\[([\\+|\\-]' +
                            '[A-Za-z]+)' + '\\s?' + NICK_MATCH.source +
                            '?\\] by ' + NICK_MATCH.source);

function trimFound(line, found) {
    return line.replace(found, '').trim();
}

function preMatch(match, parsed) {
    parsed.nick = match[1];
    parsed.username = match[2];
    parsed.host = match[3];
}

function parseLine(line, options) {
    var parsed = {},
        actionToken, original, match;

    options = options || {};

    if (options.timeFormat) {
        parsed.time = line.match(new RegExp('^' + options.timeFormat.source));
    } else {
        parsed.time = line.match(TIME_MATCH);
    }

    actionToken = options.actionToken || '*';

    if (!parsed.time || !parsed.time[1]) {
        return;
    } else {
        line = trimFound(line, parsed.time[1]);
        parsed.time = new Date(parsed.time[1]);
    }

    original = line.slice();
    line = line.trim();

    if (line.split(' ')[0] === actionToken) {
        parsed.action = 'action';
        line = line.replace(actionToken, '').trim();
        parsed.nick = line.match(new RegExp('^' + NICK_MATCH.source +
                                            '\\s+'));
        parsed.nick = parsed.nick ? parsed.nick[1] : null;
        parsed.message = trimFound(line, parsed.nick);
        return parsed;
    }

    line = line.replace(/^\S+\s/, '').trim();

    if (JOIN_MATCH.test(line)) {
        parsed.action = 'join';
        match = line.match(JOIN_MATCH);
        preMatch(match, parsed);
        parsed.channel = match[4];
    } else if (PART_MATCH.test(line)) {
        parsed.action = 'part';
        match = line.match(PART_MATCH);
        preMatch(match, parsed);
        parsed.channel = match[4];
        parsed.message = match[5] ? match[5].slice(2, -1) : '';
    } else if (QUIT_MATCH.test(line)) {
        parsed.action = 'quit';
        match = line.match(QUIT_MATCH);
        preMatch(match, parsed);
        parsed.message = match[4] ? match[4].slice(2, -1) : '';
    } else if (KICK_MATCH.test(line)) {
        parsed.action = 'kick';
        match = line.match(KICK_MATCH);
        parsed.nick = match[1];
        parsed.target = match[2];
        parsed.message = match[3] ? match[3].slice(2, -1) : '';
    } else if (TOPIC_MATCH.test(line)) {
        parsed.action = 'topic';
        match = line.match(TOPIC_MATCH);
        parsed.channel = match[1];
        parsed.topic = match[2];
    } else if (POP_CHAN_MATCH.test(line)) {
        parsed.action = 'populate';
        match = line.match(POP_CHAN_MATCH);
        parsed.channel = match[1];
        parsed.nicks = +match[2] || 0;
        parsed.ops = +match[3] || 0;
        parsed.halfops = +match[4] || 0;
        parsed.voices = +match[5] || 0;
        parsed.normals = +match[6] || 0;
    } else if (CREATE_CHAN_MATCH.test(line)) {
        parsed.action = 'channel-created';
        match = line.match(CREATE_CHAN_MATCH);
        parsed.createdTime = new Date(match[1]);
    } else if (SET_TOPIC_MATCH.test(line)) {
        parsed.action = 'set-topic';
        match = line.match(SET_TOPIC_MATCH);
        parsed.nick = match[1];
        parsed.channel = match[2];
        parsed.topic = match[4];
        parsed.to = match[5];
    } else if (SET_NICK_MATCH.test(line)) {
        parsed.action = 'set-nick';
        match = line.match(SET_NICK_MATCH);
        parsed.nick = match[1];
        parsed.to = match[2];
    } else if (MODE_MATCH.test(line)) {
        parsed.action = 'mode';
        match = line.match(MODE_MATCH);
        parsed.channel = match[1];
        parsed.mode = match[2];
        parsed.target = match[3];
        parsed.nick = match[4];
    } else {
        parsed.action = 'privmsg';
        parsed.nick = original.match(new RegExp('^' + NICK_MATCH.source +
                                                '\\s+'));
        parsed.nick = parsed.nick ? parsed.nick[1] : null;
        parsed.message = trimFound(line, parsed.nick);
    }

    return parsed;
}

module.exports.parseLine = parseLine;

module.exports.fromStream = function (source, options) {
    var parsed = map({ objectMode: true }, function (line) {
        return parseLine(line.toString(), options);
    });

    byline.createStream(source).pipe(parsed);

    return parsed;
};
