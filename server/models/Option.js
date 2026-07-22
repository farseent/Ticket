const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: [true, 'Lead ID is required'], index: true, }, // Indexed so querying options for a lead is extremely fast
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Submitter (User ID) is required'], },
    round: { type: Number, required: true, default: 1, },
    
    // Flight Details
    airline: { type: String, required: true, trim: true },
    route: { type: String, required: true, trim: true },
    departTime: { type: String, required: true },
    arriveTime: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    layovers: { type: String, default: 'Direct' },
    notes: { type: String, default: '', trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt for audit logs
  }
);

// Compound index to quickly aggregate all options for a specific lead and revision round
optionSchema.index({ lead: 1, round: 1 });


module.exports = mongoose.model('Option', optionSchema);;