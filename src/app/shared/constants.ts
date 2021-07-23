/*
 *     Copyright 2018 OICR
 *
 *     Licensed under the Apache License, Version 2.0 (the "License")
 *     you may not use this file except in compliance with the License
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */

import { User } from './openapi/model/user';

export const ga4ghPath = '/ga4gh/trs/v2';
export const ga4ghExtendedPath = '/api/ga4gh/v2/extended';
export const formInputDebounceTime = 250;
export const ga4ghWorkflowIdPrefix = '#workflow/';
export const ga4ghServiceIdPrefix = '#service/';
export const includesValidation = 'validations';
export const includesVersions = 'versions';
export const bootstrap4smallModalSize = '300px';
export const bootstrap4mediumModalSize = '500px';
export const bootstrap4largeModalSize = '800px';
export const myBioWorkflowsURLSegment = 'my-workflows';
export const myServicesURLSegment = 'my-services';
export const myToolsURLSegment = 'my-tools';
export const bioWorkflowsURLSegment = 'workflows';
export const servicesURLSegment = 'services';
export const toolsURLSegment = 'tools';
export const altAvatarImg = 'http://www.imcslc.ca/imc/includes/themes/imc/images/layout/img_placeholder_avatar.jpg';
export const devMode = false;
export const currentTOSVersion: User.TosversionEnum = User.TosversionEnum.TOSVERSION2;
export const currentPrivacyPolicyVersion: User.PrivacyPolicyVersionEnum = User.PrivacyPolicyVersionEnum.PRIVACYPOLICYVERSION25;
export const dismissedLatestTOS = 'dismissedLatestTOS';
export const dismissedLatestPrivacyPolicy = 'dismissedLatestPrivacyPolicy';
export const acceptedTOSVersion = 'acceptedTOSVersion';
export const acceptedPrivacyPolicyVersion = 'acceptedPrivacyPolicyVersion';
// There is a search term length limit of 500 on the backend, but two extra characters, '.*', get counted in the backend.
export const searchTermLengthLimit = 498;
