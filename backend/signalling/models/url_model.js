import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  createUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const urls = mongoose.model('urls', urlSchema);
export default urls;
