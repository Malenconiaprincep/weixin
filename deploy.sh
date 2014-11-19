#!/bin/bash

# mkdir -p /data/www/vhosts/browser/$version
# cp -rf dist/* /data/www/vhosts/browser/$version
env=`echo $NODE_ENV`
git pull

if [ $env = "test" ]; then
  jade="views/common/version.jade"
  version=`date +"%Y%m%d%H%M%S"`
  ssh root@192.168.1.13 "mkdir /data/www/vhosts/browser/$version"
  scp -r dist/* root@192.168.1.13:/data/www/vhosts/browser/$version
  echo $version
  #node deploy/ksyun.js $version

  echo "if __env.NODE_ENV === 'production' || __env.NODE_ENV === 'test'" > $jade
  #echo "  - var staticBase = 'http://kssws.ks-cdn.com/files/$version/browser/'" >> $jade
  echo "  - var staticBase = 'http://cdn.tvall.cn/browser/$version/'" >> $jade
  echo "else" >> $jade
  echo "  - var staticBase = '/'" >> $jade

  git add $jade
  git commit -m 'update version'
  git push
fi

qns reload
