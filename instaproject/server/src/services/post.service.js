import postModel from "../models/post.model.js";
import imagekit from "../config/imagekit.js";

class PostService {
  // CREATE POST
  async createPost({ caption, imageFile, userId }) {
    if (!imageFile) {
      throw new Error("Image is required");
    }

    // Upload image to ImageKit
    const uploadResult = await imagekit.upload({
      file: imageFile.buffer,
      fileName: `${Date.now()}-${imageFile.originalname}`,
      folder: "/posts",
    });

    // Create post in MongoDB
    const post = await postModel.create({
      userId,
      caption,
      image: {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      },
    });

    return post;
  }

  // GET ALL POSTS
  async getAllPosts() {
    return await postModel
      .find()
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });
  }

  // GET SINGLE POST
  async getPostById(postId) {
    const post = await postModel
      .findById(postId)
      .populate("userId", "username profilePicture");

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  }

  // UPDATE POST
  async updatePost(postId, caption, userId) {
    const post = await postModel.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user owns the post
    if (post.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    post.caption = caption;

    await post.save();

    return post;
  }

  // DELETE POST
  async deletePost(postId, userId) {
    const post = await postModel.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user owns the post
    if (post.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    // Delete image from ImageKit
    if (post.image?.fileId) {
      await imagekit.deleteFile(post.image.fileId);
    }

    // Delete post from MongoDB
    await post.deleteOne();

    return true;
  }

  // LIKE / UNLIKE POST
  async toggleLike(postId, userId) {
    const post = await postModel.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return post;
  }
}

export default new PostService();
