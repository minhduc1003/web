document.getElementById("next").onclick = function () {
  let lists = document.querySelectorAll(".item");
  document.getElementById("slide").appendChild(lists[0]);
};
document.getElementById("prev").onclick = function () {
  let lists = document.querySelectorAll(".item");
  document.getElementById("slide").prepend(lists[lists.length - 1]);
};
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}
document.addEventListener("DOMContentLoaded", function () {
  const token = getCookie("token");
  const button = document.querySelectorAll(".btn");
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
        console.log("User authenticated:", userData);

        if (userData.gameData) {
          button.forEach((btn) => {
            const level = parseInt(btn.getAttribute("data-level") || "0", 10);

            const levelData = userData.gameData.find(
              (l) => l.level === level && l.game === 1
            );
            console.log(levelData);
            console.log(btn);
            if (levelData) {
              if (!levelData.isUnlocked) {
                btn.disabled = true;
                btn.classList.add("locked");
                const lockIcon = document.createElement("span");
                lockIcon.className = "lock-icon";
                lockIcon.innerHTML = "🔒";
                btn.appendChild(lockIcon);
              } else {
                btn.disabled = false;
                btn.href = `chap${level}.html`;
                if (btn.tagName.toLowerCase() === "a") {
                  btn.href = `chap${level}.html`;
                } else {
                  btn.addEventListener("click", function () {
                    window.location.href = `chap${level}.html`;
                  });
                }
                btn.classList.remove("locked");
              }
            }
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  } else {
    window.open("/log_in.html", "_self");
  }
});
