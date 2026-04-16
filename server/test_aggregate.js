require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Complaint = require('./src/models/Complaint').default;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const stats = await Complaint.aggregate([
      {
        $match: {
          status: 'RESOLVED',
          resolvedAt: { $ne: null },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $project: {
          day: { $dateToString: { format: '%a', date: '$createdAt' } },
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: '$day',
          avgHours: { $avg: '$resolutionTime' },
          count: { $sum: 1 }
        }
      }
    ]);
    console.log(stats);
  } catch(e) {
    console.error(e);
  }
  await mongoose.disconnect();
}
run();
