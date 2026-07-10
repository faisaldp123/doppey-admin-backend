import LifestyleSection from "../models/LifestyleSection.js";

export const getPublicLifestyleSections = async (req, res) => {
  try {
    const sections = await LifestyleSection.find({
      isActive: true,
    }).sort({ order: 1 });

    res.json(sections);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getAllLifestyleSections = async (req, res) => {
  try {
    const sections = await LifestyleSection.find().sort({
      order: 1,
    });

    res.json(sections);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const createLifestyleSection = async (req, res) => {
  try {
    const {
      label,
      heading,
      description,
      buttonText,
      buttonLink,
      rightTopTitle,
      rightBottomTitle,
      order,
      isActive,
    } = req.body;

    const leftImage = req.files?.leftImage?.[0];
    const rightTopImage = req.files?.rightTopImage?.[0];
    const rightBottomImage = req.files?.rightBottomImage?.[0];

    if (!leftImage || !rightTopImage || !rightBottomImage) {
      return res.status(400).json({
        message: "All 3 images are required.",
      });
    }

    const section = await LifestyleSection.create({
      label,
      heading,
      description,
      buttonText,
      buttonLink,
      rightTopTitle,
      rightBottomTitle,
      order: order || 0,
      isActive:
        isActive !== undefined
          ? isActive === "true"
          : true,

      leftImage: leftImage.path,
      rightTopImage: rightTopImage.path,
      rightBottomImage: rightBottomImage.path,
    });

    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const updateLifestyleSection = async (req, res) => {
  try {
    const section =
      await LifestyleSection.findById(req.params.id);

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    if (req.body.label !== undefined)
      section.label = req.body.label;

    if (req.body.heading !== undefined)
      section.heading = req.body.heading;

    if (req.body.description !== undefined)
      section.description = req.body.description;

    if (req.body.buttonText !== undefined)
      section.buttonText = req.body.buttonText;

    if (req.body.buttonLink !== undefined)
      section.buttonLink = req.body.buttonLink;

    if (req.body.rightTopTitle !== undefined)
      section.rightTopTitle =
        req.body.rightTopTitle;

    if (req.body.rightBottomTitle !== undefined)
      section.rightBottomTitle =
        req.body.rightBottomTitle;

    if (req.body.order !== undefined)
      section.order = req.body.order;

    if (req.body.isActive !== undefined)
      section.isActive =
        req.body.isActive === "true";

    if (req.files?.leftImage?.length) {
      section.leftImage =
        req.files.leftImage[0].path;
    }

    if (req.files?.rightTopImage?.length) {
      section.rightTopImage =
        req.files.rightTopImage[0].path;
    }

    if (req.files?.rightBottomImage?.length) {
      section.rightBottomImage =
        req.files.rightBottomImage[0].path;
    }

    await section.save();

    res.json(section);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteLifestyleSection = async (
  req,
  res
) => {
  try {
    const section =
      await LifestyleSection.findByIdAndDelete(
        req.params.id
      );

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    res.json({
      message: "Lifestyle section deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};