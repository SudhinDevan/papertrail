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



//yearly
const loadSalesReport = async (req, res) => {
  try {
    const yearly = await orderModel.aggregate([
      {
        $match: { order_status: { $eq: "delivered" } },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "items",
          foreignField: "_id",
          as: "orderdata",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$order_date" },
          },
          items: { $sum: { $sum: "$orderdata.quantity" } },
          count: { $sum: 1 },
          total: { $sum: "$price" },
        },
      },
    ]);

    console.log(yearly);

    res.render("Admin/sale", { yearly });
  } catch (error) {
    res.render("User/404page");
  }
};



//monthly
const monthlySaleReport = async (req, res) => {
  try {
    const sales = await orderModel.aggregate([
      {
        $match: { order_status: { $eq: "delivered" } },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "items",
          foreignField: "_id",
          as: "orderdata",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$order_date" },
          },
          items: { $sum: { $sum: "$orderdata.quantity" } },
          count: { $sum: 1 },
          total: { $sum: "$price" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlySales = sales.map((sale) => {
      let oneSale = { ...sale };
      oneSale._id.month = months[oneSale._id.month - 1];
      return oneSale;
    });

    res.json({ monthlySales, error: false });
  } catch (error) {
    res.render("user/404page");
  }
};



const dailySalesReport = async (req, res) => {
  try {
    const dailySales = await orderModel.aggregate([
      {
        $match: { order_status: { $eq: "delivered" } },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "items",
          foreignField: "_id",
          as: "orderdata",
        },
      },
      {
        $group: {
          _id: {
            Year: { $year: "$order_date" },
            Month: { $month: "$order_date" },
            Day: { $dayOfMonth: "$order_date" },
          },
          items: { $sum: { $sum: "$orderdata.quantity" } },
          count: { $sum: 1 },
          total: { $sum: "$price" },
        },
      },
      {
        $sort: { "_id.Year": -1, "_id.Month": 1, "_id.Day": 1 },
      },
    ]);

    res.json({ dailySales, error: false });
  } catch (error) {
    res.render("user/404page");
  }
};


const byDateSaleReport = async (req, res) => {
  try {
    const { dateRange } = req.body;
    const date = dateRange.split("-");
    const startDate = date[0].trim();
    const endDate = date[1].trim();

    const [startDay, startMonth, startYear] = startDate.split("/");
    const [endDay, endMonth, endYear] = endDate.split("/");

    const formattedStartDate = `${startYear}-${startMonth.padStart(
      2,
      "0"
    )}-${startDay.padStart(2, "0")}T00:00:00.000Z`;
    const formattedEndDate = `${endYear}-${endMonth.padStart(
      2,
      "0"
    )}-${endDay.padStart(2, "0")}T00:00:00.000Z`;

    const byDateSales = await orderModel.aggregate([
      {
        $match: {
          order_status: "delivered",
          order_date: {
            $gte: new Date(formattedStartDate),
            $lte: new Date(formattedEndDate),
          },
        },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "items",
          foreignField: "_id",
          as: "orderdata",
        },
      },
      {
        $group: {
          _id: {
            Year: { $year: "$order_date" },
            Month: { $month: "$order_date" },
            Day: { $dayOfMonth: "$order_date" },
          },
          items: { $sum: { $sum: "$orderdata.quantity" } },
          count: { $sum: 1 },
          total: { $sum: "$price" },
        },
      },
      {
        $sort: { "_id.Year": -1, "_id.Month": 1, "_id.Day": 1 },
      },
    ]);

    res.json({ byDateSales, error: false });
  } catch (error) {
    res.render("user/404page");
  }
};



module.exports = {
  loadDashboard,
  loadSalesReport,
  monthlySaleReport,
  dailySalesReport,
  byDateSaleReport,
}
