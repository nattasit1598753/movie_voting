// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDq7a7PkJMiMyytrHxI8e4FMSIup8tlGwo",
  authDomain: "movie-voting-da36a.firebaseapp.com",
  projectId: "movie-voting-da36a",
  storageBucket: "movie-voting-da36a.firebasestorage.app",
  messagingSenderId: "593379545443",
  appId: "1:593379545443:web:8a72d346a9069ce3168356",
  measurementId: "G-B4EQN6G5TY"
};

firebase.initializeApp(firebaseConfig);
// --- เพิ่ม 2 บรรทัดนี้ให้ครบ ---
const auth = firebase.auth(); // บรรทัดนี้คือจุดที่หายไปครับ!
// --------------------------

let currentUser = null; // สำหรับเก็บข้อมูลคนล็อกอิน


const movies = [
  { id: "1", title: "Interstellar", poster: "https://upload.wikimedia.org/wikipedia/th/b/bc/Interstellar_film_poster.jpg" },
  { id: "2", title: "Inception", poster: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/9gk7Fn9sVAsS9o99G9NET6YvUfw.jpg" },
  { id: "3", title: "Dune", poster: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/d5NXSklfzG0pGOBJ9vGvHXv62pE.jpg" },
  { id: "4", title: "Avatar", poster: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/jRXYjXuv8V2Y1XDeYhApyp6OUC1.jpg" },
  { id: "5", title: "Blade Runner 2049", poster: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/gajva2L0rQvSfkvMvyG6oGv9R3o.jpg" }
];

let selected = [];

function updateRanks() {
  document.querySelectorAll(".movie").forEach((div, index) => {
    const rankDiv = div.querySelector(".rank");
    const movieId = movies[index].id;
    const pos = selected.indexOf(movieId);

    if (pos === -1) {
      rankDiv.innerText = "";
    } else {
      rankDiv.innerText = `⭐ ${3 - pos} points`;
    }
  });
}


const list = document.getElementById("movie-list");

movies.forEach((movie, index) => {
  const div = document.createElement("div");
  div.className = "movie"; // คลาสสำหรับ CSS

  // โครงสร้างใหม่: มีรูปภาพ, ตัวครอบรูป, และ Rank
  div.innerHTML = `
    <div class="poster-container">
      <img src="${movie.poster}" alt="${movie.title}" class="movie-img">
      <div class="hologram-overlay"></div>
    </div>
    <div class="movie-info">
      <span class="movie-title">${movie.title}</span>
      <div class="rank"></div>
    </div>
  `;

  div.onclick = () => {
    // ... โค้ดเลือกหนัง (เหมือนเดิม) ...
    if (selected.includes(movie.id)) {
      selected = selected.filter(id => id !== movie.id);
      div.classList.remove("selected");
    } else {
      if (selected.length >= 3) { return alert("เลือกได้แค่ 3 เรื่อง"); }
      selected.push(movie.id);
      div.classList.add("selected");
    }
    updateRanks();
  };

  list.appendChild(div);
});

document.getElementById("submitVote").onclick = () => {
  if (selected.length !== 3) {
    alert("กรุณาเลือกให้ครบ 3 เรื่อง");
    return;
  }

  submitVote(selected);
};


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function submitVote(votes) {
  if (!currentUser) {
    alert("🚨 กรุณา Login ด้วย Google ก่อนโหวต [ACCESS_DENIED]");
    return;
  }

  const userId = currentUser.uid;
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

  try {
    // 1. ตรวจสอบประวัติการโหวตใน 24 ชั่วโมงที่ผ่านมา
    const recentVotes = await db.collection("logs")
      .where("userId", "==", userId)
      .where("timestamp", ">", oneDayAgo)
      .get();

    if (!recentVotes.empty) {
      alert("❌ SYSTEM_ERROR: คุณเพิ่งโหวตไป! โหวตได้อีกครั้งหลังจากผ่านไป 24 ชม.");
      return;
    }

    // 2. เตรียมบันทึกข้อมูลแบบ Batch (ถ้าอันหนึ่งพัง จะไม่บันทึกทั้งหมดเพื่อความปลอดภัย)
    const batch = db.batch();
    const scores = [3, 2, 1];

    // -- ส่วนที่ 1: บันทึก LOG รายละเอียดว่าใครโหวตอะไรตอนไหน --
    const logRef = db.collection("logs").doc(); // สร้าง ID อัตโนมัติ
    batch.set(logRef, {
      userId: userId,
      displayName: currentUser.displayName || "Anonymous User",
      email: currentUser.email,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      votes: votes // เก็บ Array ID ของหนังที่เลือก [id1, id2, id3]
    });

    // -- ส่วนที่ 2: อัปเดตคะแนนรวมให้หนังแต่ละเรื่อง --
    votes.forEach((id, index) => {
      const movieRef = db.collection("votes").doc(id);
      // ใช้ increment เพื่อบวกคะแนนในระดับ Server ป้องกันปัญหาโหวตพร้อมกันแล้วคะแนนเพี้ยน
      batch.set(movieRef, { 
        score: firebase.firestore.FieldValue.increment(scores[index]) 
      }, { merge: true });
    });

    // 3. ยืนยันการบันทึกทั้งหมดลงฐานข้อมูล
    await batch.commit();

    // 4. แจ้งเตือนและ Reset หน้าเว็บ
    alert("✅ TRANSMISSION_COMPLETE: บันทึกการโหวตเรียบร้อย!");
    selected = []; // ล้างค่าที่เลือก
    updateRanks(); // อัปเดต UI
    // (เพิ่มเติม) คุณอาจจะใส่ฟังก์ชันเพื่อไปหน้าดูผลคะแนนตรงนี้

  } catch (error) {
    console.error("Voting Error:", error);
    alert("⚠️ SYSTEM_CRITICAL: เกิดข้อผิดพลาดในการโหวต");
  }
}


console.log("Firebase connected:", db);

async function handleGoogleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  try {
    // เรียกหน้าต่าง Login ของ Google
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    console.log("Authenticated as:", user.displayName);
    alert(`Welcome, ${user.displayName} [ACCESS_GRANTED]`);
  } catch (error) {
    console.error("Auth Error:", error);
    alert("การเชื่อมต่อล้มเหลว: " + error.message);
  }
}

// อัปเดตส่วนนี้ใน script.js
auth.onAuthStateChanged(user => {
  const loginForm = document.getElementById("login-form");
  const userInfo = document.getElementById("user-info");
  const userNameDisplay = document.getElementById("user-display-name");

  if (user) {
    currentUser = user;
    loginForm.classList.add("hidden");
    userInfo.classList.remove("hidden");
    userNameDisplay.innerText = `[ WELCOME: ${user.displayName.toUpperCase()} ]`;
    console.log("Logged in:", user.email);
  } else {
    currentUser = null;
    loginForm.classList.remove("hidden");
    userInfo.classList.add("hidden");
    console.log("Logged out");
  }
}); 
