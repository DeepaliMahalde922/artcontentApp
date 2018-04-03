export const ENV = process.env.NODE_ENV || 'development';
export const isProduction = ENV === 'production';
export const isDebug = ENV === 'development';
export const isClient = typeof window !== 'undefined';
export const isTest = ENV === 'test';

export const SCOPES = 'read_orders,read_products, read_content, write_content';
export const ACTIVATE_CHARGE_ROUTE = '/activate_charge';

/* export const APP_NAME = 'testapp999'; //Live */
export const APP_NAME = 'testapp9999'; //Local dev
/* export const APP_NAME = 'devapp999'; //local live */

export const APP_URL = 'https://contentart.herokuapp.com'; //Local dev

/* export const APP_URL = 'https://84c4484d.ngrok.io'; //local live */

export const APP_HOME_ROUTE = '/home';
export const AUTH_CALLBACK_ROUTE = '/auth/callback';
export const INSTALL_PAGE = `https://apps.shopify.com/${APP_NAME}`;
export const UNINSTALL_ROUTE = '/uninstall';

export const sessionSecret =
  process.env.SESSION_SECRET || 'Your Session Secret goes here';

export const REDIS_URL = process.env.REDIS_URL || 'redis://:@127.0.0.1:6379';
