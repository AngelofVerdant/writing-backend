const { v2: cloudinary } = require('cloudinary');

const removeAllMedia = async (images) => {
  try {
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    cloudinary.config(cloudinaryConfig);

    for (const image of images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  } catch (error) {
    // Handle the error appropriately, e.g., log it or throw a custom error
    console.error('Error deleting images:', error);
    throw new Error('Failed to delete images');
  }
};

module.exports = {
    removeAllMedia,
};
