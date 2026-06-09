// ==========================================
// DATA & STATE MANAGEMENT
// ==========================================

// Initialize data from localStorage or use defaults
let items = [];

let currentUser =
JSON.parse(localStorage.getItem('reunite_user')) || null;

let currentFilter = 'all';
let currentType = 'all';
let searchQuery = '';

async function fetchItems() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/items"
        );

        const data = await response.json();

        items = data;

        renderItems();

    }
    catch(error) {

        console.error("Error fetching items:", error);

        showToast(
            "Error",
            "Failed to load items",
            "error"
        );
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toastIcon');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');

if (!toast || !toastIcon || !toastTitle || !toastMessage) {
    console.log(title, message);
    return;
}
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle text-red-500 text-xl';
        toast.classList.remove('border-primary');
        toast.classList.add('border-red-500');
    } else {
        toastIcon.className = 'fas fa-check-circle text-green-500 text-xl';
        toast.classList.remove('border-red-500');
        toast.classList.add('border-primary');
    }

    toast.classList.remove('translate-y-20', 'opacity-0');
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

// ==========================================
// UI FUNCTIONS
// ==========================================

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}

function openModal(type) {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const title = document.getElementById('modalTitle');
    
    if (!modal || !loginForm || !signupForm || !title) return;

    modal.classList.remove('hidden');
    
    if (type === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        title.textContent = 'Login';
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        title.textContent = 'Sign Up';
    }
}

function closeModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function switchAuthMode(mode) {
    openModal(mode);
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    
    if (!authButtons || !userProfile || !userName) return;

    if (currentUser) {
        authButtons.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userName.textContent = currentUser.name;
    } else {
        authButtons.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
}

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    
    if (!preview || !placeholder) return;

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

// ==========================================
// ITEM MANAGEMENT
// ==========================================

function renderItems() 
{
    const grid = document.getElementById('itemsGrid');

    // Fix 6: if itemsGrid is not on this page, stop
    if (!grid) return;

    grid.innerHTML = '';
    
    let filteredItems = items.filter(item => {
        const matchesCategory = currentFilter === 'all' || item.category === currentFilter;
        const matchesType = currentType === 'all' || item.itemType === currentType;
        const matchesSearch = !searchQuery || 
            item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesCategory && matchesType && matchesSearch;
    });

    // Sort by newest first
    filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filteredItems.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <p class="text-gray-500 dark:text-gray-400 text-lg">No items found matching your criteria.</p>
            </div>
        `;
        return;
    }

    filteredItems.forEach(item => {
        const card = createItemCard(item);
        grid.appendChild(card);
    });

    updateStats();
}

function createItemCard(item) {
    const div = document.createElement('div');
    div.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover border border-gray-100 dark:border-gray-700';
    
    const statusColor = item.status === 'Lost' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                       item.status === 'Found' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                       'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    
    div.innerHTML = `
        <div class="relative h-48 overflow-hidden">
            <img src="${item.image || 'https://via.placeholder.com/500x300?text=No+Image'}" alt="${item.itemName}" class="w-full h-full object-cover transition hover:scale-110 duration-500">
            <span class="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${statusColor}">
                ${item.status}
            </span>
            <span class="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-white">
                ${item.itemType}
            </span>
        </div>
        <div class="p-6">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white truncate">${item.itemName}</h3>
                <span class="text-xs text-gray-500 dark:text-gray-400">${formatDate(item.createdAt)}</span>
            </div>
            <p class="text-sm text-primary font-semibold mb-2">${item.category}</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">${item.description}</p>
            
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <i class="fas fa-map-marker-alt mr-2 text-red-500"></i>
                <span class="truncate">${item.location}</span>
            </div>
            
            <div class="flex gap-2">
    <button onclick="viewItemDetails('${item._id}')"
    class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg">
        View Details
    </button>

    <button onclick="contactOwner('${item._id}'); closeItemModal();"
    class="flex-1 bg-primary text-white py-2 rounded-lg">
        Contact
    </button>

    <button onclick="claimItem('${item._id}')"
    class="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
        Claim
    </button>
</div>
        </div>
    `;
    
    return div;
}

function filterCategory(category) {
    currentFilter = category;
    
    // Update button styles
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            btn.classList.add('bg-primary', 'text-white');
        } else {
            btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            btn.classList.remove('bg-primary', 'text-white');
        }
    });
    
    renderItems();
}

function viewItemDetails(id) {
    const item = items.find(i => i._id === id);
    if (!item) return;
    
    const modal = document.getElementById('itemModal');
    const content = document.getElementById('itemModalContent');
    if (!modal || !content) return;
    
    const statusColor = item.status === 'Lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    
    content.innerHTML = `
        <div class="relative">
            <img src="${item.image || 'https://via.placeholder.com/800x400?text=No+Image'}" class="w-full h-64 object-cover">
            <button onclick="closeItemModal()" class="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${item.itemName}</h2>
                    <p class="text-primary font-semibold">${item.category}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-sm font-bold ${statusColor}">${item.status}</span>
            </div>
            
            <div class="space-y-4 mb-6">
                <div>
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</h4>
                    <p class="text-gray-600 dark:text-gray-400">${item.description}</p>
                </div>
                
                <div class="flex items-center text-gray-700 dark:text-gray-300">
                    <i class="fas fa-map-marker-alt w-6 text-red-500"></i>
                    <span>${item.location}</span>
                </div>
                
                <div class="flex items-center text-gray-700 dark:text-gray-300">
                    <i class="fas fa-calendar w-6 text-blue-500"></i>
                    <span>Posted ${formatDate(item.createdAt)}</span>
                </div>
                
                <div class="flex items-center text-gray-700 dark:text-gray-300">
                    <i class="fas fa-phone w-6 text-green-500"></i>
                    <span>${item.contactNumber}</span>
                </div>
            </div>
            
            <button onclick="contactOwner('${item._id}'); closeItemModal();" class="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition">
                Contact ${item.itemType === 'Lost' ? 'Owner' : 'Finder'}
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeItemModal() {
    const modal = document.getElementById('itemModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function contactOwner(id) {

    if (!currentUser) {
        showToast(
            'Authentication Required',
            'Please login to contact the owner.',
            'error'
        );
        openModal('login');
        return;
    }

    const item = items.find(i => i._id === id);

    if (!item) {
        showToast(
            'Error',
            'Item not found',
            'error'
        );
        return;
    }

    showToast(
        'Contact Info',
        `Call: ${item.contactNumber}`,
        'success'
    );
}

function updateStats() {
    const total = items.length;
    const returned = items.filter(i => i.status === 'Returned').length;
    const rate = total > 0 ? Math.round((returned / total) * 100) : 0;
    
    // Fix 7: only update if elements exist
    const statTotal = document.getElementById('statTotal');
    const statReturned = document.getElementById('statReturned');
    const statRate = document.getElementById('statRate');

    if (statTotal) statTotal.textContent = total.toLocaleString();
    if (statReturned) statReturned.textContent = returned.toLocaleString();
    if (statRate) statRate.textContent = rate + '%';
}

function loadMoreItems() {
    showToast('Info', 'In production, this would load more items from the server.', 'success');
}

// ==========================================
// FORM HANDLERS
// ==========================================

// Fix 1: reportForm guarded
const reportForm = document.getElementById('reportForm');

if (reportForm) {
reportForm.addEventListener('submit', async function(e) {

    e.preventDefault();

    if (!currentUser) {
        showToast(
            'Authentication Required',
            'Please login to report an item.',
            'error'
        );
        openModal('login');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
const loader = document.getElementById('submitLoader');

if (!submitBtn || !loader) {
    showToast('Error', 'Submit button missing', 'error');
    return;
}

const btnText = submitBtn.querySelector('span');
    loader.classList.remove('hidden');
    btnText.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {

        const itemData = {

            itemName:
            document.getElementById('itemName').value,

            itemType:
            document.getElementById('itemType').value,

            category:
            document.getElementById('itemCategory').value,

            description:
            document.getElementById('itemDescription').value,

            location:
            document.getElementById('itemLocation').value,

            contactNumber:
            document.getElementById('itemContact').value,

            image:
            document.getElementById('imagePreview').src || "",

            status:
            document.getElementById('itemType').value,

            userId:
            currentUser.id

        };

        const response = await fetch(
            "http://localhost:5000/api/items/add",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(itemData)
            }
        );

        const data = await response.json();

        console.log(data);

        if(response.ok){

            showToast(
                'Success',
                'Item reported successfully!',
                'success'
            );

            document.getElementById('reportForm').reset();

            document.getElementById('imagePreview')
            .classList.add('hidden');

            document.getElementById('uploadPlaceholder')
            .classList.remove('hidden');

            setTimeout(() => {
                window.location.href = "myreports.html";
            }, 1000);

        }
        else{

            showToast(
                'Error',
                data.message,
                'error'
            );

        }

    }
    catch(error){

        console.log(error);

        showToast(
            'Error',
            'Server connection failed',
            'error'
        );

    }

    loader.classList.add('hidden');
    btnText.textContent = 'Submit Report';
    submitBtn.disabled = false;

});
}

// Fix 2: loginForm guarded
const loginForm = document.getElementById('loginForm');

if (loginForm) {
loginForm.addEventListener('submit', async function(e) {

    e.preventDefault();

    const email =
    document.getElementById('loginEmail').value;

    const password =
    document.getElementById('loginPassword').value;

    try {

        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if(response.ok){

            currentUser = data.user;

            localStorage.setItem(
                "reunite_user",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "token",
                data.token
            );

            closeModal();

            updateAuthUI();

            showToast(
                "Welcome Back!",
                `Hello, ${data.user.name}`
            );

        }
        else{

            showToast(
                "Error",
                data.message,
                "error"
            );

        }

    }
    catch(error){

        console.log(error);

        showToast(
            "Error",
            "Server connection failed",
            "error"
        );

    }

});
}

// Fix 3: signupForm guarded
const signupForm = document.getElementById('signupForm');

if (signupForm) {
signupForm.addEventListener('submit',async function(e)
 {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword =
document.getElementById('confirmPassword').value;

if(password !== confirmPassword){
    showToast(
        'Error',
        'Passwords do not match',
        'error'
    );
    return;
}
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}/.test(password)) {
    showToast(
        'Weak Password',
        'Password must contain uppercase, lowercase and a number',
        'error'
    );
    return;
}

try {

    const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        }
    );

    const data = await response.json();

    if(response.ok){

        showToast(
            "Success",
            "Account created successfully. Please login."
        );

        document.getElementById("signupForm").reset();

        switchAuthMode("login");

    } else {

        showToast(
            "Error",
            data.message,
            "error"
        );

    }

}
catch(error){

    showToast(
        "Error",
        "Server connection failed",
        "error"
    );

}     
});
}

