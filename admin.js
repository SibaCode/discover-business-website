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
const messageBox = document.getElementById('messageBox');

let editingBusinessId = null;
window.currentProductImages = [];

function showMessage(msg, isError = false) {
  messageBox.textContent = msg;
  messageBox.className = isError ? 'error' : 'success';
  messageBox.style.display = 'block';
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
  window.currentProductImages = [];
  modal.classList.add('active');
});

modalCloseBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

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

    document.querySelectorAll('.btn.delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this business?')) {
          await deleteBusiness(id);
        }
      });
    });
  } catch (error) {
    showError(error.message);
  }
}

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

    window.currentProductImages = biz.productImages || [];

    if (biz.imageUrl) {
      imagePreview.src = biz.imageUrl;
      imagePreview.style.display = 'block';
    } else {
      imagePreview.style.display = 'none';
    }

    imageInput.value = '';
    modal.classList.add('active');
  } catch (error) {
    showError(error.message);
  }
}

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

  const formData = new FormData();

  formData.append('name', businessForm.name.value);
  formData.append('industry', businessForm.industry.value);
  formData.append('description', businessForm.description.value);
  formData.append('location', businessForm.location.value);
  formData.append('contactPerson', businessForm.contactPerson.value);
  formData.append('contactNumber', businessForm.contactNumber.value);
  formData.append('email', businessForm.email.value);
  formData.append('facebook', businessForm.facebook.value);
  formData.append('products', businessForm.products.value);

  if (businessForm.image.files[0]) {
    formData.append('image', businessForm.image.files[0]);
  }

  const productImagesInput = document.getElementById('productImages');

  if (productImagesInput && productImagesInput.files.length > 0) {
    Array.from(productImagesInput.files).forEach(file => {
      formData.append('productImages', file);
    });
  } else {
    const existingProductImages = window.currentProductImages || [];
    formData.append('productImages', JSON.stringify(existingProductImages));
  }

  try {
    let res;
    if (editingBusinessId) {
      res = await fetch(`${API_URL}/${editingBusinessId}`, {
        method: 'PUT',
        body: formData
      });
    } else {
      res = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
    }

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || 'An error occurred');
    }

    showSuccess(editingBusinessId ? 'Business updated successfully' : 'Business added successfully');

    modal.classList.remove('active');
    businessForm.reset();
    imagePreview.style.display = 'none';
    editingBusinessId = null;
    window.currentProductImages = [];

    await fetchBusinesses();
  } catch (error) {
    showError(error.message);
  }
});

// Initial load
fetchBusinesses();
