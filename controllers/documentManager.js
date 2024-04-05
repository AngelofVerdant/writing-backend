const ErrorResponse = require("../utils/errorResponse");
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const multer = require('multer');

const upload = multer();

exports.create = async (req, res, next) => {
  try {
    upload.fields([{ name: 'files' }, { name: 'subfolder' }])(req, res, async (err) => {
      if (err) {
        return next(new ErrorResponse("Error uploading files", 400));
      }

      const subfolder = req.body.subfolder || "default_subfolder";
      const folderName = `${process.env.CLOUDINARY_ROOT_FOLDER}/${subfolder}`;

      if (!req.files || !req.files.files) {
        return next(new ErrorResponse("No files passed", 400));
      }

      const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
      console.log(files)

      const cloudinaryConfig = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      };
      
      cloudinary.config(cloudinaryConfig);

      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: folderName,
              resource_type: "raw",
              filename: file.originalname
            },
            (error, result) => {
              if (error) {
                console.error('Error uploading file:', error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      try {
        const results = await Promise.all(uploadPromises);
        res.status(200).json({ success: true, message: "Upload Success", data: { documents: results } });
      } catch (uploadError) {
        return next(new ErrorResponse("Error uploading files", 400));
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  const { public_id } = req.body;

  try {
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    cloudinary.config(cloudinaryConfig);

    const result = await cloudinary.uploader.destroy(public_id);

    res.status(200).json({ success: true, message: "Delete Success", data: { documents: result } });
  } catch (error) {
    next(error);
  }
};