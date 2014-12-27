#!/bin/bash

url=`cat /vagrant/url`
cd /tmp
wget $url
sudo apt-get install libcap-ng-utils
sudo dpkg -i *.deb
path=`cat /vagrant/path`
settingsPath="/opt/wakanda-enterprise/bin/Resources/Default Solution/Admin/Settings/ServerAdmin.waSettings"
settings=`cat "$settingsPath"`
settings=${settings/SSLMandatory=\"true\"/SSLMandatory=\"false\"}
sudo echo $settings > "$settingsPath"
sudo wakanda-enterprise --daemon --solution="/vagrant/$path"