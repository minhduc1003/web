function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}
document.addEventListener("DOMContentLoaded", function () {
  const cardButton = document.querySelectorAll(".card-button");
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
        const ports = [4000, 9000, 1000];
        const level = localStorage.getItem("level");

        const levelData = userData.gameData.filter(
          (item) => item.level == level
        );
        cardButton.forEach((button, index) => {
          if (levelData[index]) {
            if (!levelData[index].isUnlocked) {
              button.disabled = true;
              button.classList.add("locked");
              const lockIcon = document.createElement("span");
              lockIcon.className = "lock-icon";
              lockIcon.innerHTML = "🔒";
              button.appendChild(lockIcon);
            } else {
              button.addEventListener("click", function () {
                console.log(1);
                if (
                  localStorage.getItem("level") != null &&
                  localStorage.getItem("game") != null
                ) {
                  fetch("/playing", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      level: localStorage.getItem("level"),
                      game: localStorage.getItem("game"),
                    }),
                  });
                  window.open(
                    `http://localhost:${ports[index]}/${userData._id}`,
                    "_blank"
                  );
                }
              });
              button.disabled = false;
              button.classList.remove("locked");
            }
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  } else {
    window.open("/log_in.html", "_self");
  }
});
