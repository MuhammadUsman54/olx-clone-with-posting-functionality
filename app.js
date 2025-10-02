class User {
  constructor(firstName, lastName, email, password) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = firstName + " " + lastName;
    this.email = email;
    this.password = password;
  }
}

class UserManager {
  constructor() {
    this.users = JSON.parse(localStorage.getItem("users")) || [];
    this.loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
  }

  saveUsers() {
    localStorage.setItem("users", JSON.stringify(this.users));
  }

  signup(firstName, lastName, email, password) {
    if (!firstName || !lastName || !email || !password) {
      Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please fill all fields!" });
      return;
    }
    if (this.users.some(u => u.email === email)) {
      Swal.fire({ icon: "error", title: "Duplicate Email", text: "User already exists!" });
      return;
    }
    let newUser = new User(firstName, lastName, email, password);
    this.users.push(newUser);
    this.saveUsers();
    Swal.fire({ icon: "success", title: "Signup Successful!", text: "Now sign in." })
      .then(() => {
        switchModal("signupModal", "signinModal");
        clearForm("signupForm");
      });
  }

  signin(email, password) {
    let validUser = this.users.find(u => u.email === email && u.password === password);
    if (validUser) {
      this.loggedInUser = validUser;
      localStorage.setItem("loggedInUser", JSON.stringify(validUser));
      Swal.fire({ icon: "success", title: "Welcome Back!", text: "Hello " + validUser.fullName })
        .then(() => {
          updateUI(validUser.fullName);
          clearForm("signinForm");
          closeModal("signinModal");
          displayAds(); // Refresh ads after login
        });
    } else {
      Swal.fire({ icon: "error", title: "Invalid Credentials", text: "Email or password incorrect!" });
    }
  }

  logout() {
    this.loggedInUser = null;
    localStorage.removeItem("loggedInUser");
    Swal.fire({ icon: "info", title: "Logged Out", text: "You have been logged out." })
      .then(() => {
        updateUI(null);
        clearForm("signinForm");
        displayAds(); // Refresh ads after logout

        let signinBtn = document.getElementById("openSigninBtn");
        if (signinBtn) signinBtn.onclick = () => openModal("signinModal");

        setTimeout(() => {
          openModal("signinModal");
        }, 100);
      });
  }
}

const userManager = new UserManager();

// Ad Management System
class Ad {
  constructor(category, title, description, price, imageURL) {
    this.category = category;
    this.title = title;
    this.description = description;
    this.price = price;
    this.imageURL = imageURL;
    this.id = Date.now();
    this.userEmail = userManager.loggedInUser ? userManager.loggedInUser.email : null;
  }
}

class AdManager {
  constructor() {
    this.ads = JSON.parse(localStorage.getItem("ads")) || [];
  }

  saveAds() {
    localStorage.setItem("ads", JSON.stringify(this.ads));
  }

  addAd(category, title, description, price, imageURL) {
    if (!userManager.loggedInUser) {
      Swal.fire({ icon: "warning", title: "Please Login", text: "You need to login to post an ad!" });
      openModal("signinModal");
      return false;
    }

    if (!category || !title || !description || !price) {
      Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please fill all required fields!" });
      return false;
    }

    const newAd = new Ad(category, title, description, price, imageURL);
    this.ads.push(newAd);
    this.saveAds();
    
    Swal.fire({ icon: "success", title: "Ad Published!", text: "Your ad has been published successfully!" });
    return true;
  }

  getAllAds() {
    return this.ads.sort((a, b) => b.id - a.id);
  }

  getAdsByUser(email) {
    return this.ads.filter(ad => ad.userEmail === email).sort((a, b) => b.id - a.id);
  }
}

const adManager = new AdManager();

// Display ads on main page
function displayAds() {
  const adsContainer = document.getElementById('adsContainer');
  if (!adsContainer) {
    console.log('Ads container not found');
    return;
  }

  const allAds = adManager.getAllAds();
  console.log('Found ads:', allAds); // Debug log
  
  if (allAds.length === 0) {
    adsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
        <h3>No Ads Published Yet</h3>
        <p>Be the first to publish an ad!</p>
      </div>
    `;
    return;
  }

  adsContainer.innerHTML = allAds.map(ad => `
    <div class="card">
      <img src="${ad.imageURL || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${ad.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      <div class="card-body">
        <span class="category">${ad.category}</span>
        <h3>${ad.title}</h3>
        <p class="description">${ad.description}</p>
        <p class="price">$${parseFloat(ad.price).toFixed(2)}</p>
      </div>
    </div>
  `).join('');
}

// --- Modal Functions ---
function openModal(id) {
  let modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    setTimeout(() => {
      if (id === "signupModal") {
        let firstNameInput = document.getElementById("signupFirstName");
        if (firstNameInput) firstNameInput.focus();
      }
      if (id === "signinModal") {
        let emailInput = document.getElementById("signinEmail");
        if (emailInput) emailInput.focus();
      }
    }, 100);
  }
}

function closeModal(id) {
  let modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
}

function switchModal(current, target) {
  closeModal(current);
  openModal(target);
}

// --- Signup / Signin / Logout ---
function signup() {
  let f = document.getElementById("signupFirstName").value;
  let l = document.getElementById("signupLastName").value;
  let e = document.getElementById("signupEmail").value;
  let p = document.getElementById("signupPassword").value;
  userManager.signup(f, l, e, p);
}

function signin() {
  let e = document.getElementById("signinEmail").value;
  let p = document.getElementById("signinPassword").value;
  userManager.signin(e, p);
}

function clearForm(formId) {
  let form = document.getElementById(formId);
  if (form) form.reset();
}

function logout() {
  userManager.logout();
}

// --- UI Update ---
const loginBtn = document.getElementById("openSigninBtn");
const profile = document.getElementById("profile");
const userName = document.getElementById("userName");
const sellBtn = document.getElementById("sellBtn");

function updateUI(name) {
  if (name) {
    if (loginBtn) loginBtn.style.display = "none";
    if (profile) profile.style.display = "flex";
    if (userName) userName.textContent = name;
    if (sellBtn) sellBtn.style.display = "flex";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (profile) profile.style.display = "none";
    if (userName) userName.textContent = "";
    if (sellBtn) sellBtn.style.display = "flex"; // Keep sell button visible but will check auth on click
  }
}

// --- On Page Load ---
window.onload = function () {
  if (userManager.loggedInUser) {
    updateUI(userManager.loggedInUser.fullName);
  } else {
    updateUI(null);
  }

  if (loginBtn) loginBtn.onclick = () => openModal("signinModal");
  
  // Initialize ads display
  displayAds();
};

// Make displayAds function globally available
window.displayAds = displayAds;