
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

const movies = [
  { id: "1", title: "Green mile", poster: "https://m.media-amazon.com/images/I/81ryvZtPc7L._AC_UF894,1000_QL80_.jpg" },
  { id: "2", title: "The Wonderful Story of Henry Sugar", poster: "https://resizing.flixster.com/W1q4CGmGVpsPDrxRK3-liMKCDx8=/fit-in/705x460/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p26972315_v_v7_aa.jpg" },
  { id: "3", title: "Knives Out", poster: "https://m.media-amazon.com/images/S/pv-target-images/9994a930958ea8f01eab73600a3f42235af108d1740343d632ed0b5cf02701f6.jpg" },
  { id: "4", title: "Predestination", poster: "https://m.media-amazon.com/images/I/91eAqabf6cL._AC_UF894,1000_QL80_.jpg" },
  { id: "5", title: "Source Code", poster: "https://m.media-amazon.com/images/M/MV5BMTY0MTc3MzMzNV5BMl5BanBnXkFtZTcwNDE4MjE0NA@@._V1_.jpg" },
  { id: "6", title: "Inception", poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg" },
  { id: "7", title: "Gone Girl", poster: "https://f.ptcdn.info/666/053/000/owf4fcgtqpiJX6F7wwT-o.jpg" },
  { id: "8", title: "A Beautiful Mind:", poster: "https://upload.wikimedia.org/wikipedia/th/thumb/b/b8/A_Beautiful_Mind_Poster.jpg/250px-A_Beautiful_Mind_Poster.jpg" },
  { id: "9", title: "เอ๋อเหรอ", poster: "https://upload.wikimedia.org/wikipedia/th/thumb/9/91/Beautifulwonderfulperfect.jpg/250px-Beautifulwonderfulperfect.jpg" },
  { id: "10", title: "มหาลัยเหมืองแร่", poster: "https://f.ptcdn.info/514/024/000/1413372625-1-o.jpg" }
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

function submitVote(votes) {
  const scores = [3,2,1];

  votes.forEach((id, index) => {
    const ref = db.collection("votes").doc(id);

    ref.get().then(doc => {
      if (doc.exists) {
        ref.update({
          score: doc.data().score + scores[index]
        });
      } else {
        ref.set({ score: scores[index] });
      }
    });
  });

  alert("✅ Vote Submitted!");
  setTimeout(() => {
        window.location.reload();
    }, 500);
}


console.log("Firebase connected:", db);




