// scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DispatcherState = require('../models/DispatcherState');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteMany({});
  await DispatcherState.deleteMany({});

  const password = '123456';

  const users = await User.create([
    { name: 'Alice A', email: 'a@test.com', password, role: 'A', isActive: true },
    { name: 'Bob B1', email: 'b1@test.com', password, role: 'B', isActive: true },
    { name: 'Ben B2', email: 'b2@test.com', password, role: 'B', isActive: true },
    { name: 'Cara C1', email: 'c1@test.com', password, role: 'C', isActive: true },
    { name: 'Cody C2', email: 'c2@test.com', password, role: 'C', isActive: true },
    { name: 'Cleo C3', email: 'c3@test.com', password, role: 'C', isActive: true },
    { name: 'Dana D1', email: 'd1@test.com', password, role: 'D', isActive: true },
    { name: 'Drew D2', email: 'd2@test.com', password, role: 'D', isActive: true },
  ]);

  await DispatcherState.create({
    _id: 'GLOBAL',
    stage1Toggle: 'B_TURN',
    bPointerIndex: 0,
    dPointerIndex: 0,
  });

  console.log('Seeded users:');
  users.forEach((u) => console.log(`  ${u.role}: ${u.email} / password123 / id=${u._id}`));
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });