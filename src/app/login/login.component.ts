/*
 *    Copyright 2017 OICR
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
import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';

import { RegisterService } from '../register/register.service';
import { TrackLoginService } from '../shared/track-login.service';
import { UserService } from '../shared/user/user.service';
import { LoginService } from './login.service';
import { acceptedTOSVersion, currentTOSVersion } from '../shared/constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  faGithub = faGithub;
  faGoogle = faGoogle;
  public tabindex: number;
  public registrationDisabled = true;
  public loginDisabled = true;
  public mustAcceptCurrentTOS: boolean;
  constructor(
    private trackLoginService: TrackLoginService,
    private loginService: LoginService,
    private registerService: RegisterService,
    private router: Router,
    private userService: UserService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    if (this.router.url.includes('register')) {
      this.tabindex = 1;
    } else {
      this.tabindex = 0;
    }
    iconRegistry.addSvgIcon('google', sanitizer.bypassSecurityTrustResourceUrl('../assets/svg/btn_google_light_normal_ios.svg'));
  }

  ngOnInit(): void {
    const usersTosVersion = localStorage.getItem(acceptedTOSVersion);
    if (usersTosVersion == null || usersTosVersion != currentTOSVersion) {
      this.mustAcceptCurrentTOS = true;
    } else {
      this.loginDisabled = false;
    }
  }

  private login(observable, page: string) {
    observable.subscribe(
      (response) => {
        this.trackLoginService.switchState(true);
        this.userService.getUser();
        this.router.navigate([page]);
      },
      (error) => {
        console.log('Authentication error: ' + error);
      }
    );
  }

  /**
   * Login to Dockstore account with a third party service
   *
   * @param {string} service 'github' or 'google'
   * @memberof LoginComponent
   */
  loginWith(service: string): void {
    this.login(this.loginService.authenticate(service), '/');
  }

  /**
   * Register a new Dockstore account with a third party service
   *
   * @param {string} service 'github' or 'google'
   * @memberof LoginComponent
   */
  registerWith(service: string): void {
    this.login(this.registerService.authenticate(service), '/onboarding');
  }
}
