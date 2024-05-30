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

import * as jsonpatch from 'fast-json-patch'
import { getValueByPointer, applyPatch } from 'fast-json-patch'
import { ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import { BASIC_FIELDS, BASIC_FIELD_MAPPING, BASIC_FIELD_PARENT_PATH } from './constants'
import { BasicFieldErrorObj, DeploymentConfigStateAction, DeploymentConfigStateActionTypes } from './types'
import { ValidationRules } from './validationRules'

const validationRules = new ValidationRules()

export const validateBasicView = (basicFieldValues: Record<string, any>): BasicFieldErrorObj => {
    const _portValidation = validationRules.port(Number(basicFieldValues[BASIC_FIELDS.PORT]))
    const _cpuValidation = validationRules.port(
        basicFieldValues[BASIC_FIELDS.RESOURCES]?.[BASIC_FIELDS.LIMITS]?.[BASIC_FIELDS.CPU],
    )
    const _memoryValidation = validationRules.port(
        basicFieldValues[BASIC_FIELDS.RESOURCES]?.[BASIC_FIELDS.LIMITS]?.[BASIC_FIELDS.MEMORY],
    )
    const _basicFieldErrorObj = {
        isValid: _portValidation.isValid && _cpuValidation.isValid && _memoryValidation.isValid,
        port: _portValidation,
        cpu: _cpuValidation,
        memory: _memoryValidation,
        envVariables: [],
    }
    for (let index = 0; index < basicFieldValues[BASIC_FIELDS.ENV_VARIABLES]?.length; index++) {
        const element = basicFieldValues[BASIC_FIELDS.ENV_VARIABLES][index]
        const _envVariableValidation = validationRules.envVariable(element)
        _basicFieldErrorObj.envVariables.push(_envVariableValidation)
        _basicFieldErrorObj.isValid = _basicFieldErrorObj.isValid && _envVariableValidation.isValid
    }
    return _basicFieldErrorObj
}

export const handleConfigProtectionError = (
    action: number,
    err: any,
    dispatch: (value: DeploymentConfigStateAction) => void,
    reloadEnvironments: () => void,
): void => {
    if (err?.code === 423) {
        if (action === 3) {
            dispatch({ type: DeploymentConfigStateActionTypes.toggleDeleteOverrideDraftModal })
        } else {
            dispatch({ type: DeploymentConfigStateActionTypes.toggleSaveChangesModal })
        }
        reloadEnvironments()
        return
    }
    showError(err)
}

export function groupDataByType(data) {
    // Create a Map to store grouped objects by type
    const groupedData = new Map()

    // Iterate through the data and group objects by type
    data.forEach((item) => {
        const { type } = item

        if (!groupedData.has(type)) {
            groupedData.set(type, [])
        }

        groupedData.get(type).push(item)
    })

    // Convert the grouped data into an array of arrays
    return [...groupedData.values()]
}

export function formatTimestamp(jsonTimestamp) {
    // Parse the JSON timestamp using Moment.js
    const timestamp = moment(jsonTimestamp)

    // Define the desired output format
    return timestamp.format('ddd, MMM YYYY, hh:mm A')
}

export function textDecider(option, charts) {
    let text

    switch (option.type) {
        case 1:
            text = `v${option.chartVersion} (Default)`
            break

        case 2:
        case 4:
            const c = charts.find((chart) => chart.value === option.chartRefId)
            text = `${option.environmentName ? option.environmentName : ''} ${
                option.chartVersion ? `(v${option.chartVersion})` : `(${c?.label.split(' ')[0]})`
            }`
            break

        case 3:
            const c3 = charts.find((chart) => chart.value === option.chartRefId)
            text = `${formatTimestamp(option.finishedOn)} ${
                option.chartVersion ? `(v${option.chartVersion})` : `(${c3?.label.split(' ')[0]})`
            }`
            break

        default:
            text = ''
            break
    }
    return text
}

export const getPosition = (isValues: boolean, isEnv: boolean, type: number) => {
    if (isValues && isEnv) {
        if (type === 3) {
            return 1
        }
        if (type === 2) {
            return 2
        }
        if (type === 1) {
            return 3
        }
    } else if (isValues) {
        if (type === 2) {
            return 1
        }
        if (type === 1) {
            return 2
        }
    } else if (isEnv) {
        if (type === 3) {
            return 1
        }
        if (type === 4) {
            return 2
        }
        if (type === 2) {
            return 3
        }
    } else {
        if (type === 4) {
            return 1
        }
        if (type === 2) {
            return 2
        }
    }
}
