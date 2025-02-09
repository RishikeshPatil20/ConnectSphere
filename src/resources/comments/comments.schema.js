import mongoose from 'mongoose';

export const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true, // Ensures the comment must have content
      trim: true, // Removes leading/trailing whitespace
    },
    created_at: {
      type: Date,
      default: Date.now, // Automatically sets the current date when created
    },
    updated_at: {
      type: Date,
      default: Date.now, // Automatically updates when the document is updated
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: true, // Ensures a comment is associated with a user
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // References the Post model
      required: false, // Ensures a comment is associated with a post
    },
    likes: {
      type: Number,
      default: 0, // Defaults to 0 likes
      min: 0, // Ensures likes cannot be negative
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment', // References other comments (replies)
      },
    ],
  },
  {
    timestamps: true, // Automatically manages `created_at` and `updated_at` fields
  }
);


