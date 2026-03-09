// src/environments/environment.ts

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',

  // ── Resident Platform API ─────────────────────────────────────────────────
  rpm: {
    resources: {
      properties:     'api/v1/properties',
      paymentHistory: 'api/v1/payments/history',
      ebillSettings:  'api/v1/ebills/settings',
      paymentOptions: 'api/v1/payments/payment-options',
      users:          'api/v1/users'
    }
  },

  // ── Identity ──────────────────────────────────────────────────────────────
  identity: {
    baseUrl:       'https://identity-dev.manageamerica.com',
    tokenResource: 'connect/token'
  },

  // ── Platform Payments API ─────────────────────────────────────────────────
  platformPayments: {
    baseUrl:      'http://localhost:7000',
    clientId:     'ma-payments-dev',
    clientSecret: 'secret',
    grantType:    'client_credentials',
    scope:        'ma-payments-api',
    resources: {
      tokens:     'api/v1/tokens',
      accountKey: 'api/v1/accountkey'
    }
  },

  // ── Dhango Payments API ───────────────────────────────────────────────────
  dhango: {
    baseUrl: 'https://api.dhangodemo.com',
    resources: {
      postToken:          'v1/tokens',
      deleteToken:        'v1/tokens/{id}',
      postTransaction:    'v1/transactions/pay',
      getTransactionList: 'v1/transactions'
    },
    key:    '13ea8ed67b45495394a704d8f52760dc',
    secret: '42052195f1c24df299ea6536ecf9ea36'
  }
};