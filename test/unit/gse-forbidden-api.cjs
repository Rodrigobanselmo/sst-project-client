// Explicit unit-only boundary. Real authenticated API calls are covered by E2E.
const forbidden = () => { throw new Error('GSE_UNIT_NETWORK_FORBIDDEN'); };
exports.api = { get: forbidden, post: forbidden, put: forbidden, patch: forbidden, delete: forbidden };
