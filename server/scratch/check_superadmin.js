const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String, isActive: Boolean }));
  const user = await User.findOne({ email: 'superadmin@delhi.gov.in' });
  console.log('User found:', user ? { email: user.email, role: user.role, isActive: user.isActive } : 'NOT FOUND');
  process.exit(0);
}

checkUser();
