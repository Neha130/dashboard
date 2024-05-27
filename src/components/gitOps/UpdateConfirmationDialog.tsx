import React from 'react'
import { ButtonWithLoader, ConfirmationDialog } from '@devtron-labs/devtron-fe-common-lib'
import GitProviderTabIcons from './GitProviderTabIcons'
import { GitProvider, UpdateConfirmationDialogProps } from './gitops.type'
import { ReactComponent as ICWarning } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as ICArrowRight } from '../../assets/icons/ic-arrow-right.svg'
import { getProviderNameFromEnum } from './utils'
import { DOCUMENTATION } from '../../config'

const UpdateConfirmationDialog = ({
    providerTab,
    lastActiveGitOp,
    handleCancel,
    handleUpdate,
    saveLoading,
    enableBitBucketSource,
}: Readonly<UpdateConfirmationDialogProps>) => {
    const lastActiveGitOpsProvider =
        lastActiveGitOp?.provider === 'BITBUCKET_DC' ? GitProvider.BITBUCKET_CLOUD : lastActiveGitOp?.provider
    const isSwitchingProvider = lastActiveGitOpsProvider !== providerTab

    const renderIconField = () => {
        if (isSwitchingProvider) {
            return (
                <div className="flexbox dc__align-items-center dc__no-shrink dc__gap-20 pb-24">
                    <GitProviderTabIcons provider={lastActiveGitOpsProvider} rootClassName="icon-dim-48" />
                    <ICArrowRight className="dc__no-shrink icon-dim-16 scn-5" />
                    <GitProviderTabIcons provider={providerTab} rootClassName="icon-dim-48" />
                </div>
            )
        }

        return <ICWarning className="dc__no-shrink icon-dim-48" />
    }

    const renderTitle = () => {
        if (isSwitchingProvider) {
            return `Switch to ${getProviderNameFromEnum(providerTab, enableBitBucketSource)}`
        }

        return 'Update GitOps provider'
    }

    const renderContent = () => {
        if (isSwitchingProvider) {
            return (
                <div className="flexbox-col dc__gap-24">
                    <p className="m-0 cn-9 fs-14 fw-4 lh-20">
                        Switching to different GitOps provider might be impacting ....(?)
                    </p>

                    <p className="m-0 cn-8 fs-13 fw-4 lh-20">Are you sure to switch & make the changes?</p>
                </div>
            )
        }

        return (
            <div className="flexbox-col dc__gap-24">
                <p className="m-0 cn-8 fs-13 fw-4 lh-20">
                    Changing/Updating GitOps provider details might be disastrous.&nbsp;
                    <a
                        href={DOCUMENTATION.GLOBAL_CONFIG_GITOPS}
                        target="_blank"
                        className="anchor"
                        rel="noreferrer noopener"
                    >
                        Know more
                    </a>
                </p>

                <p className="m-0 cn-8 fs-13 fw-4 lh-20">Are you sure to make the changes?</p>
            </div>
        )
    }

    return (
        <ConfirmationDialog className="w-400">
            {renderIconField()}
            <ConfirmationDialog.Body title={renderTitle()}>{renderContent()}</ConfirmationDialog.Body>

            <ConfirmationDialog.ButtonGroup>
                <button
                    type="button"
                    className="cta cancel h-36 flex"
                    onClick={handleCancel}
                    disabled={saveLoading}
                    data-testid="cancel-git-ops-update"
                >
                    Cancel
                </button>

                <ButtonWithLoader
                    isLoading={saveLoading}
                    rootClassName="cta h-36 flex"
                    onClick={handleUpdate}
                    type="button"
                    disabled={saveLoading}
                    dataTestId="cancel-git-ops-update"
                >
                    {isSwitchingProvider ? 'Switch & Save' : 'Save'}
                </ButtonWithLoader>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

export default UpdateConfirmationDialog
