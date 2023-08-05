const cloudinary = require('cloudinary').v2;


const deleteImage = async (public_id) => {
  await cloudinary.uploader.destroy(public_id)
    .then(() => {
      return true;
    })
    .catch((error) => {
      return false;
    })
}

module.exports = deleteImage;
