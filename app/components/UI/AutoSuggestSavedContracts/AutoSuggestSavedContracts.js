import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Flexbox from 'flexbox-react'
import Autosuggest from 'react-autosuggest'
import { clipboard } from 'electron'
import classnames from 'classnames'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'

import { truncateString, isValidAddress } from '../../../utils/helpers'
import db from '../../../services/store'

const savedContracts = db.get('savedContracts').value()

class AutoSuggestSavedContracts extends Component {
  state = {
    suggestionValue: '',
    suggestions: [],
    assetError: false,
    isValid: false,
    contractName: this.props.contractName,
  }

  componentWillMount() {
    const { address } = this.props
    if (address) { this.validateAndUpdate(address) }
  }

  componentDidMount() {
    const { address } = this.props
    if (address) {
      const isValid = isValidAddress(address, 'contract')
      this.setState({ suggestionValue: address, assetError: !isValid })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.status === 'success') {
      this.setState({ suggestionValue: '', contractName: '' })
    }
  }

  getSuggestionValue = suggestion => suggestion.address

  renderSuggestion = suggestion => (
    <div className="suggestionItem">
      {suggestion.name} ({truncateString(suggestion.address)})
    </div>
  )

  onSuggestionSelected = (event, { suggestion }) => {
    this.setState({
      suggestionValue: suggestion.address,
      contractName: suggestion.name,
    })
    this.props.sendData(suggestion)
  }

  getSuggestions = value => {
    const searchQuery = value.trim().toLowerCase()
    const inputLength = searchQuery.length

    if (inputLength === 0) {
      return savedContracts
    }
    return savedContracts.filter(contract =>
      (contract.name.toLowerCase().indexOf(searchQuery) > -1) ||
        (contract.address.toLowerCase().indexOf(searchQuery) > -1))
  }

  onChange = (event, { newValue, method }) => {
    const val = newValue.trim()
    const userPressedUpOrDown = (method === 'down' || method === 'up')
    if (!userPressedUpOrDown) { this.validateAndUpdate(val) }
  }

  onContractAddressBlur = (e) => {
    const val = e.target.value.trim()
    const isValid = isValidAddress(val, 'contract')
    const hasError = (val.length > 0 && !isValid)
    this.setState({ assetError: hasError, isValid: false })
  }

  onContractAddressFocus = () => {
    this.validateAndUpdate(this.state.suggestionValue)
  }

  validateAndUpdate(val) {
    const suggestions = this.getSuggestions(val)
    const isValid = isValidAddress(val, 'contract')
    if (isValid) {
      if (suggestions.length === 1) {
        this.setState({
          contractName: suggestions[0].name,
          suggestionValue: suggestions[0].address,
        })
        this.props.sendData(suggestions[0])
      } else {
        this.setState({ contractName: '', suggestionValue: val })
        this.props.sendData({ contractName: '', address: val })
      }
    }

    if (!isValid) {
      this.setState({ contractName: '', suggestionValue: val })
      this.props.sendData({ name: '', address: val })
    }
    const hasError = (suggestions.length === 0 && !isValid)
    this.setState({ assetError: hasError, isValid })
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({ suggestions: this.getSuggestions(value) })
  }

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] })
  }

  shouldRenderSuggestions = (value) => {
    const suggestions = this.getSuggestions(value)
    return !(suggestions.length === 1 && suggestions[0].address === value)
  }

  renderErrorMessage() {
    const { assetError } = this.state
    if (assetError) {
      return (
        <div className="error-message">
          <FontAwesomeIcon icon={['far', 'exclamation-circle']} />
          <span>Contract address is invalid</span>
        </div>
      )
    }
  }

  onPaste() {
    this.validateAndUpdate(clipboard.readText())
  }

  renderChosenContractName() {
    const { contractName } = this.state
    if (contractName) {
      return (
        <div className="chosenContractName">{contractName}</div>
      )
    }
  }

  render() {
    const {
      suggestionValue, suggestions, assetError, isValid,
    } = this.state
    let classNames = (assetError ? 'full-width error' : 'full-width')
    if (isValid) { classNames = classnames('is-valid', classNames) }

    const inputProps = {
      type: 'search',
      placeholder: 'Start typing the contract name or address',
      value: suggestionValue,
      className: classNames,
      onChange: this.onChange,
      onBlur: this.onContractAddressBlur,
      onFocus: this.onContractAddressFocus,
    }

    return (

      <Flexbox flexDirection="column" className="contract-address form-row">

        <label htmlFor="to">Contract Address</label>
        <Flexbox flexDirection="row" className="destination-address-input">

          <Flexbox flexDirection="column" className="full-width select-contract">
            <Autosuggest
              suggestions={suggestions}
              onSuggestionSelected={this.onSuggestionSelected}
              onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={this.getSuggestionValue}
              renderSuggestion={this.renderSuggestion}
              shouldRenderSuggestions={this.shouldRenderSuggestions}
              inputProps={inputProps}
            />
            {this.renderChosenContractName()}
            {this.renderErrorMessage()}
          </Flexbox>

          <button className="button secondary button-on-right" onClick={this.onPaste}>Paste</button>
        </Flexbox>

      </Flexbox>

    )
  }
}

export default AutoSuggestSavedContracts
