#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset
set -o xtrace
# Uncomment this to use the actual Dockstore webservice from the package.json
# JAR_PATH="https://artifacts.oicr.on.ca/artifactory/collab-release/io/dockstore/dockstore-webservice/${npm_package_config_webservice_version}/dockstore-webservice-${npm_package_config_webservice_version}.jar"
# Uncomment this to use the CircleCI jar
JAR_PATH="https://6704-33383826-gh.circle-artifacts.com/0/tmp/artifacts/dockstore-webservice-1.11.0-alpha.0-SNAPSHOT.jar"

wget -O dockstore-webservice.jar --no-verbose --tries=10 ${JAR_PATH}
chmod u+x dockstore-webservice.jar
psql -h localhost -c "create user dockstore with password 'dockstore' createdb;" -U postgres
psql -h localhost -c "ALTER USER dockstore WITH superuser;" -U postgres
psql -h localhost -c 'create database webservice_test with owner = dockstore;' -U postgres
psql -h localhost -f travisci/db_dump.sql webservice_test -U postgres
java -jar dockstore-webservice.jar db migrate -i 1.5.0,1.6.0,1.7.0,add_service_1.7.0,alter_test_user_1.7.0,1.8.0,1.9.0,1.10.0 travisci/web.yml

