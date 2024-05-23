import React, { useState, useEffect, useMemo } from 'react'
import { useHistory, useParams, useRouteMatch, useLocation } from 'react-router-dom'
import {
    getUserRole,
    BreadCrumb,
    useBreadcrumb,
    ErrorScreenManager,
    DevtronProgressing,
    useAsync,
    useEffectAfterMount,
    PageHeader,
    UseRegisterShortcutProvider,
    getResourceGroupListRaw,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'
import { ShortcutProvider } from 'react-keybind'
import { ClusterOptionType, FIXED_TABS_INDICES, URLParams } from '../Types'
import { ALL_NAMESPACE_OPTION, K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../Constants'
import { URLS } from '../../../config'
import { convertToOptionsList, sortObjectArrayAlphabetically } from '../../common'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import NodeDetailComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'
import { DynamicTabs, useTabs } from '../../common/DynamicTabs'
import { getTabsBasedOnRole } from '../Utils'
import { getClusterListMin } from '../../ClusterNodes/clusterNodes.service'
import ClusterSelector from './ClusterSelector'
import ClusterOverview from '../../ClusterNodes/ClusterOverview'
import NodeDetails from '../../ClusterNodes/NodeDetails'
import { DEFAULT_CLUSTER_ID } from '../../cluster/cluster.type'
import K8SResourceTabComponent from './K8SResourceTabComponent'
import AdminTerminal from './AdminTerminal'
import { renderRefreshBar } from './ResourceList.component'
import { renderCreateResourceButton } from '../PageHeader.buttons'

const ResourceList = () => {
    const { clusterId, namespace, nodeType, node, group } = useParams<URLParams>()
    const { replace } = useHistory()
    const { url } = useRouteMatch()
    const location = useLocation()
    const {
        tabs,
        initTabs,
        addTab,
        markTabActiveByIdentifier,
        markTabActiveById,
        removeTabByIdentifier,
        updateTabUrl,
        updateTabComponentKey,
        updateTabLastSyncMoment,
        stopTabByIdentifier,
    } = useTabs(URLS.RESOURCE_BROWSER)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [isDataStale, setIsDataStale] = useState(false)

    /* TODO: Find use for this error */
    const [rawGVKLoader, k8SObjectMapRaw /* rawGVKError */] = useAsync(
        () => getResourceGroupListRaw(clusterId),
        [clusterId],
    )

    const [loading, data, error] = useAsync(() =>
        Promise.all([getClusterListMin(), window._env_.K8S_CLIENT ? null : getUserRole()]),
    )

    const [clusterListData = null, userRole = null] = data || []

    const clusterList = clusterListData?.result || null

    const clusterOptions: ClusterOptionType[] = useMemo(
        () =>
            clusterList &&
            (convertToOptionsList(
                sortObjectArrayAlphabetically(clusterList, 'name'),
                'name',
                'id',
                'nodeErrors',
            ) as ClusterOptionType[]),
        [clusterList],
    )

    /* NOTE: this is being used as dependency in useEffect down the tree */
    const selectedCluster = useMemo(
        () =>
            clusterOptions?.find((cluster) => String(cluster.value) === clusterId) || {
                label: '',
                value: clusterId,
                errorInConnecting: '',
            },
        [clusterId, clusterOptions],
    )

    const isSuperAdmin = !!userRole?.result.superAdmin

    /* NOTE: dynamic tabs must have position as Number.MAX_SAFE_INTEGER */
    const dynamicActiveTab = tabs.find((tab) => tab.position === Number.MAX_SAFE_INTEGER && tab.isSelected)

    const getDynamicTabData = () => {
        const isNodeTypeEvent = nodeType === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
        const isNodeTypeNode = nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()
        return {
            idPrefix: isNodeTypeNode
                ? K8S_EMPTY_GROUP
                : `${(!isNodeTypeEvent && group) || K8S_EMPTY_GROUP}_${namespace}`,
            name: node,
            kind: nodeType,
            url,
            isSelected: true,
            position: Number.MAX_SAFE_INTEGER,
        }
    }

    const initTabsBasedOnRole = (reInit: boolean) => {
        const _tabs = getTabsBasedOnRole(
            selectedCluster,
            namespace,
            isSuperAdmin,
            /* NOTE: if node is available in url but no associated dynamicTab we create a dynamicTab */
            node && getDynamicTabData(),
            nodeType === AppDetailsTabs.terminal,
        )
        initTabs(_tabs, reInit)
    }

    useEffect(() => initTabsBasedOnRole(false), [isSuperAdmin])
    useEffectAfterMount(() => initTabsBasedOnRole(true), [clusterId])

    useEffectAfterMount(() => {
        /* NOTE: tab selection is interactively done through dynamic tab button clicks
         * but to ensure consistency with url changes and user moving back through browser history,
         * correct active tab state is ensured by this effect */
        const matched = tabs.find((tab) => tab.url.includes(location.pathname))
        if (!matched || matched.isSelected) {
            if (!matched && node) {
                /* NOTE: if a dynamic tab was removed & user tries to get there through url add it */
                const { idPrefix, kind, name, url: _url } = getDynamicTabData()
                addTab(idPrefix, kind, name, _url).then(noop).catch(noop)
            }
            return
        }
        markTabActiveById(matched.id)
    }, [location.pathname])

    const onClusterChange = (selected) => {
        if (selected.value === selectedCluster?.value) {
            return
        }

        /* if user manually tries default cluster url redirect */
        if (selected.value === DEFAULT_CLUSTER_ID && window._env_.HIDE_DEFAULT_CLUSTER) {
            replace({
                pathname: URLS.RESOURCE_BROWSER,
            })
            return
        }

        const path = `${URLS.RESOURCE_BROWSER}/${selected.value}/${
            ALL_NAMESPACE_OPTION.value
        }/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`

        replace({
            pathname: path,
        })
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                'resource-browser': {
                    component: <span className="cb-5 fs-16 dc__capitalize">Resource Browser</span>,
                    linked: true,
                },
                ':clusterId': {
                    component: (
                        <ClusterSelector
                            onChange={onClusterChange}
                            clusterList={clusterOptions || []}
                            clusterId={clusterId}
                        />
                    ),
                    linked: false,
                },
                ':namespace': null,
                ':nodeType': null,
                ':group': null,
                ':node?': null,
            },
        },
        [clusterId, clusterOptions],
    )

    const refreshData = (): void => {
        const activeTab = tabs.find((tab) => tab.isSelected)
        updateTabComponentKey(activeTab.id)
        updateTabLastSyncMoment(activeTab.id)
        setIsDataStale(false)
    }

    const closeResourceModal = (_refreshData: boolean): void => {
        if (_refreshData) {
            refreshData()
        }
    }

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    const updateTerminalTabUrl = (queryParams: string) => {
        const terminalTab = tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL]
        if (!terminalTab || terminalTab.name !== AppDetailsTabs.terminal || !terminalTab.isSelected) {
            return
        }
        updateTabUrl(terminalTab.id, `${terminalTab.url.split('?')[0]}?${queryParams}`)
        replace({ search: queryParams })
    }

    const updateK8sResourceTabLastSyncMoment = () =>
        updateTabLastSyncMoment(tabs[FIXED_TABS_INDICES.K8S_RESOURCE_LIST].id)

    const getMarkTabActiveByIdSetter =
        (id = '') =>
        () =>
            id && markTabActiveById(id)

    const getUpdateTabUrlForId = (id: string) => (_url: string, dynamicTitle?: string) =>
        updateTabUrl(id, _url, dynamicTitle)

    const renderDynamicTabComponent = (tabId: string): JSX.Element => {
        if (!node) {
            return null
        }

        return nodeType.toLowerCase() === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase() ? (
            <NodeDetails
                key={dynamicActiveTab.componentKey}
                isSuperAdmin={isSuperAdmin}
                addTab={addTab}
                k8SObjectMapRaw={k8SObjectMapRaw?.result.apiResources || null}
                markTerminalTabActive={getMarkTabActiveByIdSetter(tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL]?.id)}
            />
        ) : (
            <div className="resource-details-container flexbox-col">
                <NodeDetailComponent
                    key={dynamicActiveTab.componentKey}
                    loadingResources={rawGVKLoader}
                    isResourceBrowserView
                    k8SObjectMapRaw={k8SObjectMapRaw?.result.apiResources || null}
                    markTabActiveByIdentifier={markTabActiveByIdentifier}
                    addTab={addTab}
                    logSearchTerms={logSearchTerms}
                    setLogSearchTerms={setLogSearchTerms}
                    removeTabByIdentifier={removeTabByIdentifier}
                    updateTabUrl={getUpdateTabUrlForId(tabId)}
                />
            </div>
        )
    }

    const fixedTabComponents = [
        <ClusterOverview
            key={tabs[FIXED_TABS_INDICES.OVERVIEW]?.componentKey}
            isSuperAdmin={isSuperAdmin}
            selectedCluster={selectedCluster}
            markNodesTabActive={getMarkTabActiveByIdSetter(tabs[FIXED_TABS_INDICES.OVERVIEW]?.id)}
        />,
        <K8SResourceTabComponent
            key={tabs[FIXED_TABS_INDICES.K8S_RESOURCE_LIST]?.componentKey}
            selectedCluster={selectedCluster}
            addTab={addTab}
            renderRefreshBar={renderRefreshBar(
                isDataStale,
                tabs?.[FIXED_TABS_INDICES.K8S_RESOURCE_LIST]?.lastSyncMoment?.toString(),
                refreshData,
            )}
            isSuperAdmin={isSuperAdmin}
            isOpen={!!tabs?.[FIXED_TABS_INDICES.K8S_RESOURCE_LIST]?.isSelected}
            showStaleDataWarning={isDataStale}
            markTerminalTabActive={getMarkTabActiveByIdSetter(tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL]?.id)}
            updateK8sResourceTab={getUpdateTabUrlForId(tabs[FIXED_TABS_INDICES.K8S_RESOURCE_LIST]?.id)}
            updateK8sResourceTabLastSyncMoment={updateK8sResourceTabLastSyncMoment}
        />,
        ...(isSuperAdmin &&
        tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL]?.name === AppDetailsTabs.terminal &&
        tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL].isAlive
            ? [
                  <AdminTerminal
                      key={tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL].componentKey}
                      isSuperAdmin={isSuperAdmin}
                      updateTerminalTabUrl={updateTerminalTabUrl}
                  />,
              ]
            : []),
    ]

    const renderMainBody = () => {
        if (error) {
            return (
                <div className="flex" style={{ height: 'calc(100vh - 48px)' }}>
                    <ErrorScreenManager code={error.code} />
                </div>
            )
        }

        if (loading) {
            return (
                <div style={{ height: 'calc(100vh - 48px)' }}>
                    <DevtronProgressing parentClasses="h-100 flex bcn-0" classes="icon-dim-80" />
                </div>
            )
        }

        return (
            <>
                <div
                    className="h-36 resource-browser-tab flex left w-100"
                    style={{ boxShadow: 'inset 0 -1px 0 0 var(--N200)' }}
                >
                    <DynamicTabs
                        tabs={tabs}
                        removeTabByIdentifier={removeTabByIdentifier}
                        markTabActiveById={markTabActiveById}
                        stopTabByIdentifier={stopTabByIdentifier}
                        refreshData={refreshData}
                        isOverview={nodeType === SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}
                        setIsDataStale={setIsDataStale}
                    />
                </div>
                {tabs.length > 0 &&
                    fixedTabComponents.map((component, index) => (
                        <div key={component.key} className={!tabs[index].isSelected ? 'dc__hide-section' : ''}>
                            {component}
                        </div>
                    ))}
                {dynamicActiveTab && renderDynamicTabComponent(dynamicActiveTab.id)}
            </>
        )
    }

    return (
        <UseRegisterShortcutProvider>
            <ShortcutProvider>
                <div className="resource-browser-container dc__overflow-hidden h-100 bcn-0">
                    <PageHeader
                        isBreadcrumbs
                        breadCrumbs={renderBreadcrumbs}
                        headerName=""
                        renderActionButtons={renderCreateResourceButton(clusterId, closeResourceModal)}
                    />
                    {renderMainBody()}
                </div>
            </ShortcutProvider>
        </UseRegisterShortcutProvider>
    )
}

export default ResourceList
