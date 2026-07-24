const mongoose = require('mongoose');

// Import the statuses array for strict ENUM validation
const { ALLOWED_TRANSITIONS } = require('../services/stateMachine');
const VALID_STATUSES = Object.keys(ALLOWED_TRANSITIONS);

const leadSchema = new mongoose.Schema(
  {
    // Client Details
    clientName: { type: String, required: [true, 'Client name is required'], trim: true },
    clientPhone: { type: String, required: [true, 'Client phone number is required'], trim: true },
    clientNotes: { type: String, default: '',  trim: true },
    destination: { type: String, required: true },
    travelDate: { type: Date, required: true },
    departureAirport: { type: String, required: true },
    preferredTime: {
      type: String,
      enum: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'ANY'],
      default: 'ANY',
    },
    passengers: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },

    // Workflow Routing Details
    flowType: {
      type: String,
      enum: {
        values: ['SINGLE_AGENT', 'MULTI_AGENT'],
        message: '{VALUE} is not a valid flow type',
      },
      // Set dynamically during Stage 1 Dispatch (A -> B / C Group)
      default: null, 
    },

    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: '{VALUE} is not a valid lead status',
      },
      default: 'NEW',
      index: true, // Indexed for fast query filtering on dashboards
    },

    // Agent Assignments (User ObjectIDs)
    assignedB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, },
    assignedD: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, }, // "Sticky Pin" lives here across revision loops
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Role A User (createdBy) is required'], },

    // Revision Tracking
    currentRevisionRound: { type: Number, default: 1, min: 1,  }, // Increments each time D requests a revision back to C
    selectedOption: { type: mongoose.Schema.Types.ObjectId, ref:'Option', default: null },
    
    pendingRevisionReason: { type: String, default: null }, // D's request, visible to A, cleared once resent
    revisionHistory: [
      {
        round: Number,
        reason: String,
        requestedAt: { type: Date, default: Date.now },
        fieldChanges: [
          {
            field: String,
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
          },
        ],
      },
    ],
  },
  {
    timestamps: true, 
  }
);

// Indexes to optimize pipeline queries
leadSchema.index({ status: 1, flowType: 1 });
leadSchema.index({ assignedB: 1 });
leadSchema.index({ assignedD: 1 });


module.exports = mongoose.model('Lead', leadSchema);;