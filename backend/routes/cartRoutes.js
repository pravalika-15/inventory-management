const express = require("express");
const router = express.Router();
const Cart = require("../Schema/cartSchema");
const Product = require("../Schema/productModel");

router.post("/cart", async (req, res) => {
  try {
    console.log(req.body);
    const { productId, quantity, userId } = req.body;

    // Retrieve the product details from the product collection
    const product = await Product.findById(productId);
    console.log(product);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const price = product.price;

    // Check if the cart already exists for the user
    let cart = await Cart.findOne({ userId });
    console.log(cart);

    if (!cart) {
      // If cart doesn't exist, create a new cart and add the item to it
      cart = new Cart({ userId });
      // console.log(cart);
    }

    // Check if the cart item already exists
    const existingCartItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingCartItem) {
      // If the item exists, update the quantity
      existingCartItem.quantity += quantity;
    } else {
      // If the item doesn't exist, create a new cart item
      const newCartItem = {
        productId,
        quantity,
        price,
      };
      cart.items.push(newCartItem);
    }

    // Save the cart to the database
    const savedCart = await cart.save();
    const newCartItem = savedCart.items.find(
      (item) => item.productId.toString() === productId
    );
    res.status(201).json(newCartItem);
    // res.status(201).json(savedCart);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

router.put("/cart/items/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { quantity } = req.body;

    // Find the cart item by its ID and update the quantity
    const updatedItem = await Cart.findOneAndUpdate(
      { "items._id": itemId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ error: "Failed to update cart item quantity" });
  }
});

router.get("/cart/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);
    // Retrieve the cart items for the given user from the cart collection and populate the product information
    const cartItems = await Cart.find({ userId }).populate("items.productId");
    console.log(cartItems);
    res.json(cartItems);
    console.log(cartItems);
  } catch (error) {
    console.error("Error retrieving cart items:", error);
    res.status(500).json({ error: "Failed to retrieve cart items" });
  }
});

router.delete("/cart/:userId/:itemId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const itemId = req.params.itemId;

    console.log("Deleting item. User ID:", userId, "Item ID:", itemId);

    const cart = await Cart.findOneAndUpdate(
      { userId: userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    console.log("Updated Cart:", cart);

    if (cart) {
      return res.json({ message: "Item removed from cart" });
    } else {
      return res.status(404).json({ error: "Item not found in cart" });
    }
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({ error: "Failed to remove item from cart" });
  }
});

// for clearing the cart for a particular user
router.delete("/cart/clear/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Delete the cart from the cart collection for the specified user
    const deletedCart = await Cart.findOneAndDelete({ userId });

    if (deletedCart) {
      res.json({ message: "Cart cleared successfully" });
    } else {
      res.status(404).json({ error: "Cart not found for the user" });
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

module.exports = router;
