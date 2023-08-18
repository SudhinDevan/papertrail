const bannerModel = require('../../model/bannerSchema');
const categoryModel = require('../../model/categorySchema');
const cloudinaryUpload = require('../../utility/uploadImage');



const loadBanner = async (req, res) => {
  try {
    const banners = await bannerModel.find().populate("targetCategory");
    res.render('Admin/banner', { banners });
  } catch (error) {
    console.log(error);
  }
}


const loadAddBanner = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.render('Admin/addBanner', { categories });
  } catch (error) {
    console.log(error);
  }
}


const addBanner = async (req, res) => {
  try {
    const {
      title,
      targetCategory,
      description,
    } = req.body;
    const { image } = req.files;
    const bannerImage = await cloudinaryUpload.imageUpload(image);
    const newBanner = new bannerModel({
      title,
      bannerImage,
      description,
      targetCategory,
    })

    newBanner.save();
    res.redirect('/admin/banner');
  } catch (error) {
    console.log(error);
  }
}


const loadEditBanner = async (req, res) => {
  try {
    const { bannerId } = req.query;
    const banner = await bannerModel.findOne({ _id: bannerId });
    res.render("Admin/editBanner", { banner });
  } catch (error) {
    console.log(error);
  }
}


const editBanner = async (req, res) => {
  try {
    const {
      title,
      description
    } = req.body;
    const { bannerId } = req.query;
    await bannerModel.findByIdAndUpdate(bannerId, {
      title: title,
      description: description,
    })

    res.redirect('/admin/banner');
  } catch (error) {
    console.log(error);
  }
}


const deleteBanner = async (req, res) => {
  try {
    const bannerId = req.query.bannerId;
    const banner = await bannerModel.deleteOne({ _id: bannerId });
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadBanner,
  loadAddBanner,
  addBanner,
  loadEditBanner,
  editBanner,
  deleteBanner,
}
