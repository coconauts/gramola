# Gramola

Gramola is a lightweight web music player, written in pure Javascript.

- Node.js and the [Express framework](http://expressjs.com/) for the backend
- JQuery and [JPlayer](http://jplayer.org/) for the frontend
- Powered by a Sqlite database

## Key features

- Accepts mp3 and ogg files.
- Prepared to deal with huge collections of music.
- Minimal overhead. Runs neatly on a Raspberry Pi!
- "Files and folders over MD5 tags" philosophy.
- Responsive interface that looks pretty even on phones.
- Easily find folders, or set them to play in infinite random mode.
- Favorite or blacklist songs, and make your own buckets.
- Your music is private by default, but you can easily share it.

## Install

Gramola depends on `nodejs` and `sqlite3` being installed
in your system. For debian-based distributions this can be achieved with:

    sudo apt-get install nodejs sqlite3

Then clone this repository, and install the required node packages with:

    npm install

## Run

First run the server with:

    node app.js

Now you an access the client web interface on http://localhost:8890

The first time you access the webapp you will be presented with a form
to create the admin user and point to your music folder.

After this is done, you'll be redirected to the Gramola interface.
You should see your music collection on the right side. Click on some songs
to add them to the playlist on the left side, and start listening!

## Configuration

Gramola makes use of the [node-env-file](https://github.com/grimen/node-env-file)
format for loading configuration.

You can either set up the configuration as environment variables in your shell,
or have an `.env` file at the root of the repo containing them in bash format.

The repo includes an example configuration file in `env_sample`. You can
make a copy of this file and then edit it to suit your needs:

    cp env_sample .env
    nano .env  # or your editor of choice

## Troubleshoot

### Installation woes

Gramola has been developed to work fine under Node `0.10.x`. Newer versions
of Node might work, but are untested.

If you are having trouble with the version of node coming with your system,
you can use a [`nodeev`](https://github.com/ekalinin/nodeenv) to install
the correct one:

    nodeenv --node=0.10.25 --prebuilt env-0.10.25-prebuilt

You might also be able to fix the installation in newer versions of node
by installing the `node-gyp` package. For Ubuntu you would do:

    npm install -g node-gyp

### Forcing the database to update

All of your music collection is indexed into an sqlite database to allow
for cool stuff such as searches or the random mode to be possible.

The server auto-syncs the database to the music collection at regular intervals
(by default every 5 minutes, but this can be adjusted via configuration).
However, in-between intervals it may happen that you notice that certain
functions of the player are not up to date with your collection, if you made
recent changes to it.

You can force a sync of the collection by hitting the `/collection/refresh`
endpoint:

    curl http://localhost:8890/collection/refresh

If all goes well, you will see this:

    {"error": false}

## Contribute

If you wish to contribute simply raise a pull request or open a ticket
to report any issues. Whatever your contribution it will be very welcome!
