// services/auditLogger.js
const AuditLog = require('../models/AuditLog');

async function logAction({ leadId, actorRole, actorId, actionType, payload = {} }) {
  return AuditLog.create({
    lead: leadId,
    actorRole,
    actorId,
    actionType,
    payload,
    timestamp: new Date(),
  });
}

module.exports = { logAction };