const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function testConn() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connection Successful!');
    process.exit(0);
  } catch (err) {
    console.error('Connection Failed:', err);
    process.exit(1);
  }
}

testConn();
