import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
      login: String,
      password_hash: String,
      user_storage_path: String,
      last_user_path: String
    },
    { timestamps: true }
  );
  
  export const User = mongoose.model("Users", UserSchema);
