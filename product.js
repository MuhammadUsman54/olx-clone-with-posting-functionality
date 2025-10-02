// Post Ad functionality
function postAd() {
    // Check if user is logged in
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        Swal.fire({ 
            icon: "warning", 
            title: "Please Login", 
            text: "You need to login to post an ad!" 
        }).then(() => {
            window.location.href = "index.html";
        });
        return;
    }

    // Get form values
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const imageFile = document.getElementById('imageFile').files[0];

    // Validation
    if (!category || !title || !description || !price) {
        Swal.fire({ 
            icon: "warning", 
            title: "Missing Fields", 
            text: "Please fill all required fields!" 
        });
        return;
    }

    // Handle image
    let imageURL = '';
    if (imageFile) {
        // For demo purposes, create object URL
        imageURL = URL.createObjectURL(imageFile);
    } else {
        imageURL = 'https://via.placeholder.com/300x200?text=No+Image';
    }

    // Get existing ads from localStorage
    let ads = JSON.parse(localStorage.getItem("ads")) || [];
    
    // Create new ad
    const newAd = {
        category: category,
        title: title,
        description: description,
        price: parseFloat(price).toFixed(2),
        imageURL: imageURL,
        id: Date.now(),
        userEmail: loggedInUser.email
    };
    
    // Add to ads array
    ads.push(newAd);
    
    // Save to localStorage
    localStorage.setItem("ads", JSON.stringify(ads));
    
    // Show success message
    Swal.fire({ 
        icon: "success", 
        title: "Ad Published!", 
        text: "Your ad has been published successfully!" 
    }).then(() => {
        // Redirect to main page
        window.location.href = "index.html";
    });
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        Swal.fire({ 
            icon: "warning", 
            title: "Authentication Required", 
            text: "Please login to post an ad!" 
        }).then(() => {
            window.location.href = "index.html";
        });
    }
});