import crypto from 'node:crypto'

let safepayClient = null
let safepayClientError = null

function getSafepayEnv() {
  const apiKey = process.env.SAFEPAY_PUBLIC_KEY || process.env.SAFEPAY_SECRET_KEY || ''
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET || ''
  const v1Secret = process.env.SAFEPAY_SECRET_KEY || ''
  const apiBaseUrl = process.env.SAFEPAY_API_BASE_URL || 'https://sandbox.api.getsafepay.com'
  const environment = apiBaseUrl.includes('production') ? 'production' : 'sandbox'

  return { apiKey, webhookSecret, v1Secret, apiBaseUrl, environment }
}

async function getOrCreateSafepayClient() {
  if (safepayClient) {
    return safepayClient
  }
  if (safepayClientError) {
    throw safepayClientError
  }

  try {
    const { v1Secret, apiBaseUrl } = getSafepayEnv()
    const module = await import('@sfpy/node-core')
    safepayClient = module.default(v1Secret, {
      authType: 'secret',
      host: apiBaseUrl,
    })
    return safepayClient
  } catch (error) {
    safepayClientError = error
    throw error
  }
}

export function getSafepayApiBaseUrl() {
  return getSafepayEnv().apiBaseUrl
}

export function isSafepayConfigured() {
  const { apiKey, webhookSecret } = getSafepayEnv()
  if (!apiKey || !webhookSecret) {
    return false
  }
  if (safepayClient) {
    return true
  }
  if (safepayClientError) {
    return false
  }
  return true
}

export async function createSafepayPayment(amount, currency, orderId) {
  const client = await getOrCreateSafepayClient()
  const { apiKey } = getSafepayEnv()

  const response = await client.payments.session.setup({
    merchant_api_key: apiKey,
    intent: 'CYBERSOURCE',
    mode: 'payment',
    entry_mode: 'raw',
    currency,
    amount,
    metadata: {
      order_id: orderId,
    },
    include_fees: false,
  })

  const tracker = response?.data?.tracker
  if (!tracker?.token) {
    throw new Error('Safepay response missing tracker token')
  }

  return { token: tracker.token, tracker }
}

export async function createSafepayAuthToken() {
  const client = await getOrCreateSafepayClient()

  const response = await client.auth.passport.create()
  const token = response?.data
  if (!token) {
    throw new Error('Safepay response missing auth token')
  }

  return { token }
}

export function buildSafepayCheckoutUrl(trackerToken, authToken, orderId, redirectUrl, cancelUrl) {
  const client = safepayClient
  const { environment } = getSafepayEnv()

  if (!client) {
    throw new Error('Safepay client is not initialized')
  }

  return client.checkouts.payment.create({
    tracker: trackerToken,
    tbt: authToken,
    environment,
    source: 'hosted',
    redirect_url: redirectUrl,
    cancel_url: cancelUrl,
  })
}

export async function fetchSafepayPaymentStatus(trackerToken) {
  const client = await getOrCreateSafepayClient()

  const response = await client.reporter.payments.fetch(trackerToken)
  return response?.data?.tracker || null
}

export function verifySafepayWebhookSignature(payloadData, signature) {
  const { webhookSecret } = getSafepayEnv()
  if (!signature || !webhookSecret) {
    return false
  }

  const data = Buffer.from(JSON.stringify(payloadData))
  const expectedSignature = crypto.createHmac('sha512', webhookSecret).update(data).digest('hex')

  return signature === expectedSignature
}

export function verifySafepayReturnSignature(tracker, signature) {
  const { v1Secret } = getSafepayEnv()
  if (!signature || !v1Secret) {
    return false
  }

  const expectedSignature = crypto.createHmac('sha256', v1Secret).update(tracker).digest('hex')
  return signature === expectedSignature
}

export function mapSafepayStateToStatus(state) {
  const normalized = String(state || '').toUpperCase()
  if (['PAID', 'APPROVED', 'COMPLETED', 'TRACKER_ENDED'].includes(normalized)) {
    return 'paid'
  }
  if (['FAILED', 'DECLINED', 'ERROR'].includes(normalized)) {
    return 'failed'
  }
  if (['CANCELLED', 'CANCELED', 'EXPIRED'].includes(normalized)) {
    return 'cancelled'
  }
  if (['PROCESSING', 'PENDING', 'TRACKER_STARTED'].includes(normalized)) {
    return 'processing'
  }
  return null
}
