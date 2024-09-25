const mongoose = require('mongoose');
const Favourite = require('../models/Favourite');

exports.addFavourite = async (req, res) => {
  const { userId, productId } = req.body;
  console.log(`Received userId: ${userId}, productId: ${productId}`); 

  try {
    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId and productId are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid userId or productId' });
    }
    let favourite = await Favourite.findOne({ userId, productId });

    if (!favourite) {
      favourite = new Favourite({ userId, productId });
      await favourite.save();
    } else {
    }

    res.status(200).json({ message: 'Favourite added successfully' });
  } catch (err) {
    console.error('Error adding to favourites:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllFavourites = async (req, res) => {
  const { userId } = req.params;
  try {
    const favourites = await Favourite.find({ userId }).select('productId');
    const productIds = favourites.map(fav => fav.productId);
    res.status(200).json(productIds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFavourite = async (req, res) => {
  const { userId, itemId } = req.query; // Access from query params

  console.log(`Received userId: ${userId}, itemId: ${itemId}`);

  try {
    if (!userId || !itemId) {
      return res.status(400).json({ error: 'userId and itemId are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid userId or itemId' });
    }

    await Favourite.findOneAndDelete({ userId, productId: itemId });

    res.status(200).json({ message: 'Favourite removed successfully' });
  } catch (err) {
    console.error('Error removing favourite:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getFavouriteCount = async (req, res) => {
    const { productId } = req.params;
    try {
      const count = await Favourite.countDocuments({ productId });
      res.status(200).json({ count });
    } catch (err) {
      console.error('Error getting favourite count:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  