function logout() {
    currentUser = null;
    localStorage.removeItem('reunite_user');
    updateAuthUI();
    showToast('Logged Out', 'See you soon!');
}

function handleContactSubmit(e) {
    e.preventDefault();
    showToast('Message Sent', 'We will get back to you soon!');
    e.target.reset();
}

// Search functionality – Fix 4: guard searchInput
const searchInput = document.getElementById('searchInput');

if (searchInput) {
searchInput.addEventListener('input', function(e) {
    searchQuery = e.target.value;
    renderItems();
});
}

// Fix 5: guard typeFilter
const typeFilter = document.getElementById('typeFilter');

if (typeFilter) {
typeFilter.addEventListener('change', function(e) {
    currentType = e.target.value;
    renderItems();
});
}

// ==========================================
// INITIALIZATION
// ==========================================

// Check for dark mode preference
if (localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {

    fetchItems(); // Load items from MongoDB

    updateAuthUI();

    // Navbar scroll effect
    window.addEventListener('scroll', function() {

        const navbar = document.getElementById('navbar');

        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('shadow-md');
            } else {
                navbar.classList.remove('shadow-md');
            }
        }

    });

});

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector("i");

    if (!input || !icon) return;

    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

/*
function showMyReports() 
{
    ...
}
*/

function toggleProfileMenu() {
    const menu = document.getElementById("profileMenu");
    if (menu) {
        menu.classList.toggle("hidden");
    }
}

async function claimItem(itemId) {

    if (!currentUser) {
        alert("Please login first");
        return;
    }

    const item = items.find(
        i => i._id === itemId
    );

    if (!item) return;

    if (item.userId === currentUser.id) {
        alert("Cannot claim your own item");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/claims",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    itemId: item._id,
                    ownerId: item.userId,
                    claimantId: currentUser.id
                })
            }
        );

        const data = await response.json();

        alert(data.message);

    } catch (error) {

        console.log(error);

    }
}

// ==========================================
// BACKEND CODE STRUCTURE (DOCUMENTATION)
// (unchanged, omitting here for brevity)
// ==========================================

// CLAIMS

async function loadClaims() {

    if (!currentUser) return;

    try {

        const response = await fetch(
            "http://localhost:5000/api/claims"
        );

        const claims = await response.json();
        console.log("Current User:", currentUser);
        console.log("Claims:", claims);

        // Fix 8: handle ownerId as object or string
        const myClaims = claims.filter(claim => {
            const ownerId =
                typeof claim.ownerId === "object"
                    ? claim.ownerId._id
                    : claim.ownerId;
            return ownerId === currentUser.id;
        });

        const container =
            document.getElementById("claimsContainer");

        if (!container) return;

        container.innerHTML = "";

        if(myClaims.length === 0){
            container.innerHTML =
                "<h3>No claim requests</h3>";
            return;
        }

        myClaims.forEach(claim => {

            container.innerHTML += `
                <div class="card">
                    <h3>${claim.itemId.itemName}</h3>

                    <p>
                        Claimant:
                        ${claim.claimantId.name}
                    </p>

                    <p>
                        Status:
                        ${claim.status}
                    </p>

                    <button onclick="approveClaim('${claim._id}')">
                        Approve
                    </button>

                    <button onclick="rejectClaim('${claim._id}')">
                        Reject
                    </button>
                </div>
            `;
        });

    }
    catch(error){
        console.log(error);
    }
}

async function approveClaim(id){

    const response = await fetch(
        `http://localhost:5000/api/claims/approve/${id}`,
        {
            method: "PUT"
        }
    );

    const data = await response.json();

    alert(data.message);

    loadClaims();
}

async function rejectClaim(id){

    const response = await fetch(
        `http://localhost:5000/api/claims/reject/${id}`,
        {
            method: "PUT"
        }
    );

    const data = await response.json();

    alert(data.message);

    loadClaims();
}

document.addEventListener("DOMContentLoaded", () => {

    currentUser = JSON.parse(
        localStorage.getItem("reunite_user")
    );

    // Only run on claimrequests.html
    if (document.getElementById("claimsContainer")) {
        loadClaims();
    }
});