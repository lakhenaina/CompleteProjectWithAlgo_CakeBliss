# Collaborative Filtering Algorithm - Project Documentation

## 📋 Overview

This project implements **two collaborative filtering algorithms** to provide personalized product recommendations to users based on their ratings and behavior.

---

## **Algorithm 1: User-Based Collaborative Filtering**

### **Algorithm Description**

User-Based Collaborative Filtering (UBCF) recommends products by finding users with similar rating patterns and suggesting products those similar users liked.

### **How It Works**

1. **Find Similar Users:**
   - Calculate similarity between target user and all other users
   - Use Pearson Correlation coefficient to measure similarity
   - Return top 5-10 most similar users

2. **Get Similar Users' Ratings:**
   - Collect all products rated by similar users
   - Filter out products already rated by target user

3. **Predict Ratings:**
   - Calculate weighted average of similar users' ratings
   - Weight = similarity score × rating
   - Formula: `Predicted Rating = Σ(similarity × rating) / Σ(|similarity|)`

4. **Rank & Return:**
   - Sort by predicted rating (highest first)
   - Return top 5 recommendations

### **Mathematical Formula**

**Pearson Correlation Similarity:**

```
similarity(u1, u2) = Σ[(r1i - mean1) × (r2i - mean2)] / √[Σ(r1i - mean1)² × Σ(r2i - mean2)²]
```

Where:
- `r1i, r2i` = ratings of users u1 and u2 for product i
- `mean1, mean2` = average ratings of u1 and u2 respectively
- Only products rated by BOTH users are considered

### **Implementation Location**

**Backend:** [`Back-End/services/collaborativeFiltering.js`](Back-End/services/collaborativeFiltering.js)

**Functions:**
- `calculateSimilarity()` - Calculates Pearson correlation between two users
- `findSimilarUsers()` - Finds users most similar to target user
- `getRecommendations()` - Returns personalized recommendations
- `getSimilarProducts()` - Finds products similar to a given product

### **API Endpoint**

```
GET /api/recommendations/:userId?limit=5
```

**Response:**
```json
{
  "success": true,
  "userId": "user123",
  "recommendedProducts": [
    {
      "product": {
        "_id": "product456",
        "title": "Chocolate Cake",
        "price": 500,
        "imageUrl": "..."
      },
      "predictedRating": "4.75"
    }
  ]
}
```

### **Complexity**

- **Time:** O(n × m) where n = number of users, m = average products rated
- **Space:** O(n × m) to store similarity matrix

---

## **Algorithm 2: Item-Based Collaborative Filtering (Simple Co-occurrence)**

### **Algorithm Description**

Item-Based CF finds products that are frequently rated by the same users (co-occurrence). It identifies products that "go together" based on user behavior.

### **How It Works**

1. **Find Liked Products:**
   - Identify products user rated highly (≥ 4 stars)
   - If user has no high ratings, fallback to popular products

2. **Find Co-raters:**
   - Get all users who rated the liked products
   - These are users with similar taste

3. **Find Co-occurring Products:**
   - Find other products rated by these co-raters
   - Calculate: count of users who rated THIS product
   - Calculate: average rating from co-raters

4. **Rank & Return:**
   - Sort by: frequency (count) then average rating
   - Filter out products already rated by user
   - Return top 5 recommendations

### **Mathematical Formula**

**Co-occurrence Score:**

```
score(p1, p2) = count(users who rated both p1 and p2) × avg_rating(p2)
```

Where:
- `p1` = product the user liked
- `p2` = candidate product to recommend
- `count` = number of users who rated both products
- Higher count = more reliable recommendation

### **Implementation Location**

**Backend:** [`Back-End/services/simpleCollaborative.js`](Back-End/services/simpleCollaborative.js)

**Functions:**
- `getSimpleRecommendations()` - Recommends based on liked products
- `getSimpleSimilarProducts()` - Finds similar products via co-occurrence
- `getPopularProducts()` - Fallback to most popular products

### **API Endpoint**

