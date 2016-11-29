# weechat-log
Stream plaintext [WeeChat](https://weechat.org/) logs into semantic objects.

## Install

For the command-line program:

    $ sudo npm install -g weechat-log

For the module:

    $ npm install --save weechat-log

## Usage
```
usage: weechat-log [-nsedfjh] <log filenames>

  -n, --nicks    nicks separated by commas to filter
  -s, --start    start date (in any format accepted by Date)
  -e, --end      end date (in any format accepted by Date)
  -d, --date     date format
  -f, --format   line output format
  -j, --json     output in JSON format (overrides format)
  -h, --help     show this screen

<log filenames> are optional. stdin is used by default.
```

    $ weechat-log ~/.weechat/logs/* -f '{action}:{message}'
    $ weechat-log -f '{ops}:{halfops}:{nicks}' < ~/.weechat/logs/*

## Example
See https://github.com/misterhat/weechat-log/blob/master/test.js

## API
### weechatLog.parseLine(line)
Parse a single line string into an object.

### weechatLog.fromStream(stream)
Create an object stream out of an existing `ReadableStream`.

## License
Copyright (C) 2016 Mister Hat

This library is free software; you can redistribute it and/or modify it under
the terms of the GNU Lesser General Public License as published by the Free
Software Foundation; either version 3.0 of the License, or (at your option) any
later version.

This library is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
