document.addEventListener("DOMContentLoaded", function() {
    const accountDropdown = document.getElementById("accountDropdown");
    const accountBtn = document.getElementById("account");
    // Toggle dropdown when account is clicked
    accountBtn.addEventListener("click", function(event) {
        if (sessionStorage.getItem("authToken")) {
            accountDropdown.classList.toggle("show");
            event.stopPropagation();
        } else {
            window.location.href = "login.html";
        }
    });
    // Close dropdown when clicking elsewhere
    window.addEventListener("click", function(event) {
        if (!event.target.matches('#account')) {
            if (accountDropdown.classList.contains('show')) {
                accountDropdown.classList.remove('show');
            }
        }
    });
    // Handle logout button
    document.getElementById("logoutBtn").addEventListener("click", function(event) {
        event.stopPropagation();
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("cart");
        accountDropdown.classList.remove("show");
        setTimeout(function() {
            window.location.reload();
        }, 50);
    });
});