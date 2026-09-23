import postService from "../services/post.service.js";

export const createPost = async (req, res) => {
  try {
    const { caption, userId } = req.body;

    const post = await postService.createPost({
      caption,
      imageFile: req.file,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await postService.getAllPosts();

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await postService.getPostById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { caption, userId } = req.body;

    const post = await postService.updatePost(
      req.params.id,
      caption,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { userId } = req.body;

    await postService.deletePost(
      req.params.id,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const { userId } = req.body;

    const post = await postService.toggleLike(
      req.params.id,
      userId
    );

    res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};