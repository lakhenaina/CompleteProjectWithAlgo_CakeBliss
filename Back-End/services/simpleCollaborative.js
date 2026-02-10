import mongoose from 'mongoose';
import Rating from '../model/rating_model.js';
import Product from '../model/product_model.js';

/**
 * Simple item-based collaborative filtering using co-occurrence
 * - For a given product, find other products commonly rated by the same users
 * - For a given user, take products they rated highly and aggregate co-occurrence
 */

async function getPopularProducts(limit = 5, excludeProductIds = []) {
  try {
    const exclude = excludeProductIds.map((id) => new mongoose.Types.ObjectId(id));

    // Try to get rated products first
    const ratings = await Rating.aggregate([
      { $match: { product: { $nin: exclude } } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: limit }
    ]);

    if (ratings.length > 0) {
      const populated = await Promise.all(
        ratings.map(async (r) => {
          const product = await Product.findById(r._id);
          return { product, score: r.avgRating.toFixed(2) };
        })
      );
      return populated;
    }

    // Fallback: return top products by ID (latest added) if no ratings exist
    console.log('No ratings found, returning latest products instead');
    const products = await Product.find({ _id: { $nin: exclude } })
      .sort({ _id: -1 })
      .limit(limit);

    return products.map((p) => ({
      product: p,
      score: 0  // No rating data yet
    }));

  } catch (err) {
    console.error('getPopularProducts error:', err);
    return [];
  }
}

export async function getSimpleSimilarProducts(productId, limit = 5) {
  try {
    const pid = new mongoose.Types.ObjectId(productId);

    // get users who rated this product
    const users = await Rating.find({ product: pid }).select('user');
    const userIds = users.map((u) => u.user);

    if (userIds.length === 0) return [];

    const co = await Rating.aggregate([
      { $match: { user: { $in: userIds }, product: { $ne: pid } } },
      { $group: { _id: '$product', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1, avgRating: -1 } },
      { $limit: limit }
    ]);

    const populated = await Promise.all(
      co.map(async (c) => {
        const product = await Product.findById(c._id);
        return { product, commonRaters: c.count, avgRating: c.avgRating.toFixed(2) };
      })
    );

    return populated;
  } catch (err) {
    console.error('getSimpleSimilarProducts error:', err);
    return [];
  }
}

export async function getSimpleRecommendations(userId, limit = 5) {
  try {
    // Validate and convert userId to ObjectId if it's a valid hex string
    let uid;
    try {
      uid = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      // Invalid ObjectId format - return popular products as fallback
      console.log('Invalid userId format, returning popular products instead');
      return getPopularProducts(limit, []);
    }

    // Products the user already rated
    const userRatings = await Rating.find({ user: uid }).select('product rating');
    const ratedProductIds = userRatings.map((r) => r.product.toString());

    // Consider user's liked products (rating >= 4)
    const liked = userRatings.filter((r) => r.rating >= 4).map((r) => r.product);

    if (liked.length === 0) {
      // fallback to popular products
      return getPopularProducts(limit, ratedProductIds);
    }

    // Aggregate co-occurrence across liked products
    const likedIds = liked.map((id) => new mongoose.Types.ObjectId(id));

    const usersWhoRatedLiked = await Rating.find({ product: { $in: likedIds } }).distinct('user');

    const co = await Rating.aggregate([
      { $match: { user: { $in: usersWhoRatedLiked }, product: { $nin: likedIds } } },
      { $group: { _id: '$product', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1, avgRating: -1 } },
      { $limit: limit * 5 }
    ]);

    // Filter out any products the user already rated
    const filtered = co.filter((c) => !ratedProductIds.includes(c._id.toString())).slice(0, limit);

    const populated = await Promise.all(
      filtered.map(async (c) => {
        const product = await Product.findById(c._id);
        return { product, score: c.count, avgRating: c.avgRating.toFixed(2) };
      })
    );

    return populated;
  } catch (err) {
    console.error('getSimpleRecommendations error:', err);
    return [];
  }
}

export default {
  getSimpleRecommendations,
  getSimpleSimilarProducts,
  getPopularProducts
};
