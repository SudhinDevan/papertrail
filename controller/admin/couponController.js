const couponModel = require('../../model/couponSchema')

const loadCoupon = async (req, res) => {
  try {
    const coupons = await couponModel.find();
    res.render("Admin/coupon", { coupons });

  } catch (error) {
    throw new Error(error);
  }
}


const loadAddCoupon = (req, res) => {
  try {

    res.render('admin/addCoupon');

  } catch (error) {
    throw new Error(error)
  }
}


const addCoupon = async (req, res) => {
  try {

    const {

      discount,
      expiryDate,
      minimumAmount,
    } = req.body;

    let name = req.body.name.toUpperCase();


    const couponExist = await couponModel.findOne({ couponName: name });


    if (couponExist) {
      res.json({ response: false });
    } else {

      const newCoupon = new couponModel({
        couponName: name,
        discount: discount,
        expiryDate: expiryDate,
        minAmount: minimumAmount,
      });

      await newCoupon.save();
      res.json({ response: true });
    }


  } catch (error) {
    throw new Error(error)
  }
}


const loadEditCoupon = async (req, res) => {
  try {

    const { id } = req.query;

    const coupon = await couponModel.findOne({ _id: id });

    const expDate = coupon.expiryDate.toISOString().substring(0, 10);

    res.render('Admin/editCoupon', { coupon, expDate });

  } catch (error) {
    throw new Error(error);
  }
}



const editCoupon = async (req, res) => {
  try {

    const {
      id,
      discount,
      expiryDate,
      minimumAmount,
    } = req.body;


    await couponModel.findByIdAndUpdate(id, { discount: discount, expiryDate: expiryDate, minAmount: minimumAmount });
    res.json({ response: true });

  } catch (error) {
    throw new Error(error);
  }
}


const applyCoupon = async (req, res) => {
  try {
    const { couponName, addressId, cartPrice } = req.body;
    const user = req.session.User_id;

    const coupon = await couponModel.findOne({ couponName: couponName });

    if (!coupon) {
      return res.json({ response: false, message: 'Coupon not found' });
    }

    // Check if the coupon is active and not expired
    if (!coupon.isActive || coupon.expiryDate < new Date()) {
      return res.json({ response: false, message: 'Coupon is not valid' });
    }

    // Check if the user already owns the coupon
    const userCoupon = await couponModel.findOne({couponName: couponName, "owners.user": user});
    if (userCoupon) {
      return res.json({ response: 'applied' });
    }

    // Check if the cart price meets the minimum amount required by the coupon
    if (cartPrice >= coupon.minAmount) {
      // Apply the coupon discount to the cartPrice (You may implement this part based on your logic)
      const discountedPrice = cartPrice - coupon.discount;
      return res.json({ response: true, coupon: coupon, discountedPrice: discountedPrice });
    } else {
      return res.json({ response: 'min', message: 'Cart amount does not meet the minimum requirement for the coupon' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ response: false, message: 'Server error' });
  }
};



module.exports = {
  loadCoupon,
  loadAddCoupon,
  addCoupon,
  loadEditCoupon,
  editCoupon,
  applyCoupon,
}