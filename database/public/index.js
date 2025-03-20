var swiper = new Swiper(".mySwiper", {
  loop: true,
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  coverflowEffect: {
    rotate: 0,
    stretch: 0,
    depth: 300,
    modifier: 1,
    slideShadows: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".nut-next",
    prevEl: ".nut-prev",
  },
});

document.getElementById("nextButton").addEventListener("click", function () {
  swiper.slideNext();
});

// Thêm sự kiện click cho nút "lùi"
document.getElementById("prevButton").addEventListener("click", function () {
  swiper.slidePrev();
});

document.addEventListener("scroll", function () {
  const element = document.querySelector(".mid-content");
  const elementPosition = element.getBoundingClientRect().top;
  const screenPosition = window.innerHeight / 1.3; // Điều chỉnh vị trí kích hoạt hiệu ứng

  if (elementPosition < screenPosition) {
    element.classList.add("visible");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Hiệu ứng hiển thị khi load trang
  const frame = document.querySelector(".thank-you-frame");
  frame.classList.add("mounted");

  // Xử lý sự kiện click vào biểu tượng hoa để xoay
  const flowerIcons = document.querySelectorAll(".flower-icon");
  flowerIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      icon.classList.toggle("rotate");
    });
  });
});
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}
document.addEventListener("DOMContentLoaded", function () {
  const rightSection = document.querySelector(".right-section");
  const token = getCookie("token");

  if (token) {
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
        document.getElementById("dangky").style.display = "none";
        rightSection.innerHTML = `
          <div class="user-info">
            <div class="user-greeting">
              <span class="welcome-text">Xin chào,</span>
              <span class="user-name">${userData.name}</span>
              <span class="user-dot">•</span>
              <button class="btn " onclick="document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; window.location.href = '/log_in.html';">
          <span>Đăng xuất</span>
          <i class="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        `;
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        showRegisterButton(rightSection);
      });
  } else {
    showRegisterButton(rightSection);
  }
});

function showRegisterButton(element) {
  element.innerHTML = `<button class="btn" onclick="window.location.href='log_in.html';">
                <span>Đăng nhập</span>
            </button>`;
}
document.querySelectorAll(".auth-require-link").forEach((element) => {
  element.addEventListener("click", function () {
    const token = getCookie("token");
    if (!token) {
      alert("/đăng nhập để xem nội dung này!");
      window.location.href = "/log_in.html";
    } else {
      window.location.href = "danhsach.html";
    }
  });
});
