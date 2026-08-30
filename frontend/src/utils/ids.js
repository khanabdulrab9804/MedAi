/** MongoDB ObjectId string (24 hex characters). */
const MONGO_ID = /^[a-f\d]{24}$/i;

export function isValidMongoId(id) {
  return typeof id === 'string' && MONGO_ID.test(id);
}

export function isValidSessionId(id) {
  return typeof id === 'string' && id.startsWith('sess_') && id.length <= 80;
}
