import React from 'react'
import { Provider } from 'mobx-react'
import MobxDevTools from 'mobx-react-devtools'
import ErrorBoundary from 'react-error-boundary'

import ErrorScreen from './components/ErrorScreen'
import AppUpdater from './components/AppUpdater/AppUpdater'
import WipeModal from './components/UI/WipeModal'
import Idle from './components/Idle'
import ModalContainer from './components/ModalContainer'
import history from './services/history'
import './services/rendererZenNodeNonZeroExit'
import states from './states'
import Routes from './Routes'
import './fontawesome'

export default class App extends React.Component {
  render() {
    return (
      <Provider history={history} {...states}>
        <ErrorBoundary FallbackComponent={ErrorScreen}>
          <React.Fragment>
            <React.Fragment>
              <AppUpdater />
              <WipeModal />
              <Idle />
              <div className="app-wrapper">
                <Routes />
              </div>
              <ModalContainer />
            </React.Fragment>
            {process.env.NODE_ENV !== 'production' && <MobxDevTools />}
          </React.Fragment>
        </ErrorBoundary>
      </Provider>
    )
  }
}
