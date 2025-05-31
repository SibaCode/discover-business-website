
const API_URL = 'https://discover-business-backend.vercel.app/api/businesses';
const API_URL_IMAGES = 'https://discover-business-backend.vercel.app/';

// Get the ID from the URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const businessId = urlParams.get('id');

// Main fetch function
async function fetchBusinessDetails() {
  if (!businessId) {
    console.error("No business ID provided in the URL");
    showError("Business ID not found in URL.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${businessId}`);
    if (!response.ok) throw new Error('Business not found');

    const biz = await response.json();
    populateBusinessDetails(biz);
  } catch (error) {
    console.error(error);
    showError(`Could not load business: ${error.message}`);
  }
}

// Populate the HTML page with the business data
function populateBusinessDetails(biz) {
  // Text fields
  const productsEl1 = document.getElementById("products-col1");
const productsEl2 = document.getElementById("products-col2");

if (productsEl1 && productsEl2 && biz.products) {
  const productsArray = biz.products.split(',').map(p => p.trim()).filter(p => p !== '');

  const half = Math.ceil(productsArray.length / 2);
  const firstHalf = productsArray.slice(0, half);
  const secondHalf = productsArray.slice(half);

  productsEl1.innerHTML = firstHalf.map(p => `<li>${p}</li>`).join('');
  productsEl2.innerHTML = secondHalf.map(p => `<li>${p}</li>`).join('');
}

  document.getElementById("biz-name").textContent = biz.name || 'No name available';
  document.getElementById("biz-description").textContent = biz.description || 'No description available';
  document.getElementById("biz-location").textContent = biz.location || 'No location provided';
  document.getElementById("biz-contact").textContent = biz.contactNumber || 'No contact number';
  document.getElementById("biz-contactPerson").textContent = biz.contactPerson || 'No contact person';
  document.getElementById("biz-email").textContent = biz.email || 'No email ';
//   document.getElementById("biz-products").textContent = biz.products || 'No products';

  const productImages = [
	  '/uploads/product1.jpg',
	  '/uploads/product2.jpg',
	  '/uploads/product3.jpg',
	  // add your dynamic image URLs here
	];
  
	const galleryList = document.getElementById('magnific-galleryID');
	const facebookLink = document.getElementById("facebook-link");
if (facebookLink && biz.facebook) {
  facebookLink.href = biz.facebook;
}

	biz.productImages.forEach(imagePath => {
    const li = document.createElement('li');
    li.innerHTML = `
	
      <figure>
        <img src="${API_URL_IMAGES + imagePath}" alt="Product Image">
        <figcaption>
          <div class="caption-content">
            <a href="${API_URL_IMAGES + imagePath}" title="Product Image" data-effect="mfp-zoom-in">
              <i class="pe-7s-albums"></i>
            </a>
          </div>
        </figcaption>
      </figure>
    `;
    galleryList.appendChild(li);
  });
  // Image
  const imageEl = document.getElementById("biz-image");
  if (imageEl && biz.imageUrl) {
    imageEl.src = `${API_URL_IMAGES}${biz.imageUrl}`;
    imageEl.alt = biz.name;
  }
  const logoPath = `${API_URL_IMAGES}${biz.imageUrl}`;
  const logoPath2 = `${biz.imageUrl}`;

console.log(logoPath)
console.log(logoPath2)

  // Hero banner background
//   const heroDiv = document.querySelector('.hero_in.shop_detail');
//   if (heroDiv && biz.imageUrl) {
//     heroDiv.style.backgroundImage = `url(${logoPath})`;
//   }
  const heroDiv = document.querySelector('.hero_in.shop_detail');
if (heroDiv) {
  heroDiv.style.backgroundImage = `url(${logoPath})`;
}
  // Optional: render industry or tags
  const industryEl = document.getElementById("biz-industry");
  if (industryEl) {
    industryEl.textContent = biz.industry || 'Not specified';
  }

  // Optional: list brands if available
  const brandsEl = document.getElementById("biz-brands");
  if (brandsEl && Array.isArray(biz.brands)) {
    brandsEl.innerHTML = biz.brands.map(brand => `<li>${brand}</li>`).join('');
  }
}

// Display an error message in the UI
function showError(message) {
  const container = document.getElementById('businessDetailContainer');
  if (container) {
    container.innerHTML = `<p class="error-message">${message}</p>`;
  }
}

// Run everything after DOM is ready
window.addEventListener('DOMContentLoaded', fetchBusinessDetails);

