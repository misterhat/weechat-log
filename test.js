var tap = require('tap'),

    weechatLog = require('./');

var logs = [
    '2016-10-18 22:56:37      *      bedroom_eyes cries',

    '2016-11-22 03:09:33     Jamal_Jones     i dont like bean peer pressured',

    '2016-11-16 15:22:24     <--     rubywoo ' +
    '(~woo@Rizon-B514316E.pools.spcsdns.net) has quit (Read error: ' +
    'Connection reset by peer)',

    '2016-11-10 11:56:03     -->     Browsing ' +
    '(~browsing@Rizon-E0C58680.lightspeed.okcbok.sbcglobal.net) has joined ' +
    '#ghetty',

    '2016-11-04 19:58:26     --      Mode #trollhour [-q marley] by Sexy',

    '2016-11-21 20:38:31     <--     hikiraka has kicked gnu (rejoin, friend)',

    '2016-11-21 20:38:31     <--     hikiraka has kicked gnu',

    '2016-11-23 14:46:15     <--     underdoge (~echapa@my.dude) has left ' +
    '#ghetty',

    '2016-11-23 14:46:15     <--     underdoge (~echapa@my.dude) has left ' +
    '#ghetty (WeeChat 1.5)',

    '2016-11-26 09:41:41     --      Topic for #pigeonhole is "spread the ' +
    'word"',

    '2016-10-08 01:43:45     --      Channel #ghetty: 35 nicks (2 ops, 0 ' +
    'halfops, 1 voice, 32 normals)',

    '2016-11-02 18:27:18     --      vegetable has changed topic for ' +
    '#weblove to "Uh-ah-oh we need some help from above"',

    '2016-11-11 17:09:06     --      goku has changed topic for #weblove ' +
    'from "Uh-ah-oh we need some help from above" to "Now offering ' +
    'complimentary therapy dogs"'
];

var parsed = [
    {
        time: new Date('2016-10-19T03:56:37.000Z'),
        action: 'action',
        nick: 'bedroom_eyes',
        message: 'cries'
    },
    {
        time: new Date('2016-11-22T09:09:33.000Z'),
        action: 'privmsg',
        nick: 'Jamal_Jones',
        message: 'i dont like bean peer pressured'
    },
    {
        time: new Date('2016-11-16T21:22:24.000Z'),
        action: 'quit',
        nick: 'rubywoo',
        username: '~woo',
        host: 'Rizon-B514316E.pools.spcsdns.net',
        message: 'Read error: Connection reset by peer'
    },
    {
        time: new Date('2016-11-10T17:56:03.000Z'),
        action: 'join',
        nick: 'Browsing',
        username: '~browsing',
        host: 'Rizon-E0C58680.lightspeed.okcbok.sbcglobal.net',
        channel: '#ghetty'
    },
    {
        time: new Date('2016-11-05T00:58:26.000Z'),
        action: 'mode',
        channel: '#trollhour',
        mode: '-q',
        target: 'marley',
        nick: 'Sexy'
    },
    {
        time: new Date('2016-11-22T02:38:31.000Z'),
        action: 'kick',
        nick: 'hikiraka',
        target: 'gnu',
        message: 'rejoin, friend'
    },
    {
        time: new Date('2016-11-22T02:38:31.000Z'),
        action: 'kick',
        nick: 'hikiraka',
        target: 'gnu',
        message: ''
    },
    {
        time: new Date('2016-11-23T20:46:15.000Z'),
        action: 'part',
        nick: 'underdoge',
        username: '~echapa',
        host: 'my.dude',
        channel: '#ghetty',
        message: ''
    },
    {
        time: new Date('2016-11-23T20:46:15.000Z'),
        action: 'part',
        nick: 'underdoge',
        username: '~echapa',
        host: 'my.dude',
        channel: '#ghetty',
        message: 'WeeChat 1.5'
    },
    {
        time: new Date('2016-11-26T15:41:41.000Z'),
        action: 'topic',
        channel: '#pigeonhole',
        topic: 'spread the word'
    },
    {
        time: new Date('2016-10-08T06:43:45.000Z'),
        action: 'populate',
        channel: '#ghetty',
        nicks: 35,
        ops: 2,
        halfops: 0,
        voices: 1,
        normals: 32
    },
    {
        time: new Date('2016-11-02T23:27:18.000Z'),
        action: 'set-topic',
        nick: 'vegetable',
        channel: '#weblove',
        topic: null,
        to: 'Uh-ah-oh we need some help from above',
    },
    {
        time: new Date('2016-11-11T23:09:06.000Z'),
        action: 'set-topic',
        nick: 'goku',
        channel: '#weblove',
        topic: 'Uh-ah-oh we need some help from above',
        to: 'Now offering complimentary therapy dogs'
    }
];

logs.forEach(function (line, i) {
    tap.deepEqual(weechatLog.parseLine(line), parsed[i]);
});
