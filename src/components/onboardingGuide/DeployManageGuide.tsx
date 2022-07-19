import React from 'react'
import HelmSearch from '../../assets/img/guided-helm-search.png'
import HelmInCluster from '../../assets/img/guided-helm-cluster.png'
import ChartRepository from '../../assets/img/guided-chart-repository.png'
import HelmCollage from '../../assets/img/guided-helm-collage.png'
import { NavLink, useRouteMatch, useHistory } from 'react-router-dom'
import { URLS } from '../../config'
import { ReactComponent as GoBack } from '../../assets/icons/ic-arrow-forward.svg'
import './onboardingGuide.scss'
import ReactGA from 'react-ga'

function DeployManageGuide() {
    const match = useRouteMatch()
    const history = useHistory()

    const redirectToOnboardingPage = (url) => {
        history.push(url)
    }

    return (
        <div className="deploy-manage-container">
            {console.log(window.location)}
            <div className="flex h-300 guide-header">
                <div className="bcn-0 deploy_arrow flex cursor" onClick={() => redirectToOnboardingPage('/')}>
                    <GoBack className="rotate icon-dim-24" style={{ ['--rotateBy' as any]: '180deg' }} />
                </div>
                <div className="ml-32">
                    <h1 className="fw-6 mb-8">Deploy and manage helm apps</h1>
                    <p className="fs-14 cn-7">This helps us in guiding you towards relevant product features</p>
                </div>
            </div>
            <div className="bcn-0 guide-body flex">
                <div className="deploy-manage-cards__wrap">
                    <div className="deploy-card bcn-0  flex w-400 br-4 en-2 bw-1 ">
                        <img
                            className=" bcn-1"
                            src={HelmSearch}
                            width="200"
                            height="150"
                            alt="Please connect cluster"
                        />
                        <div className="fw-6 fs-16 pl-20 pr-20">
                            3 helm applications found in default_cluster <br />
                            <NavLink
                                to={`${window.location.host}/${match.url.split('guide')[0]}/${URLS.APP}/${
                                    URLS.APP_LIST
                                }`}
                                activeClassName="active"
                                onClick={(event) => {
                                    ReactGA.event({
                                        category: 'Onboarding',
                                        action: 'Onboarding Guide Clicked',
                                    })
                                    // redirectToOnboardingPage(
                                    //     `${match.url.split('guide')[0]}/${URLS.APP}/${URLS.APP_LIST}`,
                                    // )
                                }}
                            >
                                View applications
                            </NavLink>
                        </div>
                    </div>
                    <div className="deploy-card bcn-0 flex w-400 br-4 en-2 bw-1 ">
                        <img
                            className=" bcn-1"
                            src={HelmCollage}
                            width="200"
                            height="150"
                            alt="Please connect cluster"
                        />
                        <div className="fw-6 fs-16 pl-20 pr-20">
                            I want to deploy popular helm charts <br />
                            <NavLink
                                to={`${match.url}/${URLS.GUIDE}`}
                                activeClassName="active"
                                // onClick={(event) => {
                                //     ReactGA.event({
                                //         category: 'Onboarding',
                                //         action: 'Onboarding Guide Clicked',
                                //     })
                                // }}
                            >
                                Browse helm charts
                            </NavLink>
                        </div>
                    </div>
                    <div className="deploy-card bcn-0  flex w-400 br-4 en-2 bw-1 ">
                        <img
                            className=" bcn-1"
                            src={HelmInCluster}
                            width="200"
                            height="150"
                            alt="Please connect cluster"
                        />
                        <div className="fw-6 fs-16 pl-20 pr-20">
                            I have helm applications in other clusters <br />
                            <NavLink
                                to={`${match.url}/${URLS.GUIDE}`}
                                activeClassName="active"
                                // onClick={(event) => {
                                //     ReactGA.event({
                                //         category: 'Onboarding',
                                //         action: 'Onboarding Guide Clicked',
                                //     })
                                // }}
                            >
                                Connect a cluster
                            </NavLink>
                        </div>
                    </div>
                    <div className="deploy-card bcn-0 flex w-400 br-4 en-2 bw-1 ">
                        <img
                            className=" bcn-1"
                            src={ChartRepository}
                            width="200"
                            height="150"
                            alt="Please connect cluster"
                        />
                        <div className="fw-6 fs-16 pl-20 pr-20">
                            I want to connect my own chart repository <br />
                            <NavLink
                                to={`${match.url}/${URLS.GUIDE}`}
                                activeClassName="active"
                                // onClick={(event) => {
                                //     ReactGA.event({
                                //         category: 'Onboarding',
                                //         action: 'Onboarding Guide Clicked',
                                //     })
                                // }}
                            >
                                Connect chart repository
                            </NavLink>
                        </div>
                    </div>
                </div>
                {/* <div className="fs-14 mt-20">
                    <div className="cb-5  fw-6">Skip and explore Devtron on your own</div>
                    <div className="cn-7">Tip: You can return here anytime from the Help menu</div>
                </div> */}
            </div>
        </div>
    )
}

export default DeployManageGuide
