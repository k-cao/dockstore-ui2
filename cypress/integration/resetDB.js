/*
 *    Copyright 2018 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
beforeEach(function () {
	cy.exec('psql -c \'drop schema public cascade\' webservice_test -U dockstore', {failOnNonZeroExit: false} );
  cy.exec('psql -c \'create schema public\' webservice_test -U dockstore', {failOnNonZeroExit: false} )
  cy.exec('psql -f travisci/db_dump.sql webservice_test -U dockstore')
  cy.exec('java -jar dockstore-webservice-*.jar db migrate -i 1.5.0 travisci/web.yml')
});
