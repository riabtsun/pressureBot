import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  fullName: { type: String, required: true },
  birthDate: { type: String, required: true },
  records: [
    {
      date: String,
      morning: { systolic: Number, diastolic: Number, pulse: Number },
      evening: { systolic: Number, diastolic: Number, pulse: Number },
      // morningBP: String,
      // morningPulse: String,
      // eveningBP: String,
      // eveningPulse: String,
    },
  ],
});

export const User = mongoose.model("User", UserSchema);
