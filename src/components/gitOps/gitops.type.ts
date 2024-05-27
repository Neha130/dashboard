import { RouteComponentProps } from 'react-router'
import { BaseGitOpsType, GitOpsAuthModeType } from '@devtron-labs/devtron-fe-common-lib'

export type GitOpsOrganisationIdType =
    | 'gitHubOrgId'
    | 'gitLabGroupId'
    | 'azureProjectName'
    | 'bitBucketWorkspaceId'
    | 'bitBucketProjectKey'

export enum GitProvider {
    GITLAB = 'GITLAB',
    GITHUB = 'GITHUB',
    AZURE_DEVOPS = 'AZURE_DEVOPS',
    BITBUCKET_CLOUD = 'BITBUCKET_CLOUD',
    AWS_CODE_COMMIT = 'AWS_CODE_COMMIT',
    OTHER_GIT_OPS = 'OTHER_GIT_OPS',
}

export type GitProviderType = GitProvider | 'BITBUCKET_DC'

export interface CustomGitOpsState {
    username: {
        value: string
        error: string
    }
    password: {
        value: string
        error: string
    }
}

export interface GitOpsConfig extends Pick<BaseGitOpsType, 'sshHost' | 'sshKey' | 'username'> {
    id: number
    provider: GitProviderType
    host: string
    token: string
    active: boolean
    gitLabGroupId: string
    gitHubOrgId: string
    azureProjectName: string
    bitBucketWorkspaceId: string
    bitBucketProjectKey: string
}

export interface DefaultShortGitOpsType extends Pick<BaseGitOpsType, 'sshHost' | 'sshKey'> {
    host: string
    username: string
    token: string
    gitHubOrgId: string
    gitLabGroupId: string
    azureProjectName: string
    bitBucketWorkspaceId: string
    bitBucketProjectKey: string
}

export interface GitOpsState {
    /**
     * To define loading, error, logical state of component
     */
    view: string
    /**
     * For error screen manager
     */
    statusCode: number
    /**
     * Currently selected tab
     */
    providerTab: GitProvider
    /**
     * API response list of all providers with their config
     */
    gitList: GitOpsConfig[]
    /**
     * The details of the selected git provider
     */
    form: GitOpsConfig
    isFormEdited: boolean
    /**
     * To show triangular check on the selected git provider
     * Will be only changed after API call
     * Can also contain BitBucket DC as provider
     */
    lastActiveGitOp: undefined | GitOpsConfig
    saveLoading: boolean
    validateLoading: boolean
    /**
     * To identify which radio tab is selected in case of bitbucket
     */
    isBitbucketCloud: boolean
    /**
     * Error states for input fields
     */
    isError: DefaultShortGitOpsType
    validatedTime: string
    validationError: GitOpsConfig[]
    // TODO: Should be VALIDATION_STATUS, but can't change as of now due to service default to '', connect with @vivek
    validationStatus: string
    deleteRepoError: boolean
    /**
     * To show validation response of url of selected git provider
     * Like using http instead of https
     */
    isUrlValidationError: boolean
    // FIXME: Should be repoType from ../../config
    selectedRepoType: string
    validationSkipped: boolean
    allowCustomGitRepo: boolean
    /**
     * To show update confirmation dialog, in case of updating git provider details
     */
    showUpdateConfirmationDialog: boolean
}

export interface GitOpsProps extends RouteComponentProps<{}> {
    handleChecklistUpdate: (string) => void
}

export interface UserGitRepoConfigurationProps {
    respondOnSuccess: (redirection?: boolean) => void
    appId: number
    reloadAppConfig?: () => void
}
export interface UserGitRepoProps {
    setRepoURL: (string) => void
    setSelectedRepoType: (string) => void
    repoURL: string
    selectedRepoType: string
    staleData?: boolean
    authMode: GitOpsAuthModeType
}

export interface BitbucketCloudAndServerToggleSectionPropsType {
    isBitbucketCloud: boolean
    setIsBitbucketCloud: (value: boolean) => void
}

export interface GitProviderTabProps {
    /**
     * Currently selected tab
     */
    providerTab: GitProviderType
    /**
     * Acts as handleChange on radio tab
     */
    handleGitopsTab: (e) => void
    /**
     * Based on this would showCheck of previous selected on tab
     */
    lastActiveGitOp: undefined | GitOpsConfig
    /**
     * Value of tab to be rendered
     */
    provider: GitProvider
    /**
     * If true would disable radio tab
     */
    saveLoading: boolean
    datatestid: string
}

export interface GitProviderTabIconsProps extends Pick<GitProviderTabProps, 'provider'> {
    rootClassName?: string
}

export interface UpdateConfirmationDialogProps extends Pick<GitOpsState, 'lastActiveGitOp' | 'providerTab' | 'saveLoading'> {
    handleUpdate: () => void
    handleCancel: () => void
    /**
     * To render title provider for bitbucket
     */
    enableBitBucketSource: boolean
}