```
GET /api/simple/recommendations/:userId?limit=5
```

**Response:**
```json
{
  "success": true,
  "userId": "user123",
  "recommendedProducts": [
    {
      "product": {
        "_id": "product789",
        "title": "Black Forest Cake",
        "price": 600,
        "imageUrl": "..."
      },
      "score": 4.25,
      "avgRating": "4.50"
    }
  ]
}
```

### **Complexity**

- **Time:** O(m × k) where m = liked products, k = products rated by co-raters
- **Space:** O(p) where p = total products

---

## **Data Model**

### **Rating Schema**

```
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  product: ObjectId (ref: Product),
  rating: Number (1-5),
  review: String (optional),
  createdAt: Date
}
```

### **Important:** Unique constraint on `{user, product}` to prevent duplicate ratings

---

## **System Architecture**

```
┌─────────────────────────────────────────────┐
│        Frontend (customer-product-details)   │
│  - User submits rating (1-5) + review       │
│  - Display existing ratings                  │
│  - Show average rating & review count        │
└──────────────┬──────────────────────────────┘
               │ POST /api/ratings
               ▼
┌─────────────────────────────────────────────┐
│      Backend API Routes                      │
│  - POST /api/ratings (save rating)          │
│  - GET /api/recommendations/:userId         │
│  - GET /api/simple/recommendations/:userId  │
│  - GET /api/product-ratings/:productId      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│    Collaborative Filtering Services          │
│  ┌──────────────────────────────────┐       │
│  │ collaborativeFiltering.js        │       │
│  │ - User-based similarity (UBCF)  │       │
│  │ - Pearson correlation           │       │
│  └──────────────────────────────────┘       │
│  ┌──────────────────────────────────┐       │
│  │ simpleCollaborative.js           │       │
│  │ - Item co-occurrence (IBCF)      │       │
│  │ - Popularity fallback            │       │
│  └──────────────────────────────────┘       │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│      MongoDB Database                        │
│  - ratings collection (user ratings)        │
│  - users collection                         │
│  - products collection                      │
└─────────────────────────────────────────────┘
```

---

## **Workflow Example**

### **Scenario: User John rates products**

```
Step 1: User Registration
└─ John creates account with email: john@gmail.com

Step 2: User Views & Rates Products
├─ Chocolate Cake → 5 stars ⭐⭐⭐⭐⭐ "Delicious!"
├─ Black Forest → 4 stars ⭐⭐⭐⭐
└─ Strawberry → 3 stars ⭐⭐⭐

Step 3: System Stores Ratings
└─ MongoDB: Rating(john, chocolate_cake, 5)
           Rating(john, black_forest, 4)
           Rating(john, strawberry, 3)

Step 4: Algorithm Analysis
├─ Find similar users (e.g., Jane with similar taste)
├─ Jane also liked Chocolate & Black Forest
├─ Jane gave Red Velvet 5 stars
└─ System predicts: john.rating(red_velvet) ≈ 4.5

Step 5: Provide Recommendations
└─ GET /api/recommendations/john_id
   → Returns: [Red Velvet (predicted: 4.5), ...]

Step 6: Show to User
└─ Frontend displays: "Customers also liked: Red Velvet Cake"
```

---

## **Testing the Algorithm**

### **Test Case 1: Single User (No Recommendations)**

```
Action: Register 1 user, add 2 ratings
Expected: No recommendations (need multiple users)
Result: Falls back to popular products
```

### **Test Case 2: Multiple Users, Similar Taste**

```
Setup:
├─ User 1: Chocolate(5), Black Forest(4), Red Velvet(3)
└─ User 2: Chocolate(4), Black Forest(5), Fruit Cake(4)

Test:
├─ GET /api/recommendations/user1
Expected:
├─ Top recommendation: Fruit Cake (co-rater gave 4)
└─ Predicted rating: ~4.0

Status: ✅ PASS
```

### **Test Case 3: Different Tastes (Low Similarity)**

