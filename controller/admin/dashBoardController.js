const categoryModel = require("../../model/categorySchema");
const orderModel = require("../../model/orderSchema");
const userModel = require("../../model/userSchema");


const loadDashboard = async (req, res) => {
  try {
    let filterValue = 30;
    if (req.query.filter1) {
      filterValue = parseInt(req.query.filter1);
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - filterValue);

    const daily = await orderModel.aggregate([
      {
        $match: {
          order_date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$order_date",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const user = await userModel.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const category = await orderModel.aggregate([
      {
        $lookup: {
          from: "orderitems",
          localField: "items",
          foreignField: "_id",
          as: "orderdata",
        },
      },
      {
        $unwind: "$orderdata",
      },
      {
        $lookup: {
          from: "products",
          localField: "orderdata.product",
          foreignField: "_id",
          as: "productdata",
        },
      },
      {
        $unwind: "$productdata",
      },
      {
        $group: {
          _id: "$productdata.category",
          count: { $sum: 1 },
        },
      },
    ]);

    let cat = [];
    for (id of category) {
      let val = JSON.parse(
        JSON.stringify(
          await categoryModel.findById(id._id, { categoryName: 1 })
        )
      );

      val.count = id.count;
      cat.push(val);
    }

    const orders = await orderModel
      .find()
      .populate("user")
      .sort({ order_date: -1 })
      .limit(5);

    const orderCount = await orderModel.countDocuments();
    const userCount = await userModel.countDocuments();
    res.render("admin/dashboard", {
      daily,
      category: cat,
      orderCount,
      userCount,
      user,
      orders,
    });
  } catch (error) {
    res.render("user/404page");
  }
};



module.exports = {
  loadDashboard,
}
