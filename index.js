const API_URL = '/api/businesses';
const businessName = document.getElementById('businessName');
const listingCount = document.getElementById('listingCount');
const inquiryCount = document.getElementById('inquiryCount');
const viewCount = document.getElementById('viewCount');
const listingContainer = document.getElementById('listingContainer');
const recentInquiries = document.getElementById('recentInquiries');

// Simulate logged-in business (replace with auth logic)
const loggedInBusinessId = 'your-business-id-here';

async function loadDashboard() {
  try {
    const res = await fetch(API_URL);
    const businesses = await res.json();
    const myBiz = businesses.find(b => b.id === loggedInBusinessId);

    if (!myBiz) return;

    businessName.textContent = myBiz.name;
    listingCount.textContent = 1; // Assuming each business has 1 listing for now
    inquiryCount.textContent = myBiz.inquiries?.length || 0;
    viewCount.textContent = myBiz.views || 0;

    // Listing
    listingContainer.innerHTML = `
      <div class="business-card">
        <h3>${myBiz.name}</h3>
        <p>${myBiz.industry}</p>
        <p>${myBiz.location}</p>
      </div>
    `;

    // Recent inquiries
    if (myBiz.inquiries && myBiz.inquiries.length > 0) {
      recentInquiries.innerHTML = myBiz.inquiries.slice(0, 3).map(inq => `
        <div>
          <p><strong>${inq.senderName}</strong>: ${inq.message}</p>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

loadDashboard();
