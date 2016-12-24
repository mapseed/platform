#!/bin/bash

node_sass_args="src/sa_web/static/scss/default.scss --output-style expanded -o src/sa_web/static/css/ --source-map true --importer scripts/compass-importer.js"

case $1 in
    -w)
        echo "running node sass watch"
        node-sass $1 $node_sass_args &
        ;;
    *)
        echo "running node sass build"
        node-sass $node_sass_args
        ;;
esac
