import BrandStory from "../models/BrandStory.js";

export const getPublicBrandStories = async (req, res) => {
  try {
    const stories = await BrandStory.find({
      isActive: true,
    }).sort({ order: 1 });

    res.json(stories);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getAllBrandStories = async (req, res) => {
  try {
    const stories = await BrandStory.find().sort({
      order: 1,
    });

    res.json(stories);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const createBrandStory = async (req, res) => {
  try {
    const {
      subtitle,
      heading,
      paragraphOne,
      paragraphTwo,
      paragraphThree,
      buttonText,
      buttonLink,
      order,
      isActive,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    const story = await BrandStory.create({
      subtitle,
      heading,
      paragraphOne,
      paragraphTwo,
      paragraphThree,
      buttonText,
      buttonLink,
      order: order || 0,
      isActive:
        isActive !== undefined
          ? isActive === "true"
          : true,
      image: req.file.path,
    });

    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const updateBrandStory = async (req, res) => {
  try {
    const story = await BrandStory.findById(
      req.params.id
    );

    if (!story) {
      return res.status(404).json({
        message: "Brand Story not found",
      });
    }

    if (req.body.subtitle !== undefined)
      story.subtitle = req.body.subtitle;

    if (req.body.heading !== undefined)
      story.heading = req.body.heading;

    if (req.body.paragraphOne !== undefined)
      story.paragraphOne =
        req.body.paragraphOne;

    if (req.body.paragraphTwo !== undefined)
      story.paragraphTwo =
        req.body.paragraphTwo;

    if (req.body.paragraphThree !== undefined)
      story.paragraphThree =
        req.body.paragraphThree;

    if (req.body.buttonText !== undefined)
      story.buttonText =
        req.body.buttonText;

    if (req.body.buttonLink !== undefined)
      story.buttonLink =
        req.body.buttonLink;

    if (req.body.order !== undefined)
      story.order = req.body.order;

    if (req.body.isActive !== undefined)
      story.isActive =
        req.body.isActive === "true";

    if (req.file) {
      story.image = req.file.path;
    }

    await story.save();

    res.json(story);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteBrandStory = async (
  req,
  res
) => {
  try {
    const story =
      await BrandStory.findByIdAndDelete(
        req.params.id
      );

    if (!story) {
      return res.status(404).json({
        message: "Brand Story not found",
      });
    }

    res.json({
      message: "Brand Story deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};