// Client helper to fetch and render recommendations
async function fetchSimpleRecommendations(userId, limit = 5) {
  const res = await fetch(`/api/simple/recommendations/${userId}?limit=${limit}`);
  return res.ok ? res.json() : null;
}

async function fetchSimpleSimilarProducts(productId, limit = 5) {
  const res = await fetch(`/api/simple/similar-products/${productId}?limit=${limit}`);
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
      <img src="${p.image || '/uploads/default.png'}" alt="${p.name || ''}" width="60" />
      <strong>${p.name || ''}</strong>
      <div>Score: ${item.score || item.predictedRating || item.avgRating || ''}</div>
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
      <img src="${p.image || '/uploads/default.png'}" alt="${p.name || ''}" width="60" />
      <strong>${p.name || ''}</strong>
      <div>Common raters: ${item.commonRaters || ''}</div>
    `;
    container.appendChild(div);
  });
}

export { fetchSimpleRecommendations, fetchSimpleSimilarProducts, renderRecommendations, renderSimilarProducts };
