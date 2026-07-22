const mongoose = require('mongoose');

const dispatcherStateSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'GLOBAL' }, // Forces the primary key to always be 'GLOBAL'
    
    stage1Toggle: {
      type: String,
      enum: {
        values: ['B_TURN', 'C_TURN'],
        message: '{VALUE} is not a valid toggle state',
      },
      default: 'B_TURN'
    },
    
    bPointerIndex: { type: Number, default: 0, min: 0 },
    dPointerIndex: { type: Number, default: 0, min: 0, },
  },
  {
    // Disables automatic _id generation since we explicitly enforce _id: 'GLOBAL'
    _id: false, 
    timestamps: true,
  }
);

// Mongoose Schema Guard: Prevent creation of any document that isn't _id: 'GLOBAL'
dispatcherStateSchema.pre('save', function () {
  if (this._id !== 'GLOBAL') {
    return next(new Error('DispatcherState can only have a single document with _id: "GLOBAL"'));
  }
});

module.exports = mongoose.model('DispatcherState', dispatcherStateSchema);