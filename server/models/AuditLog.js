const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now, immutable: true, }, // Prevents updating the timestamp field after creation
    
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead ID is required for audit logging'],
      index: true,
      immutable: true,
    },
    actorRole: {
      type: String,
      enum: {
        values: ['A', 'B', 'C', 'D', 'SYSTEM'], // Added 'SYSTEM' for auto-compilations
        message: '{VALUE} is not a valid actor role',
      },
      required: [true, 'Actor role is required'],
      immutable: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor User ID is required'],
      immutable: true,
    },
    actionType: {
      type: String,
      enum: {
        values: [
          'LEAD_CREATED',
          'LEAD_DISPATCHED_B',
          'LEAD_DISPATCHED_C_GROUP',
          'OPTION_ADDED',
          'OPTIONS_COMPILED',
          'D_ASSIGNED',
          'CLIENT_CONTACT_ATTEMPTED',
          'CLIENT_CONTACTED',
          'TICKET_CONFIRMED',
          'REVISION_REQUESTED',
        ],
        message: '{VALUE} is not a valid action type',
      },
      required: [true, 'Action type is required'],
      immutable: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed, // Flexible JSON snapshot of action context
      default: {},
      immutable: true,
    },
  },
  {
    // Disable automatic updatedAt since audit logs must never be updated
    timestamps: false,
  }
);

// Mongoose Schema Level Guard: Block updates directly on the document
auditLogSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function () {
  throw new Error('Security Exception: AuditLog collection is immutable and cannot be updated.');
});

// Compound Index: Quickly query full history for a specific lead chronologically
auditLogSchema.index({ lead: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);