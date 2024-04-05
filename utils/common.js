const { v2: cloudinary } = require('cloudinary');

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const archiver = require('archiver');

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
    console.error('Error deleting images:', error);
    throw new Error('Failed to delete images');
  }
};

const downloadAllMedia = async (images, zipFileName) => {
  try {
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };
    cloudinary.config(cloudinaryConfig);

    if (!images || images.length === 0) {
      throw new Error('No images found for the order');
    }
    
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    archive.pipe(output);

    for (const image of images) {
      const { secure_url, public_id } = image;
      const imageUrl = cloudinary.url(public_id);
      const imageFileName = path.basename(secure_url);
      const response = await axios.get(imageUrl, { responseType: 'stream' });
      archive.append(response.data, { name: imageFileName });
    }

    archive.finalize();

    return zipFileName;
  } catch (error) {
    console.error('Error downloading order images:', error);
    throw new Error('Failed to generate zip file');
  }
};

const downloadAllDocuments = async (documents, zipFileName) => {
  try {
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };
    cloudinary.config(cloudinaryConfig);

    if (!documents || documents.length === 0) {
      throw new Error('No documents found');
    }
    
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    archive.pipe(output);

    for (const document of documents) {
      const { secure_url, public_id, asset_id, original_filename } = document;
      const documentUrl = cloudinary.url(asset_id);
      const documentFileName = `${public_id}_${original_filename}`;
      const response = await axios.get(documentUrl, { responseType: 'stream' });
      archive.append(response.data, { name: documentFileName });
    }

    archive.finalize();

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        resolve(zipFileName);
      });
      archive.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error downloading documents:', error);
    throw new Error('Failed to generate zip file', error);
  }
};

module.exports = {
    removeAllMedia,
    downloadAllMedia,
    downloadAllDocuments,
};
