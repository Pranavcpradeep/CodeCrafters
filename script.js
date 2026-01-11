function sendOTP() {
  const email = document.getElementById("email").value;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (pattern.test(email)) {
    const phone = document.getElementById("phone").value;
    const pattern = /^[6-9]\d{9}$/;
    window.phone = phone;
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
  alert("Call 112 for Emergency");
}

function openMap() {
  window.location.href = "maps.html";
}

function openPrecautions() {
  window.location.href = "precautions.html";
}




function initMap() {
  // Map center coordinates (example: Bangalore)
  const center = { lat: 12.9716, lng: 77.5946 };

  // Create map
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: center,
  });

  // Add Safe Shelter marker
  const shelterMarker = new google.maps.Marker({
    position: { lat: 12.9667, lng: 77.5667 },
    map: map,
    title: "Safe Shelter",
    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
  });

  // Add Hospital marker
  const hospitalMarker = new google.maps.Marker({
    position: { lat: 12.9762, lng: 77.6033 },
    map: map,
    title: "Hospital",
    icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
  });

  // Try to get user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        new google.maps.Marker({
          position: userPos,
          map: map,
          title: "Your Location",
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        });
        map.setCenter(userPos); // center map to user
      },
      () => {
        console.log("Geolocation permission denied or unavailable.");
      }
    );
  } else {
    console.log("Geolocation not supported by this browser.");
  }
}
