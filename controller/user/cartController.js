const objectId = require('mongoose').Types.ObjectId;
const cartModel = require('../../model/cartSchema');
const productModel = require('../../model/productSchema');
const userModel = require('../../model/userSchema');



const loadCart = async (req, res) => {
    const id = req.session.User_id;
    const user = await userModel.findOne({ _id: id });
    let cart = await cartModel.findOne({ userId: user })
    let productList = [];
    let products;
    if (cart) {

        for (const item of cart.items) {
            const product = await productModel.findOne({ _id: item.productId });

            if (item.quantity > product.quantity) {
                await cartModel.updateOne(
                    {
                        userId: id,
                        "items.productId": item.productId
                    },
                    { $set: { "items.$.quantity": product.quantity } }
                )
            }
        }



        products = await cartModel
            .findOne({ userId: req.session.User_id })
            .populate("items.productId");

        products.items.forEach((item) => {
            productList.push(item.productId)
        })

    }

    res.render("User/cart", { id, user, cart, products, productList });


}



const addToCart = async (req, res) => {
    try {

        const { productId } = req.query;
        const userId = req.session.User_id;



        const cart = await cartModel.findOne({ userId: userId });
        const product = await productModel.findOne({ _id: productId });





        if (cart) {

            let productExist = await cartModel.findOne({ userId: userId, "items.productId": productId });

            if (productExist) {

                const cartProduct = cart.items.find((item) => item.productId == productId)

                if (cartProduct.quantity >= product.quantity) {
                    res.json({ response: false })
                } else {


                    await cartModel.findOneAndUpdate({ userId: userId, "items.productId": productId },
                        {
                            $inc: {
                                "items.$.quantity": 1,
                                "items.$.totalPrice": product.price,
                            }
                        })

                }
            } else {
                await cartModel.findOneAndUpdate({ userId: userId },
                    {
                        $push: {
                            items: [
                                {
                                    productId,
                                    totalPrice: product.price,
                                }
                            ]
                        }
                    })
            }

        } else {
            const newItem = new cartModel({
                userId: userId,
                items: [
                    {
                        productId,
                        totalPrice: product.price
                    }
                ]
            })
            await newItem.save();
        }

        const cartTotalPrice = await cartModel.aggregate([
            {
                $match: { userId: new objectId(userId) }
            },
            {
                $unwind: "$items"
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$items.totalPrice" }
                }
            }
        ])


        await cartModel.updateOne(
            { userId: userId },
            { $set: { cartPrice: cartTotalPrice[0].total } }
        )

        res.json({ response: true });


    } catch (error) {
        console.log(error);
    }
}



const incrementQuantity = async (req, res) => {
    try {

        const { userId, productId } = req.query;

        const product = await productModel.findOne({ _id: productId });

        await cartModel.findOneAndUpdate({ userId: userId, "items.productId": productId },
            {
                $inc: {
                    "items.$.quantity": 1,
                    "items.$.totalPrice": product.price,
                    cartPrice: product.price,
                }
            })

        res.json({ response: true })

    } catch (error) {

        console.log(error);

    }

}


const decrementQuantity = async (req, res) => {
    try {

        const { userId, productId } = req.query;

        const product = await productModel.findOne({ _id: productId });


        await cartModel.findOneAndUpdate({ userId: userId, "items.productId": productId },
            {
                $inc: {
                    "items.$.quantity": -1,
                    "items.$.totalPrice": -product.price,
                    cartPrice: -product.price,
                }
            })


        res.json({ response: true })

    } catch (error) {

        console.log(error);

    }

}

const removeItem = async (req, res) => {
    try {
        const { productId, userId } = req.query;

        await cartModel.findOneAndUpdate(
            { userId: userId, "items.productId": productId },
            { $pull: { "items": { productId: productId } } }
        );

        const cart = await cartModel.findOne({ userId: userId });

        if (cart && cart.items.length > 0) {
            const cartTotalPrice = await cartModel.aggregate([
                { $match: { userId: new objectId(userId) } },
                { $unwind: "$items" },
                { $group: { _id: null, totalcost: { $sum: "$items.totalPrice" } } }
            ]);

            await cartModel.updateOne(
                { userId: userId },
                { $set: { cartPrice: cartTotalPrice[0].totalcost } }
            );


        } else {
            await cartModel.updateOne({ userId: userId }, { cartPrice: 0 });
        }

        res.json({ response: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ response: false, error: "An error occurred while removing the item." });
    }
};



module.exports = {
    addToCart,
    loadCart,
    incrementQuantity,
    decrementQuantity,
    removeItem,

}