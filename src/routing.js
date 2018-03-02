import { isAddress } from 'web3-utils'

const STATIC_APPS = new Map(
  Object.entries({
    home: '/',
    settings: '/settings',
    permissions: '/permissions',
  })
)

/*
 * Parse a path and a search query and return a “locator” object.
 *
 * Paths examples:
 *
 * Onboarding:
 *
 * /
 * /setup/template
 * /setup/domain
 * /setup/configure/1
 * /setup/configure/2
 * /setup/registering
 *
 * App:
 *
 * /0x{dao_address}
 * /0x{dao_address}/settings
 * /0x{dao_address}/permissions
 * /0x{dao_address}/0x{app_instance_address}?params={app_params}
 *
 *
 * Available modes:
 *   - home: the screen you see when opening /.
 *   - setup: the onboarding screens.
 *   - app: when the path starts with a DAO address.
 *   - unknown: the mode can’t be determined.
 */
export const parsePath = (pathname, search = '') => {
  const locator = { path: pathname + search }
  const [, ...parts] = locator.path.split('/')

  // Home
  if (!parts[0]) {
    return { ...locator, mode: 'home' }
  }

  // Setup
  if (parts[0] === 'setup') {
    const [mode, step = null, ...setupParts] = parts
    return { ...locator, mode, step, parts: setupParts }
  }

  // Exclude invalid DAO addresses
  if (!isAddress(parts[0])) {
    return { ...locator, mode: 'unknown' }
  }

  // App
  const rawParams = search && search.split('?params=')[1]
  const params = rawParams ? JSON.parse(decodeURIComponent(rawParams)) : null
  const [dao, appId, ...appParts] = parts
  return {
    ...locator,
    mode: 'app',
    dao,
    appId: appId || 'home',
    params,
    parts: appParts,
  }
}

// Return a path string for an app instance
export const getAppPath = ({ dao, appId = 'home', params } = {}) => {
  if (STATIC_APPS.has(appId)) {
    return `/${dao}${STATIC_APPS.get(appId)}`
  }
  return `/${dao}/${appId}${
    params ? `?params=${encodeURIComponent(JSON.stringify(params))}` : ``
  }`
}
