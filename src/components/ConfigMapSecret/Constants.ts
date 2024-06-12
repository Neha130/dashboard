/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const EXTERNAL_INFO_TEXT = {
    secret: {
        title: 'Mount Existing Kubernetes Secret',
        infoText:
            'Secret will not be created by system. However, they will be used inside the pod. Please make sure that secret with the same name is present in the environment.',
    },
    configmap: {
        title: 'Using External Configmaps',
        infoText:
            'Configmap will not be created by system. However, they will be used inside the pod. Please make sure that configmap with the same name is present in the environment',
    },
}

export const ConfigMapSecretUsageMap = {
    environment: { title: 'Environment Variable', value: 'environment' },
    volume: { title: 'Data Volume', value: 'volume' },
}

export enum CM_SECRET_STATE {
    BASE = '',
    INHERITED = 'Inheriting',
    OVERRIDDEN = 'Overridden',
    ENV = 'Env',
    UNPUBLISHED = 'UNPUBLISHED',
}

export const SECRET_TOAST_INFO = {
    BOTH_STORE_AVAILABLE: 'Please use either secretStore or secretStoreRef',
    CHECK_KEY_SECRET_KEY: 'Please check key and secretKey',
    BOTH_STORE_UNAVAILABLE: 'Please provide secretStore or secretStoreRef',
    CHECK_KEY_NAME: 'Please check key and name',
}
