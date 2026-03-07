const API_URL = 'http://localhost:3000';
let currentUser = null;
let allVenues = [];
let currentDistrictFilter = 'all';
let currentSearchTerm = '';
let currentSort = 'none';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadVenues();
});

// ========== AUTHENTICATION ==========
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/api/auth/check`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
                currentUser = { username: data.username, role: data.role };
                showUserInfo();
            } else {
                currentUser = null;
                hideUserInfo();
            }
        }
        loadVenues();
    } catch (error) {
        console.error('Auth check error:', error);
        currentUser = null;
        hideUserInfo();
    }
}

function hideUserInfo() {
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'none';
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = { username: data.username };
            showUserInfo();
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            loadVenues();
        } else {
            alert('Login failed: ' + (data.message || 'Invalid credentials'));
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
}

async function logout() {
    try {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    currentUser = null;
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'none';
    closeCreateForm();
    loadVenues();
}

function showUserInfo() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.username}!`;

    if (currentUser.role === 'admin') {
        document.getElementById('admin-panel').style.display = 'block';
    } else {
        document.getElementById('admin-panel').style.display = 'none';
    }
}

// ========== ADMIN PANEL UI CONTROL ==========
function toggleCreateForm() {
    const container = document.getElementById('create-form-container');
    const button = document.getElementById('show-create-btn');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        button.textContent = '- Hide Create Form';
    } else {
        container.style.display = 'none';
        button.textContent = '+ Create New Venue';
        // Reset form when hiding
        document.getElementById('venue-form').reset();
    }
}

function closeCreateForm() {
    document.getElementById('create-form-container').style.display = 'none';
    document.getElementById('show-create-btn').textContent = '+ Create New Venue';
    document.getElementById('venue-form').reset();
}

// ========== EDIT MODAL CONTROL ==========
function openEditModal(venue) {
    document.getElementById('edit-modal').style.display = 'flex';
    document.getElementById('edit-venue-id').value = venue.id;
    document.getElementById('edit-venue-name').value = venue.name || '';
    document.getElementById('edit-venue-url').value = venue.url || '';
    document.getElementById('edit-venue-district').value = venue.district || '';
    document.getElementById('edit-venue-category').value = venue.category || '';
    document.getElementById('edit-venue-phone').value = venue.phone || '';
    document.getElementById('edit-venue-description').value = venue.description || '';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-form').reset();
}

// ========== VENUE MANAGEMENT ==========
async function loadVenues() {
    try {
        const response = await fetch(`${API_URL}/api/venues`, {
            credentials: 'include'
        });
        if (response.ok) {
            allVenues = await response.json();
            refreshVenues();
        }
    } catch (error) {
        console.error('Error loading venues:', error);
    }
}

function displayVenues(venues) {
    const container = document.getElementById('venues-container');
    container.innerHTML = '';

    venues.forEach(venue => {
        const card = document.createElement('div');
        card.className = 'venue-card';
        
        // Build HTML sections
        let websiteHtml = '';
        if (venue.url) {
            const url = venue.url.startsWith('http') ? venue.url : `https://${venue.url}`;
            websiteHtml = `<p><strong>Website:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${venue.url}</a></p>`;
        }

        let districtHtml = venue.district ? `<p><strong>District:</strong> ${venue.district}</p>` : '';
        let categoryHtml = venue.category ? `<p><strong>Category:</strong> ${venue.category}</p>` : '';
        let phoneHtml = venue.phone ? `<p><strong>Phone:</strong> ${venue.phone}</p>` : '';
        let descriptionHtml = venue.description ? `<p>${venue.description}</p>` : '';

        // Actions for logged-in users
        let actions = '';
        if (currentUser && currentUser.role === "admin") {
            actions = `
                <div class="venue-actions">
                    <button class="edit-btn" onclick="editVenue(${venue.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteVenue(${venue.id})">Delete</button>
                </div>
            `;
        }

        card.innerHTML = `
            <h3>${venue.name}</h3>
            ${districtHtml}
            ${categoryHtml}
            ${websiteHtml}
            ${phoneHtml}
            ${descriptionHtml}
            ${actions}
        `;
        
        container.appendChild(card);
    });

    if (venues.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">No venues found</p>';
    }
}

// ========== CREATE VENUE ==========
document.getElementById('venue-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const venueData = {
        name: document.getElementById('venue-name').value,
        url: document.getElementById('venue-url').value,
        district: document.getElementById('venue-district').value,
        category: document.getElementById('venue-category').value,
        phone: document.getElementById('venue-phone').value,
        description: document.getElementById('venue-description').value
    };

    if (!venueData.name) {
        alert('Venue name is required');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/venues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(venueData)
        });

        if (response.ok) {
            e.target.reset();
            closeCreateForm();
            loadVenues();
        } else {
            const data = await response.json();
            alert('Failed to add venue: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding venue:', error);
        alert('Error adding venue');
    }
});

// ========== EDIT VENUE ==========
async function editVenue(id) {
    const venue = allVenues.find(v => v.id === id);
    if (venue) {
        openEditModal(venue);
    }
}

document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-venue-id').value;
    const venueData = {
        name: document.getElementById('edit-venue-name').value,
        url: document.getElementById('edit-venue-url').value,
        district: document.getElementById('edit-venue-district').value,
        category: document.getElementById('edit-venue-category').value,
        phone: document.getElementById('edit-venue-phone').value,
        description: document.getElementById('edit-venue-description').value
    };

    if (!venueData.name) {
        alert('Venue name is required');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/venues/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(venueData)
        });

        if (response.ok) {
            closeEditModal();
            loadVenues();
        } else {
            const data = await response.json();
            alert('Failed to update venue: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating venue:', error);
        alert('Error updating venue');
    }
});

// ========== DELETE VENUE ==========
async function deleteVenue(id) {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    try {
        const response = await fetch(`${API_URL}/api/venues/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            loadVenues();
        } else {
            const data = await response.json();
            alert('Failed to delete venue: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting venue:', error);
        alert('Error deleting venue');
    }
}

// ========== FILTERING AND SEARCH ==========
function getVisibleVenues() {
    let venues = [...allVenues];

    if (currentDistrictFilter !== 'all') {
        venues = venues.filter(v => v.district === currentDistrictFilter);
    }

    if (currentSearchTerm) {
        const term = currentSearchTerm.toLowerCase();
        venues = venues.filter(venue =>
            venue.name.toLowerCase().includes(term) ||
            (venue.district && venue.district.toLowerCase().includes(term)) ||
            (venue.category && venue.category.toLowerCase().includes(term))
        );
    }

    if (currentSort === 'az') {
        venues.sort((a, b) => a.name.localeCompare(b.name, 'sv'));
    } else if (currentSort === 'za') {
        venues.sort((a, b) => b.name.localeCompare(a.name, 'sv'));
    } else if (currentSort === 'district') {
        venues.sort((a, b) => {
            const districtA = a.district || '';
            const districtB = b.district || '';
            return districtA.localeCompare(districtB, 'sv') || a.name.localeCompare(b.name, 'sv');
        });
    }

    return venues;
}

function refreshVenues() {
    displayVenues(getVisibleVenues());
}

function filterByDistrict(district) {
    currentDistrictFilter = district;
    refreshVenues();
}

function searchVenues() {
    currentSearchTerm = document.getElementById('search').value.trim();
    refreshVenues();
}

function sortVenues(sortType) {
    currentSort = sortType;
    refreshVenues();
}