const API_URL = 'https://discover-business-backend.vercel.app/api/businesses';

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const businessForm = document.getElementById('businessForm');
const btnAdd = document.getElementById('btnAdd');
const submitBtn = document.getElementById('submitBtn');
const businessTableBody = document.getElementById('businessTableBody');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const messageBox = document.getElementById('messageBox'); // New div for messages

let editingBusinessId = null;

function showMessage(msg, isError = false) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;
  
    messageBox.textContent = msg;
    messageBox.style.background = isError ? '#f44336' : '#4CAF50'; // red for error, green for success
    messageBox.style.display = 'block';
  
    // Hide after 3 seconds
    setTimeout(() => {
      messageBox.style.display = 'none';
      messageBox.textContent = '';
    }, 3000);
  }
  
  function showSuccess(msg) {
    showMessage(msg, false);
  }
  
  function showError(msg) {
    showMessage(msg, true);
  }
  

  btnAdd.addEventListener('click', () => {
    editingBusinessId = null;
    modalTitle.textContent = 'Add Business';
    businessForm.reset();
    imagePreview.style.display = 'none';
    modal.classList.add('active');
  });
  
  modalCloseBtn.addEventListener('click', () => {
    editingBusinessId = null;
    modal.classList.remove('active');
  });
  
// Close modal
modalCloseBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

// Image preview logic
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.style.display = 'none';
  }
});

// Fetch and display businesses
async function fetchBusinesses() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch businesses');
    const businesses = await res.json();

    businessTableBody.innerHTML = '';

    businesses.forEach(biz => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${biz.name}</td>
        <td>${biz.industry}</td>
        <td>${biz.description}</td>
        <td>${biz.products}</td>
        <td>${biz.location}</td>
        <td>${biz.contactPerson}</td>
        <td>${biz.contactNumber}</td>
        <td>${biz.email}</td>
                <td>${biz.facebook}</td>

<td>${biz.imageUrl ? `<img src="${biz.imageUrl}" alt="Image" style="max-width: 80px;"/>` : '—'}</td>
        <td>
          <button class="btn edit" data-id="${biz.id}">Edit</button>
          <button class="btn delete" data-id="${biz.id}">Delete</button>
        </td>
      `;
      businessTableBody.appendChild(tr);
    });

    document.querySelectorAll('.btn.edit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await openEditModal(id);
      });
    });

    // Add delete button listeners
    document.querySelectorAll('.btn.delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this business?')) {
          await deleteBusiness(id);
        }
      });
    });

    updateStats(businesses);
  } catch (error) {
    showError(error.message);
  }
}

// Update stats cards
function updateStats(businesses) {
  document.getElementById('totalCount').textContent = businesses.length;
  const activeCount = businesses.filter(b => b.status === 'active').length;
  const pendingCount = businesses.filter(b => b.status === 'pending').length;
  document.getElementById('activeCount').textContent = activeCount;
  document.getElementById('pendingCount').textContent = pendingCount;
}

// Open modal and populate for editing
async function openEditModal(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Business not found');
    const biz = await res.json();

    editingBusinessId = id;
    modalTitle.textContent = 'Edit Business';

    businessForm.name.value = biz.name || '';
    businessForm.industry.value = biz.industry || '';
    businessForm.description.value = biz.description || '';
    businessForm.location.value = biz.location || '';
    businessForm.contactPerson.value = biz.contactPerson || '';
    businessForm.contactNumber.value = biz.contactNumber || '';
    businessForm.email.value = biz.email || '';
    businessForm.facebook.value = biz.facebook || '';
    businessForm.products.value = biz.products || '';


    // Save existing product images URLs globally for form submission later
    window.currentProductImages = biz.productImages || [];

    if (biz.imageUrl) {
      imagePreview.src = biz.imageUrl;
      imagePreview.style.display = 'block';
    } else {
      imagePreview.style.display = 'none';
    }

    imageInput.value = '';  // Clear file input

    modal.classList.add('active');
  } catch (error) {
    showError(error.message);
  }
}

// Delete business
async function deleteBusiness(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete business');
    showSuccess('Business deleted successfully');
    await fetchBusinesses();
  } catch (error) {
    showError(error.message);
  }
}

businessForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Prepare data as plain JS object (not FormData)
  const data = {
    name: businessForm.name.value,
    industry: businessForm.industry.value,
    description: businessForm.description.value,
    location: businessForm.location.value,
    contactPerson: businessForm.contactPerson.value,
    contactNumber: businessForm.contactNumber.value,
    email: businessForm.email.value,
    facebook: businessForm.facebook.value,
    products: businessForm.products.value,
    imageUrl: 'https://via.placeholder.com/150', // placeholder image URL
    productImages: ['https://via.placeholder.com/100'], // placeholder product images array
  };

  try {
    let res;
    if (editingBusinessId) {
      // Update existing business with PUT
      res = await fetch(`${API_URL}/${editingBusinessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      // Create new business with POST
      res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save business');
    }

    showSuccess(editingBusinessId ? 'Business updated successfully' : 'Business created successfully');
    modal.classList.remove('active');
    editingBusinessId = null; // reset after saving
    await fetchBusinesses();
  } catch (error) {
    showError(error.message);
  }
});




// Initial fetch
fetchBusinesses();
