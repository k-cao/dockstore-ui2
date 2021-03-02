// tslint:disable:max-line-length
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'ng2-ui-auth';
import { finalize } from 'rxjs/operators';
import { Dockstore } from '../../../shared/dockstore.model';
import { MetadataService } from '../../../shared/swagger';
import { GA4GHService } from './../../../shared/swagger/api/gA4GH.service';
import { Metadata } from './../../../shared/swagger/model/metadata';

@Component({
  selector: 'app-downloadcliclient',
  templateUrl: './downloadcliclient.component.html',
  styleUrls: ['./downloadcliclient.component.scss'],
})
export class DownloadCLIClientComponent implements OnInit {
  public downloadCli = 'dummy-start-value';
  public dockstoreVersion = 'dummy-start-value';
  public dsToken = 'dummy-token';
  public dsServerURI: any;
  public isCopied2: boolean;
  public textDataRequirements = '';
  public textDataMacOs = '';
  public textDataUbuntuLinux = '';
  public textDataCLIConfig = '';
  public textDataConfirmInstallation = '';
  public textDataInstallCLI = '';
  private cwltoolVersion = '';
  constructor(private authService: AuthService, private metadataService: MetadataService, private gA4GHService: GA4GHService) {}

  ngOnInit() {
    if (this.authService.getToken()) {
      this.dsToken = this.authService.getToken();
    }
    this.dsServerURI = Dockstore.API_URI;
    this.isCopied2 = false;
    let apiVersion = 'unreachable';
    this.gA4GHService.metadataGet().subscribe(
      (resultFromApi: Metadata) => {
        apiVersion = resultFromApi.version;
        this.dockstoreVersion = `${apiVersion}`;
        this.downloadCli = `https://github.com/dockstore/dockstore/releases/download/${apiVersion}/dockstore`;
        this.metadataService
          .getRunnerDependencies(apiVersion, '3', 'cwltool', 'json')
          .pipe(finalize(() => this.generateMarkdown()))
          .subscribe(
            (json: any) => {
              if (json) {
                this.cwltoolVersion = json.cwltool;
              }
            },
            (err) => {
              console.log('Unable to retrieve requirements.txt file.');
            }
          );
      },
      (error) => {
        this.generateMarkdown();
      }
    );
  }
  generateMarkdown(): void {
    this.textDataRequirements = `
### Setup Command Line Interface
------------------------------
Setup our Dockstore CLI application to start launching workflows from the command line.

#### Requirements
1. Linux/Ubuntu (Recommended - Tested on 18.04.3 LTS) or Mac OS X machine
2. Java 11 (Tested with OpenJDK 11, Oracle JDK may work but is untested)
3. Python3 and pip3 (Required if working with CWL, optional otherwise)
    `;

    this.textDataUbuntuLinux = `
#### Part 1 - Install dependencies
1. Install Java 11 (This example installs OpenJDK 11)
\`\`\`
sudo add-apt-repository ppa:openjdk-r/ppa \
&& sudo apt-get update -q \
&& sudo apt install -y openjdk-11-jdk
\`\`\`
2. Install Docker following the instructions on [Docker's website](https://docs.docker.com/install/linux/docker-ce/ubuntu/). You should have at least version 19.03.1 installed.
Ensure that you are able to run Docker without using sudo directly with the
[post install instructions](https://docs.docker.com/engine/installation/linux/linux-postinstall/#manage-docker-as-a-non-root-user).
\`\`\`
sudo usermod -aG docker $USER
exec newgrp docker
\`\`\`

`;
    this.textDataMacOs = `
#### Part 1 - Install dependencies
1. We'll cover two ways to install Java 11. One way is to download the JDK for MacOS from [OpenJDK](https://jdk.java.net/archive/) and executing the following commands.
\`\`\`
// put the JDK in its standard location
sudo mv jdk-11.0.2.jdk /Library/Java/JavaVirtualMachines/ \n\n // List the JDKs that are installed; you should see version 11
/usr/libexec/java_home -V \n\n // If you need to switch to Java 11, run the following
/usr/libexec/java_home -v 11.0.2 \n\n // Check that if $JAVA_HOME is set to the correct JDK. Should look similar to /Library/Java/JavaVirtualMachines/jdk-11.0.2.jdk/Contents/Home/
echo $JAVA_HOME/ \n \n // If it is not check your .bashrc or .bash_profile to find out where it is being set. Fix it and/or source the correct one.
/usr/libexec/java_home \n\n // Use the output from the above command and run
export JAVA_HOME={OUTPUT FROM ABOVE COMMAND} \n\n // Check that the default version is JDK 11
java -version
\`\`\`

2. Or to install using Homebrew, execute the following commands:
\`\`\`
brew tap AdoptOpenJDK/openjdk
brew cask install adoptopenjdk11
java -version
\`\`\`

3. Install Docker following the instructions on [Docker's website](https://docs.docker.com/docker-for-mac/install/). You should have at least version 2.0.0.3 installed.
    `;

    this.textDataInstallCLI = `
#### Part 2 - Install Dockstore CLI
1. Install the dockstore command-line program and add it to the path.
\`\`\`
mkdir -p ~/bin
curl -L -o ~/bin/dockstore ${this.downloadCli}
chmod +x ~/bin/dockstore
echo 'export PATH=~/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
\`\`\`
2. Alternatively, click here to download and configure the CLI yourself.
    `;

    this.textDataCLIConfig = `
#### Part 2 - Setup Dockstore CLI Config
1. Create the folder \`~/.dockstore\` and create a configuration file \`~/.dockstore/config\`:
\`\`\`
mkdir -p ~/.dockstore
printf "token: ${this.dsToken}\\nserver-url: ${this.dsServerURI}\\n" > ~/.dockstore/config
\`\`\`
2. Alternatively, copy this content to your config file directly.
`;
    this.textDataConfirmInstallation = `
#### Part 3 - Confirm installation
1. Run our dependencies to verify that they have been installed properly.
\`\`\`
$ java -version
openjdk version "11.0.4" 2019-07-16
OpenJDK Runtime Environment (build 11.0.4+11-post-Ubuntu-1ubuntu218.04.3)
OpenJDK 64-Bit Server VM (build 11.0.4+11-post-Ubuntu-1ubuntu218.04.3, mixed mode, sharing)
$ dockstore --version
Dockstore version ${this.dockstoreVersion}
$ docker run hello-world
Hello from Docker!
...
\`\`\`

#### Part 4 - Install cwltool (Optional)
Dockstore relies on [cwltool](https://github.com/common-workflow-language/cwltool) -a reference implementation of CWL- for local execution of tools and workflows described with CWL.
You'll need to have Python 3 and [pip3](https://pip.pypa.io/en/latest/installing/) to be installed on your machine.

**Note:** cwltool must be available on your PATH.

You can install the version of cwltool that we've tested for use with Dockstore using the following commands:
1. Run this to verify that pip has been installed \`pip3 --version\`
2. Run these commands to install cwltool
\`\`\`
curl -o requirements.txt "${this.dsServerURI}/metadata/runner_dependencies?client_version=${this.dockstoreVersion}&python_version=3"
pip3 install -r requirements.txt
\`\`\`
3. Verify using \`pip3 list\` that the installed pip packages match the ones specified in the downloaded requirements.txt. Confirm cwltool installation by checking the version.
\`\`\`
$ cwltool --version
/usr/local/bin/cwltool ${this.cwltoolVersion}
\`\`\`

#### Part 5 - Install Nextflow (Optional)
The Dockstore CLI does not run Nextflow workflows. Users must run them directly by using the Nextflow command line tool.
1. You can install the Nextflow CLI with the following command:
\`\`\`
// Creates a file nextflow in the current directory
curl -s https://get.nextflow.io | bash
\`\`\`
2. We recommend that you add this command to your PATH so that you can run it from anywhere.
`;
  }
}
