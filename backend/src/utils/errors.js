export function safeError(err) {
  if (process.env.NODE_ENV === 'production') {
    return 'Internal server error'
  }
  return err.message || 'Internal server error'
}

export function safeErrorResponse(res, statusCode, errorMessage, detail) {
  const body = { error: errorMessage }
  if (process.env.NODE_ENV !== 'production' && detail) {
    body.message = detail
  }
  return res.status(statusCode).json(body)
}
