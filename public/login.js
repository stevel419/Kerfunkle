document.getElementById("emailForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const response = await fetch("/api/send-login-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });
    const data = await response.json();

    if (data.success) {
        document.getElementById("send-error").textContent = "";
        document.getElementById("success-message").textContent = "Sent to " + email;
        
        document.getElementById("emailForm").style.display = "none";
        document.getElementById("codeForm").style.display = "block";
    }
    else {
        document.getElementById("send-error").textContent = "Unable to send login code to " + email;
    }
});

document.getElementById("codeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const code = document.getElementById("code").value;
    const response = await fetch("/api/verify-login-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, code })
    });
    const data = await response.json();

    if (data.success) {
        //Not secure
        sessionStorage.setItem("authToken", data.token);

        let cart = sessionStorage.getItem("cart");
        let cartItems = cart ? JSON.parse(cart) : [];
        const response = await fetch("/api/update-cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + data.token
            },
            body: JSON.stringify({ cartItems })
        });
        const cartData = await response.json();
        sessionStorage.setItem("cart", JSON.stringify(cartData.cart));

        window.location.href = "home.html";
    }
    else {
        document.getElementById("error-message").textContent = "Enter the correct 6-digit code";
    }
});

document.getElementById("change-email").addEventListener("click", () => {
    document.getElementById("codeForm").style.display = "none";
    document.getElementById("emailForm").style.display = "block";
});