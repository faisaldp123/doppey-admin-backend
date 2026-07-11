import InstagramPost from "../models/InstagramPost.js";

export const getPublicInstagramPosts = async (req, res) => {
  try {
    const posts = await InstagramPost.find({
      isActive: true,
    }).sort({ order: 1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getAllInstagramPosts = async (req, res) => {
  try {
    const posts = await InstagramPost.find().sort({
      order: 1,
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const createInstagramPost = async (req, res) => {
  try {
    const { link, order, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    const post = await InstagramPost.create({
      link: link || "https://instagram.com",
      order: order || 0,
      isActive:
        isActive !== undefined
          ? isActive === "true"
          : true,
      image: req.file.path,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const updateInstagramPost = async (req, res) => {
  try {
    const post = await InstagramPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (req.body.link !== undefined) post.link = req.body.link;
    if (req.body.order !== undefined) post.order = req.body.order;
    if (req.body.isActive !== undefined)
      post.isActive = req.body.isActive === "true";

    if (req.file) {
      post.image = req.file.path;
    }

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteInstagramPost = async (req, res) => {
  try {
    const post = await InstagramPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      message: "Instagram post deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};