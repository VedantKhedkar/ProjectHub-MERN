// models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName: { type: String, required: true },
  projectSummary: String,
  projectDetails: String,
  budgetEstimate: String,
  completionDate: Date,
  status: { type: String, default: "Pending Admin Review" },
  finalQuote: Number,
  completionPercentage: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);