// Client helper to fetch and render recommendations (copied from Back-End public)
async function fetchSimpleRecommendations(userId, limit = 5) {
  const res = await fetch(`http://localhost:3001/api/simple/recommendations/${userId}?limit=${limit}`);
  return res.ok ? res.json() : null;
}

async function fetchSimpleSimilarProducts(productId, limit = 5) {
  const res = await fetch(`http://localhost:3001/api/simple/similar-products/${productId}?limit=${limit}`);
  return res.ok ? res.json() : null;
}

function renderRecommendations(data, containerId = 'recommendations') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!data || !data.recommendedProducts || data.recommendedProducts.length === 0) {
    container.innerHTML = '<p>No recommendations available.</p>';
    return;
  }

  data.recommendedProducts.forEach((item) => {
    const p = item.product;
    const div = document.createElement('div');
    div.className = 'rec-item';
    div.innerHTML = `
      <a href="customer-product-details.html?id=${p._id}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;">
        <img src="${p.imageUrl || '/uploads/default.png'}" alt="${p.title || ''}" width="60" />
        <div>
          <strong>${p.title || ''}</strong>
          <div style="font-size:12px;color:#666;">Score: ${item.score || item.predictedRating || item.avgRating || ''}</div>
        </div>
      </a>
    `;
    container.appendChild(div);
  });
}

function renderSimilarProducts(data, containerId = 'similar-products') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!data || !data.similarProducts || data.similarProducts.length === 0) {
    container.innerHTML = '<p>No similar products found.</p>';
    return;
  }

  data.similarProducts.forEach((item) => {
    const p = item.product;
    const div = document.createElement('div');
    div.className = 'sim-item';
    div.innerHTML = `
      <a href="customer-product-details.html?id=${p._id}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;">
        <img src="${p.imageUrl || '/uploads/default.png'}" alt="${p.title || ''}" width="60" />
        <div>
          <strong>${p.title || ''}</strong>
          <div style="font-size:12px;color:#666;">Common raters: ${item.commonRaters || ''}</div>
        </div>
      </a>
    `;
    container.appendChild(div);
  });
}

export { fetchSimpleRecommendations, fetchSimpleSimilarProducts, renderRecommendations, renderSimilarProducts };
