#!/bin/bash

if [ $# -lt 1 ] ; then
    echo "usage: $0 <target directory>" >&2
    exit 1
fi

TARGET=$1

if [ ! -d "$TARGET" ] ; then
    echo "$0: '$TARGET' is not a valid directory" >&2
    exit 1
fi

mkdir -p $TARGET
cp -a osmpoi.rb oauth_enhance.rb *.erb *.css *.js *.cgi $TARGET
