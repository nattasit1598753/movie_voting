
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
  window.location.reload(); 
}


console.log("Firebase connected:", db);


