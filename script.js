function sendOTP() {
  const email = document.getElementById("email").value;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (pattern.test(email)) {
    const phone = document.getElementById("phone").value;
    const pattern = /^[6-9]\d{9}$/;
    localStorage.setItem("phone", phone);
  if (pattern.test(phone)) {
    alert("OTP sent to your phone (Demo OTP: 1234)");
  } else {
    alert("Invalid phone number");
  }
  } else {
    alert("Invalid email format");
  }
}

function verifyOTP() {
  let otp = document.getElementById("otp").value;
  if (otp === "1234") {
    window.location.href = "profile.html";
  } else {
    alert("Invalid OTP");
  }
}

function checkForm() {
  const fname = document.getElementById("fname").value.trim();
  const lname = document.getElementById("lname").value.trim();
  const address = document.getElementById("address").value.trim();
  const emergency = document.getElementById("emergency").value.trim();

  if (fname === "" || lname === "" || address === "" || emergency === "") {
    alert("Please fill all required fields");
    return false;
  }

  goToMain()
  return true;
}

function goToMain() {
  window.location.href = "main.html";
}

function callEmergency() {
  window.location.href = "emergency.html";
}

function openMap() {
  window.location.href = "maps.html";
}

function openPrecautions() {
  window.location.href = "precautions.html";
}




