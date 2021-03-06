import React, { Component } from 'react'
import moment from 'moment'
import { inject, observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import cx from 'classnames'


import NonMainNetBottomBar from '../../UI/NonMainNetBottomBar'
import { ZEN_NODE_VERSION, WALLET_VERSION } from '../../../constants/versions'
import { LOCALNET, MAINNET } from '../../../constants'
import { LOGO_SRC } from '../../../constants/imgSources'
import NetworkState from '../../../states/network-state'
import SecretPhraseState from '../../../states/secret-phrase-state'

import SidebarMenu from './SidebarMenu'

type Props = {
  className?: string,
  networkState: NetworkState,
  secretPhraseState: SecretPhraseState
};

@inject('secretPhraseState', 'networkState')
@observer
class Sidebar extends Component<Props> {
  static defaultProps = {
    className: '',
  }
  get isBottomBarPresent() {
    return this.props.networkState.chain !== MAINNET
  }
  get bottomDataClassName() {
    return cx('network-data-point bottom', { 'with-bottom-bar': this.isBottomBarPresent })
  }
  formattedBlockchainTime() {
    const { medianTime } = this.props.networkState
    return medianTime
      ? moment(new Date(medianTime)).format('DD/MM/YYYY, HH:mm:ss')
      : medianTime
  }

  renderSyncingStatus() {
    const {
      isSynced, connections, isSyncing,
    } = this.props.networkState

    if (connections === 0) {
      return
    }

    if (isSyncing) {
      return (
        <div>
          <span className="data-name" title="Syncing">
            <FontAwesomeIcon icon={['far', 'spinner-third']} spin />
          </span>
          <span className="data-point"> Syncing</span>
        </div>
      )
    }

    if (isSynced) {
      return (
        <div>
          <span className="data-name" title="Syncing">
            <FontAwesomeIcon icon={['fas', 'circle']} className="green" />
          </span>
          <span className="data-point"> Synced</span>
        </div>
      )
    }
  }

  renderMiningStatus() {
    const { isMining } = this.props.secretPhraseState
    if (!isMining) {
      return
    }
    return (
      <div>
        <span className="data-name" title="Mining">
          <FontAwesomeIcon icon={['fas', 'cog']} spin />
        </span>
        <span className="data-point"> Mining</span>
      </div>
    )
  }

  renderVersions() {
    return (
      <React.Fragment>
        <div className="network-data-point">
          <span className="data-name" title="Wallet Version">Wallet Version: </span>
          <span className="data-point">{WALLET_VERSION}</span>
        </div>
        <div className="network-data-point">
          <span className="data-name" title="Node Version">Node Version: </span>
          <span className="data-point">{ZEN_NODE_VERSION}</span>
        </div>
      </React.Fragment>
    )
  }

  rednerHashingPower() {
    const { hashrateByUnit, hashrateUnit } = this.props.networkState
    return (
      <div className="network-data-point truncate">
        <span className="data-name">Network Hashrate: </span>
        <span className="data-point" title={`${hashrateByUnit} ${hashrateUnit}`}>
          {parseFloat(hashrateByUnit).toFixed(2)} {hashrateUnit}
        </span>
      </div>
    )
  }

  renderNetworkStatus() {
    const {
      chain, blocks, headers, difficulty, connections, connectedToNode,
    } = this.props.networkState

    if (!connectedToNode) {
      return (
        <div className="network-status">
          { this.renderVersions() }
          <div className={this.bottomDataClassName}>
            <span className="data-name">
              <FontAwesomeIcon icon={['fas', 'circle']} className="red" />
            </span>
            <span className="data-point"> Not Connected to a Node</span>
          </div>
        </div>
      )
    }

    if (connections === 0 && chain !== LOCALNET) {
      return (
        <div className="network-status">
          { this.renderVersions() }
          <div className={this.bottomDataClassName}>
            <span className="data-name">
              <FontAwesomeIcon icon={['far', 'spinner-third']} spin />
            </span>
            <span className="data-point"> Connecting</span>
          </div>
        </div>
      )
    }

    return (
      <div className="network-status">
        <div className="network-data-point">
          <span className="data-name">Chain: </span>
          <span className="data-point">{chain}</span>
        </div>
        <div className="network-data-point">
          <span className="data-name">Blocks: </span>
          <span className="data-point">{blocks.toLocaleString()}</span>
        </div>
        <div className="network-data-point">
          <span className="data-name">Headers: </span>
          <span className="data-point">{headers.toLocaleString()}</span>
        </div>
        <div className="network-data-point truncate">
          <span className="data-name">Mining Difficulty: </span>
          <span className="data-point" title={difficulty}>{difficulty}</span>
        </div>
        { this.rednerHashingPower() }
        <div className="network-data-point">
          <span className="data-name" title="Median Time Past">MTP: </span>
          <span className="data-point">{this.formattedBlockchainTime()}</span>
        </div>
        <div className="network-data-point">
          <span className="data-name" title="Connections">Connections: </span>
          <span className="data-point">{connections}</span>
        </div>
        { this.renderVersions() }
        <div className={this.bottomDataClassName}>
          { this.renderMiningStatus() }
          { this.renderSyncingStatus() }
        </div>
      </div>
    )
  }

  render() {
    const SIDEBAR_WIDTH = 230
    return (
      <nav className={`sidebar ${this.props.className}`}>
        <div className="logo">
          <Link to="/portfolio">
            <img src={LOGO_SRC} alt="Zen Protocol Logo" />
          </Link>
        </div>
        <SidebarMenu />
        {this.renderNetworkStatus()}
        <NonMainNetBottomBar width={SIDEBAR_WIDTH} />
      </nav>
    )
  }
}

export default Sidebar
