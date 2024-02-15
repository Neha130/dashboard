import React, { useState, useEffect } from 'react'
import {
    showError,
    Progressing,
    DeleteDialog,
    ResizableTextarea,
    CustomInput,
} from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import { Link, useHistory } from 'react-router-dom'
import { deepEqual } from '../../../../../components/common'

import { EntityTypes, APIRoleFilter } from '../../shared/components/userGroups/userGroups.types'
import { ACCESS_TYPE_MAP, SERVER_MODE, URLS } from '../../../../../config'
import { ReactComponent as Warning } from '../../../../../assets/icons/ic-warning.svg'
import { useMainContext } from '../../../../../components/common/navigation/NavigationRoutes'
import { PermissionType } from '../../constants'
import { PermissionGroup, PermissionGroupCreateOrUpdatePayload } from '../../types'
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/ic-delete-interactive.svg'
import { createOrUpdatePermissionGroup, deletePermissionGroup } from '../../authorization.service'
import {
    PermissionConfigurationForm,
    usePermissionConfiguration,
} from '../../shared/components/PermissionConfigurationForm'
import { isFormComplete } from '../../APITokens/authorization.utils'

const PermissionGroupForm = ({ isAddMode }: { isAddMode: boolean }) => {
    const { serverMode } = useMainContext()

    // Form States
    const {
        permissionType,
        setPermissionType,
        directPermission,
        setDirectPermission,
        chartPermission,
        k8sPermission,
        currentK8sPermissionRef,
        data: permissionGroup,
    } = usePermissionConfiguration()
    const _permissionGroup = permissionGroup as PermissionGroup

    const [name, setName] = useState({ value: '', error: '' })
    const [description, setDescription] = useState('')

    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false)

    const { push } = useHistory()

    const isSuperAdminPermission = permissionType === PermissionType.SUPER_ADMIN

    async function populateDataFromAPI(data: PermissionGroup) {
        const { name: _name, description: _description, superAdmin } = data
        setName({ value: _name, error: '' })
        setDescription(_description)
        setPermissionType(superAdmin ? PermissionType.SUPER_ADMIN : PermissionType.SPECIFIC)
    }

    useEffect(() => {
        if (_permissionGroup) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            populateDataFromAPI(_permissionGroup)
        }
    }, [_permissionGroup])

    const _redirectToPermissionGroupList = () => {
        push(URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS)
    }

    const toggleDeleteConfirmationModal = () => {
        setDeleteConfirmationModal(!deleteConfirmationModal)
    }

    function getSelectedEnvironments(permission) {
        if (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS || permission.entity === EntityTypes.JOB) {
            return permission.environment.find((env) => env.value === '*')
                ? ''
                : permission.environment.map((env) => env.value).join(',')
        }
        const allFutureCluster = {}
        let envList = ''
        permission.environment.forEach((element) => {
            if (element.clusterName === '' && element.value.startsWith('#')) {
                const clusterName = element.value.substring(1)
                allFutureCluster[clusterName] = true
                envList += `${(envList !== '' ? ',' : '') + clusterName}__*`
            } else if (element.clusterName !== '' && !allFutureCluster[element.clusterName]) {
                envList += (envList !== '' ? ',' : '') + element.value
            }
        })
        return envList
    }

    const handleGroupNameChange = (e) => setName({ value: e.target.value, error: '' })

    const handleSubmit = async () => {
        if (!name.value) {
            setName((_name) => ({ ..._name, error: 'Group name is mandatory' }))
            return
        }
        if (!isSuperAdminPermission && !isFormComplete(directPermission, setDirectPermission)) {
            return
        }
        setSubmitting(true)

        const payload: PermissionGroupCreateOrUpdatePayload = {
            id: _permissionGroup?.id || 0,
            name: name.value,
            description,
            roleFilters: [
                ...directPermission
                    .filter(
                        (permission) =>
                            permission.team?.value && permission.environment.length && permission.entityName.length,
                    )
                    .map((permission) => {
                        const _payload = {
                            ...permission,
                            action: permission.action.configApprover
                                ? `${permission.action.value},configApprover`
                                : permission.action.value,
                            team: permission.team.value,
                            environment: getSelectedEnvironments(permission),
                            entityName: permission.entityName.find((entity) => entity.value === '*')
                                ? ''
                                : permission.entityName.map((entity) => entity.value).join(','),
                            entity: permission.entity,
                            ...(permission.entity === EntityTypes.JOB && {
                                // eslint-disable-next-line no-nested-ternary
                                workflow: permission.workflow?.length
                                    ? permission.workflow.find((workflow) => workflow.value === '*')
                                        ? ''
                                        : permission.workflow.map((workflow) => workflow.value).join(',')
                                    : '',
                            }),
                        }
                        return _payload
                    }),
                ...k8sPermission.map((permission) => ({
                    ...permission,
                    entity: EntityTypes.CLUSTER as APIRoleFilter['entity'],
                    action: permission.action.value,
                    cluster: permission.cluster.label,
                    group: permission.group.value === '*' ? '' : permission.group.value,
                    kind: permission.kind.value === '*' ? '' : permission.kind.label,
                    namespace: permission.namespace.value === '*' ? '' : permission.namespace.value,
                    resource: permission.resource.find((entity) => entity.value === '*')
                        ? ''
                        : permission.resource.map((entity) => entity.value).join(','),
                })),
            ],
            superAdmin: isSuperAdminPermission,
        }
        if (serverMode !== SERVER_MODE.EA_ONLY) {
            payload.roleFilters.push({
                ...chartPermission,
                team: '',
                environment: '',
                entityName: chartPermission.entityName.map((entity) => entity.value).join(','),
            })
        }

        try {
            await createOrUpdatePermissionGroup(payload)
            if (isAddMode) {
                toast.success('Group created')
            } else {
                // currentK8sPermissionRef.current = [...k8sPermission].map(excludeKeyAndClusterValue)
                toast.success('Group updated')
            }
            _redirectToPermissionGroupList()
        } catch (err) {
            showError(err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setSubmitting(true)
        try {
            await deletePermissionGroup(_permissionGroup.id)
            toast.success('Group deleted')
            setDeleteConfirmationModal(false)
            _redirectToPermissionGroupList()
        } catch (err) {
            showError(err)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flexbox-col dc__align-start dc__align-self-stretch flex-grow-1 dc__gap-24 pb-16">
            <div className="flex dc__content-space dc__gap-8 pr-20 pl-20 w-100">
                <div className="flex dc__content-start dc__gap-4 fs-16 lh-32 fw-4 dc__ellipsis-right">
                    <Link className="anchor" to={URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS}>
                        Permission Groups
                    </Link>
                    <span className="cn-5">/</span>
                    <span className="cn-9 fw-6 dc__ellipsis-right">
                        {isAddMode ? 'Add Group' : _permissionGroup.name}
                    </span>
                </div>
                {!isAddMode && (
                    <div>
                        <button
                            disabled={submitting}
                            type="button"
                            className="cta delete override-button flex dc__gap-6 h-32"
                            onClick={toggleDeleteConfirmationModal}
                        >
                            <PlusIcon className="icon-dim-14 mw-14" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
            <div className="flexbox-col dc__content-space flex-grow-1 w-100">
                <div className="flexbox-col dc__gap-16 pr-20 pl-20 pb-16 w-100 flex-grow-1">
                    <CustomInput
                        name="permission-group-name-textbox"
                        label="Group name"
                        disabled={!isAddMode}
                        value={name.value}
                        data-testid="permission-group-name-textbox"
                        onChange={handleGroupNameChange}
                        isRequiredField
                        error={name.error}
                        placeholder="Eg. Project managers"
                    />
                    <div>
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label htmlFor="permission-group-description" className="form__label">
                            Description
                        </label>
                        <ResizableTextarea
                            name="permission-group-description"
                            maxHeight={300}
                            className="w-100"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            data-testid="permission-group-description-textbox"
                            placeholder="Enter a description for this group"
                        />
                    </div>
                    <div className="dc__border-top-n1" />
                    <PermissionConfigurationForm showUserPermissionGroupSelector={false} />
                </div>
                <div className="flexbox pt-16 pl-20 pr-20 dc__border-top-n1 dc__align-items-center dc__align-self-stretch dc__gap-8">
                    <button type="submit" className="cta flex h-32" disabled={submitting} onClick={handleSubmit}>
                        {submitting ? <Progressing /> : 'Save'}
                    </button>
                    <Link
                        to={URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS}
                        role="button"
                        aria-disabled={submitting}
                        className={`cta cancel flex h-32 anchor ${
                            submitting ? 'dc__disable-click disabled-opacity' : ''
                        }`}
                    >
                        Cancel
                    </Link>
                    {!isAddMode &&
                        !deepEqual(
                            currentK8sPermissionRef.current,
                            {},
                            // TODO (v3): Fix
                            // k8sPermission.map(excludeKeyAndClusterValue)
                        ) && (
                            <span className="flex cy-7 dc__gap-4">
                                <Warning className="icon-dim-20 warning-icon-y7" />
                                Unsaved changes
                            </span>
                        )}
                </div>
                {deleteConfirmationModal && (
                    <DeleteDialog
                        title={`Delete group '${name.value}'?`}
                        description="Deleting this group will revoke permissions from users added to this group."
                        closeDelete={toggleDeleteConfirmationModal}
                        delete={handleDelete}
                        apiCallInProgress={submitting}
                    />
                )}
            </div>
        </div>
    )
}

export default PermissionGroupForm
