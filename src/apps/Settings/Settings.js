import React from 'react'
import styled from 'styled-components'
import {
  AppBar,
  Button,
  DropDown,
  Field,
  TextInput,
  observe,
  theme,
} from '@aragon/ui'
import Option from './components/Option'
import observeCache from '../../components/HOC/observeCache'
import EtherscanLink from '../../components/Etherscan/EtherscanLink'
import provideNetwork from '../../context/provideNetwork'
import { compose } from '../../utils'

// const AVAILABLE_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'RMB', 'JPY']
const AVAILABLE_CURRENCIES = ['USD'] // Only use USD for now

const CACHE_KEY = 'settings'

const Main = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
`

const StyledAppBar = styled(AppBar)`
  flex-shrink: 0;
`

const ScrollWrapper = styled.div`
  height: 100%;
  overflow: auto;
`

const Content = styled.div`
  max-width: 600px;
  padding: 30px;
`

const LinkButton = styled(Button.Anchor).attrs({
  compact: true,
  mode: 'outline',
})`
  background: ${theme.contentBackground};
`

const AppsList = styled.ul`
  list-style: none;
`

const FieldTwoParts = styled.div`
  display: flex;
  input {
    margin-right: 10px;
    padding-top: 4px;
    padding-bottom: 4px;
  }
`

class Settings extends React.Component {
  static defaultProps = {
    apps: [],
  }
  constructor(props) {
    super(props)
    this.correctCurrencyIfNecessary(props)
  }
  componentWillReceiveProps(nextProps) {
    this.correctCurrencyIfNecessary(nextProps)
  }
  correctCurrencyIfNecessary({ cache, currencies, selectedCurrency }) {
    if (
      Array.isArray(currencies) &&
      currencies.indexOf(selectedCurrency) === -1
    ) {
      // Oops, somehow the selected currency isn't in the available currencies
      // Let's reset it to the first available currency
      this.propagateSelectedCurrency(cache, currencies[0])
    }
  }
  handleCurrencyChange = index => {
    const { cache, currencies } = this.props
    this.propagateSelectedCurrency(cache, currencies[index])
  }
  propagateSelectedCurrency(cache, selectedCurrency) {
    cache.update(CACHE_KEY, settings => ({ ...settings, selectedCurrency }))
  }
  render() {
    const { currencies, daoAddr, network, selectedCurrency, apps } = this.props
    return (
      <Main>
        <StyledAppBar title="Settings" />
        <ScrollWrapper>
          <Content>
            <Option
              name="Organization Address"
              text={`This organization is deployed on the ${network.name}.`}
            >
              <Field label="Address">
                <FieldTwoParts>
                  <TextInput readOnly wide value={daoAddr} />
                  <EtherscanLink address={daoAddr}>
                    {url =>
                      url ? (
                        <LinkButton href={url} target="_blank">
                          See on Etherscan
                        </LinkButton>
                      ) : null
                    }
                  </EtherscanLink>
                </FieldTwoParts>
              </Field>
            </Option>
            {apps.length > 0 && (
              <Option
                name="Aragon Apps"
                text={`This organization provides ${apps.length} apps.`}
              >
                <AppsList>
                  {apps.map(({ name, proxyAddress, description }, i) => (
                    <li title={description} key={i + proxyAddress}>
                      <Field label={name}>
                        <FieldTwoParts>
                          <TextInput readOnly wide value={proxyAddress} />
                          <EtherscanLink address={proxyAddress}>
                            {url =>
                              url ? (
                                <LinkButton href={url} target="_blank">
                                  See on Etherscan
                                </LinkButton>
                              ) : null
                            }
                          </EtherscanLink>
                        </FieldTwoParts>
                      </Field>
                    </li>
                  ))}
                </AppsList>
              </Option>
            )}
            {/*Array.isArray(currencies) &&
              selectedCurrency && (
                <Option
                  name="Currency"
                  text="This will be the default currency for displaying purposes. It will be converted to ETH under the hood."
                >
                  <Field label="Select currency">
                    <DropDown
                      active={currencies.indexOf(selectedCurrency)}
                      items={currencies}
                      onChange={this.handleCurrencyChange}
                    />
                  </Field>
                </Option>
              )*/}
          </Content>
        </ScrollWrapper>
      </Main>
    )
  }
}

const enhance = compose(
  observeCache(CACHE_KEY, {
    defaultValue: {
      selectedCurrency: AVAILABLE_CURRENCIES[0],
    },
    forcedValue: {
      currencies: AVAILABLE_CURRENCIES,
    },
  }),
  observe(observable => observable.map(settings => ({ ...settings })), {}),
  provideNetwork
)

export default enhance(Settings)
