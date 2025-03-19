function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}
document.addEventListener("DOMContentLoaded", function () {
  const cardButton = document.querySelector(".card-button");
  const token = getCookie("token");
  // Helper function to get cookie by name

  if (token) {
    // Token exists, fetch user data
    fetch("/getUser", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Authentication failed");
        }
        return response.json();
      })
      .then((userData) => {
        console.log(userData);
        cardButton.addEventListener("click", function () {
          if (
            localStorage.getItem("level") != null &&
            localStorage.getItem("game") != null
          ) {
            fetch("/playing", {
              method: "POST",
              headers: {
                "Content-Type": "application/json", // Gửi dữ liệu dưới dạng JSON
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                level: localStorage.getItem("level"),
                game: localStorage.getItem("game"),
              }), // Chuyển đổi object thành JSON
            });
            window.open(`http://localhost:4000/${userData._id}`, "_blank");
          }
        });
      })
      .catch((error) => {
        // Error fetching user data, show register button
        console.error("Error fetching user data:", error);
        showRegisterButton(rightSection);
      });
  } else {
    // No token, show register button
    showRegisterButton(rightSection);
  }
});
