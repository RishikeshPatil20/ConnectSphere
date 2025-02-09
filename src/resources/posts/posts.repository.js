import mongoose from "mongoose";
import { postSchema } from "./posts.schema.js";

const postModel = mongoose.model("Post", postSchema); 

export default class FriendshipRepository {
  static async createRequest(senderId, receiverId) {
    // Insert a friend request into the database
    return await postModel.create({ senderId, receiverId, status: 'PENDING' });
  }

  static async getPendingRequests(userId) {
    // Fetch pending friend requests for the user
    return await postModel.findAll({ where: { receiverId: userId, status: 'PENDING' } });
  }

  static async toggleFriendship(userId1, userId2) {
    // Toggle friendship (either create or delete a record in the friendship table)
    const existing = await db.Friendship.findOne({
      where: { userId1, userId2 },
    });
    if (existing) {
      await db.Friendship.destroy({ where: { userId1, userId2 } });
      return { action: 'removed' };
    } else {
      await db.Friendship.create({ userId1, userId2 });
      return { action: 'added' };
    }
  }

  static async acceptRequest(requestId) {
    // Update the status of the friend request and create a friendship
    const request = await postModel.findByPk(requestId);
    if (!request) throw new Error('Request not found');
    await request.update({ status: 'ACCEPTED' });
    await db.Friendship.create({ userId1: request.senderId, userId2: request.receiverId });
    return request;
  }

  static async rejectRequest(requestId) {
    // Reject the friend request
    const request = await postModel.findByPk(requestId);
    if (!request) throw new Error('Request not found');
    await request.update({ status: 'REJECTED' });
    return request;
  }
}