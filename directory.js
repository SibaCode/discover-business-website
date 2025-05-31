const API_URL = '/api/businesses';
const API_URL_IMAGES = '';
const imagePath = '/uploads/1748388513258-158962106.png'; // get this dynamically from API


async function fetchBusinessesFromAPI() {
  const container = document.getElementById("businessCardsContainer");
  const filterContainer = document.querySelector(".category_filter");
  const countDisplay = document.getElementById("businessCount");

  if (!container || !filterContainer) {
    console.error("Container or filter container not found");
    return;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch businesses');

    const businesses = await response.json();

    // Clear previous cards and filters
    container.innerHTML = '';
    filterContainer.innerHTML = '';

    // Get unique industries, normalized to lowercase and safe CSS class format
    const industriesSet = new Set();
    businesses.forEach(biz => {
      if (biz.industry) {
        const normalized = biz.industry.toLowerCase().replace(/[^a-z0-9]/g, '-');
        industriesSet.add(normalized);
      }
    });
    const industries = Array.from(industriesSet).sort();

    // Always add "All" filter first
    let filtersHTML = `
      <label class="container_radio">All
        <input type="radio" id="all_2" name="categories_filter" value="all" checked data-filter="*" class="selected">
        <span class="checkmark"></span>
      </label>
    `;

    // Add filters for each unique industry
    industries.forEach(industryClass => {
      // Capitalize label text nicely
      const labelText = industryClass.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      filtersHTML += `
        <label class="container_radio">${labelText}
          <input type="radio" id="${industryClass}" name="categories_filter" value="${industryClass}" data-filter=".${industryClass}">
          <span class="checkmark"></span>
        </label>
      `;
    });

    filterContainer.innerHTML = filtersHTML;
    if (countDisplay) {
      countDisplay.textContent = businesses.length;
    }
    // Render the business cards
    businesses.forEach(biz => {
      console.log(biz)
      const industryClass = biz.industry ? biz.industry.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'other';

      const card = document.createElement("div");
      card.className = `col-xl-4 col-lg-6 col-md-6 isotope-item ${industryClass}`;

      const imageLink = `${API_URL_IMAGES}${biz.imageUrl}`;

      card.innerHTML = `
        <div class="strip grid">
          <figure>
            <a href="#0" class="wish_bt"></a>
            <a href="detail-shop.html?id=${biz.id}">
              <img src="${imageLink}" class="img-fluid square-image" alt="${biz.name}">
              <div class="read_more"><span>Read more</span></div>
            </a>
            <small>${biz.industry || 'Business'}</small>
          </figure>
          <div class="wrapper">
            <h3><a href="detail-shop.html?id=${biz.id}">${biz.name}</a></h3>
            <small>${biz.location}</small>
            <p>${biz.description}</p>
          </div>
          <ul>
            <li><span class="loc_open">${biz.contactNumber}</span></li>
            <li><a href="detail-shop.html?id=${biz.id}"class="score"><strong>See More</strong></a></li>
          </ul>
        </div>
      `;
      container.appendChild(card);
    });

    // Re-init or refresh Isotope if you use it
    if (typeof $ !== "undefined" && typeof $(".isotope-wrapper").isotope === "function") {
      $(".isotope-wrapper").isotope("reloadItems").isotope();
    }

  } catch (error) {
    console.error(error);
    container.innerHTML = `<p class="error-message">Could not load businesses: ${error.message}</p>`;
  }
}
const heroDiv = document.querySelector('.hero_in.shop_detail');
if (heroDiv) {
  heroDiv.style.backgroundImage = `url(${API_URL_IMAGES}${imagePath})`;
}
window.addEventListener('DOMContentLoaded', fetchBusinessesFromAPI);