```
Setup:
├─ User 1: Chocolate(5), Black Forest(5)
└─ User 2: Fruit Cake(5), Carrot Cake(5)

Test:
├─ GET /api/recommendations/user1
Expected:
├─ Top recommendation: Popular products
└─ Reason: Users have different taste (similarity ≈ 0)

Status: ✅ PASS
```

---

## **Performance Metrics**

| Metric | User-Based | Item-Based |
|--------|-----------|-----------|
| Speed | O(n×m) - Slower | O(m×k) - Faster |
| Scalability | Limited (many users) | Better |
| Cold Start | Poor (new products) | Better |
| Sparsity Handling | Bad | Good |
| Accuracy | Higher | Moderate |

---

## **Algorithm Comparison**

| Feature | User-Based UBCF | Item-Based IBCF |
|---------|-----------------|-----------------|
| **Approach** | Find similar users | Find similar products |
| **Formula** | Pearson Correlation | Co-occurrence count |
| **Best For** | Stable user base | Sparse data |
| **Pros** | More personalized | Faster, scalable |
| **Cons** | Slower, sparsity issue | Less personalized |
| **When to Use** | < 10,000 users | Growing platforms |

---

## **Usage Instructions**

### **For End Users**

1. **Register & Login:**
   ```
   Navigate to: http://localhost:5500/login.html
   Create account with email & password
   ```

2. **Rate Products:**
   ```
   Go to: http://localhost:5500/customer-products.html
   Click product → Scroll to "Rate This Product"
   Select 1-5 stars + Optional review
   Click "Submit Rating"
   ```

3. **View Recommendations:**
   ```
   Go to: http://localhost:5500/recommended_cakes.html
   See personalized cake recommendations
   ```

### **For Developers**

**Test User-Based Recommendations:**
```bash
curl "http://localhost:3001/api/recommendations/USER_ID?limit=5"
```

**Test Item-Based Recommendations:**
```bash
curl "http://localhost:3001/api/simple/recommendations/USER_ID?limit=5"
```

**Check Product Ratings:**
```bash
curl "http://localhost:3001/api/product-ratings/PRODUCT_ID"
```

---

## **Limitations & Future Improvements**

### **Current Limitations**

1. **Cold Start Problem:** New users/products have no ratings
2. **Data Sparsity:** Most users rate only a few products
3. **Scalability:** O(n²) complexity for UBCF with large datasets
4. **No Context:** Ignores product category, price, seasonality

### **Future Improvements**

1. **Hybrid Approach:** Combine UBCF + IBCF + content-based
2. **Matrix Factorization:** Use SVD for better scalability
3. **Deep Learning:** Use neural networks for better predictions
4. **Cold Start Solution:**
   - New user: Recommend popular products
   - New product: Content-based filtering
5. **Context-Aware:** Consider time, season, occasion
6. **Implicit Feedback:** Track clicks, views, cart additions
7. **Real-time Updates:** Use streaming/event-driven architecture

---

## **Files Modified**

```
Back-End/
├── services/
│   ├── collaborativeFiltering.js (User-based UBCF)
│   └── simpleCollaborative.js (Item co-occurrence)
├── routes/
│   └── recommendations.js (API endpoints)
├── model/
│   └── rating_model.js (Rating schema)
└── app.js (Server setup)

Front-End/
├── customer-product-details.html (Rating form)
├── recommended_cakes.html (Recommendations display)
├── login.js (Store userId in localStorage)
└── recommendations.js (Fetch & display recommendations)
```

---

## **References**

- **Pearson Correlation:** https://en.wikipedia.org/wiki/Pearson_correlation_coefficient
- **Collaborative Filtering:** https://en.wikipedia.org/wiki/Collaborative_filtering
- **CF Algorithms:** https://towardsdatascience.com/collaborative-filtering-1a9c1ab09f4
- **MongoDB:** https://docs.mongodb.com/
- **Express.js:** https://expressjs.com/

---

**Last Updated:** February 9, 2026  
**Project:** Cake's Bliss - E-commerce with Recommendations
