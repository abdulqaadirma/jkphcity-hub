const API_URL = 'http://localhost:3000';
let currentUser = null;
let allVenues = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadVenues();
});

// Authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/api/auth/check`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
                currentUser = { username: data.username };
                showUserInfo();
            } else {
                currentUser = null;
            }
        }
        // Always load venues after auth check
        loadVenues();
    } catch (error) {
        console.error('Auth check error:', error);
        currentUser = null;
    }
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

        if (response.ok) {
            const data = await response.json();
            currentUser = { username: data.username };
            showUserInfo();
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            // Reload venues to show edit/delete buttons
            loadVenues();
        } else {
            alert('Login failed: Invalid credentials');
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
    // Reload venues to hide edit/delete buttons
    loadVenues();
}

function showUserInfo() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('admin-panel').style.display = 'block';
}

// Venue Management
async function loadVenues() {
    try {
        const response = await fetch(`${API_URL}/api/venues`, {
            credentials: 'include'
        });
        if (response.ok) {
            allVenues = await response.json();
            displayVenues(allVenues);
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
        
        // Format website URL
        let websiteHtml = '';
        if (venue.url) {
            const url = venue.url.startsWith('http') ? venue.url : `https://${venue.url}`;
            websiteHtml = `<p><strong>Website:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${venue.url}</a></p>`;
        }

        // District
        let districtHtml = '';
        if (venue.district) {
            districtHtml = `<p><strong>District:</strong> ${venue.district}</p>`;
        }

        // Category (extended data)
        let categoryHtml = '';
        if (venue.category) {
            categoryHtml = `<p><strong>Category:</strong> ${venue.category}</p>`;
        }

        // Phone (extended data)
        let phoneHtml = '';
        if (venue.phone) {
            phoneHtml = `<p><strong>Phone:</strong> ${venue.phone}</p>`;
        }

        // Description (extended data)
        let descriptionHtml = '';
        if (venue.description) {
            descriptionHtml = `<p>${venue.description}</p>`;
        }

        // CORRECT: Only show Edit/Delete buttons when user IS logged in
        let actions = '';
        if (currentUser) {
            actions = `
                <div class="venue-card-buttons">
                    <button class="edit" onclick="editVenue(${venue.id})">Edit</button>
                    <button class="delete" onclick="deleteVenue(${venue.id})">Delete</button>
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

// Admin functions
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

    // Validate required fields
    if (!venueData.name) {
        alert('Venue name is required');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/venues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(venueData)
        });

        if (response.ok) {
            e.target.reset();
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

async function deleteVenue(id) {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    try {
        const response = await fetch(`${API_URL}/api/venues/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
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

async function editVenue(id) {
    const venue = allVenues.find(v => v.id === id);
    if (!venue) return;

    // For Grade 5, you should have a proper edit form
    // This is a simple prompt-based edit
    const newName = prompt('Enter new name:', venue.name);
    const newDistrict = promt(`Enter new district:`, venue.district)
    const newCategory = promt(`Enter new category:`, venue.category)
    const newWebsite = promt(`Enter new website:`, venue.url)
    const newPhone = prompt(`Enter new phone:`, venue.phone)
    const newDescription = prompt(`Enter new description:`, venue.description)

    /*
    id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            url VARCHAR(500),
            district VARCHAR(100),
            category VARCHAR(100),
            phone VARCHAR(50),
            description TEXT
    */


    if (newName && newName !== venue.name) {
        venue.name = newName;
        
        try {
            const response = await fetch(`${API_URL}/api/venues/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(venue)
            });

            if (response.ok) {
                loadVenues();
            } else {
                const data = await response.json();
                alert('Failed to update venue: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating venue:', error);
            alert('Error updating venue');
        }
    }
}

// Filtering and Search
function filterByDistrict(district) {
    if (district === 'all') {
        displayVenues(allVenues);
    } else {
        const filtered = allVenues.filter(v => v.district === district);
        displayVenues(filtered);
    }
}

function searchVenues() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const filtered = allVenues.filter(venue => 
        venue.name.toLowerCase().includes(searchTerm) ||
        (venue.district && venue.district.toLowerCase().includes(searchTerm)) ||
        (venue.category && venue.category.toLowerCase().includes(searchTerm))
    );
    displayVenues(filtered);
}