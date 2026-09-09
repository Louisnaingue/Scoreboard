// ==========================================
// GOOGLE APPS SCRIPT WEB APP URL
// ==========================================

const GOOGLE_SHEET_API =
  "https://script.google.com/macros/s/AKfycbwI5FzziSj6wKfx0uAm0FdfL7r_ekYc6LzW9640U2zhp16V835_SH3mhlBd6u4SWma_NA/exec";


// ==========================================
// LOAD LEADERBOARD
// ==========================================

async function loadLeaderboard() {

  try {

    const response =
      await fetch(GOOGLE_SHEET_API);

    if (!response.ok) {

      throw new Error(
        "Unable to connect to Google Sheets."
      );

    }

    const clubs =
      await response.json();

    // Check Apps Script error

    if (clubs.error) {

      throw new Error(
        clubs.error
      );

    }

    displayLeaderboard(clubs);

  }

  catch (error) {

    console.error(
      "Leaderboard Error:",
      error
    );

    showError();

  }

}


// ==========================================
// DISPLAY LEADERBOARD
// ==========================================

function displayLeaderboard(clubs) {

  if (
    !clubs ||
    clubs.length === 0
  ) {

    showError(
      "No clubs available."
    );

    return;

  }


  // ==========================================
  // SORT BY MEMBERS
  // HIGHEST FIRST
  // ==========================================

  clubs.sort((a, b) => {

    return (
      Number(b.members || 0) -
      Number(a.members || 0)
    );

  });


  // ==========================================
  // TOTAL CLUBS
  // ==========================================

  const totalClubs =
    document.getElementById(
      "totalClubs"
    );

  if (totalClubs) {

    totalClubs.textContent =
      clubs.length;

  }


  // ==========================================
  // TOTAL MEMBERS
  // ==========================================

  const totalMembers =
    clubs.reduce(
      (total, club) => {

        return (
          total +
          Number(
            club.members || 0
          )
        );

      },
      0
    );


  const totalMembersElement =
    document.getElementById(
      "totalMembers"
    );

  if (totalMembersElement) {

    totalMembersElement.textContent =
      totalMembers.toLocaleString();

  }


  // ==========================================
  // LEADING CLUB
  // ==========================================

  const leadingClub =
    document.getElementById(
      "leadingClub"
    );

  if (
    leadingClub &&
    clubs[0]
  ) {

    leadingClub.textContent =
      getClubName(
        clubs[0]
      );

  }


  // ==========================================
  // TOP 3 PODIUM
  // ==========================================

  updatePodium(
    1,
    clubs[0]
  );

  updatePodium(
    2,
    clubs[1]
  );

  updatePodium(
    3,
    clubs[2]
  );


  // ==========================================
  // RANKS 4+
  // ==========================================

  const remainingClubs =
    clubs.slice(3);


  const column1 =
    document.getElementById(
      "column1"
    );

  const column2 =
    document.getElementById(
      "column2"
    );

  const column3 =
    document.getElementById(
      "column3"
    );

  const column4 =
    document.getElementById(
      "column4"
    );


  // ==========================================
  // CLEAR COLUMNS
  // ==========================================

  [
    column1,
    column2,
    column3,
    column4

  ].forEach(column => {

    if (column) {

      column.innerHTML = "";

    }

  });


  // ==========================================
  // DIVIDE INTO FOUR COLUMNS
  // ==========================================

  const clubsPerColumn =
    Math.ceil(
      remainingClubs.length / 4
    );


  const firstColumn =
    remainingClubs.slice(
      0,
      clubsPerColumn
    );


  const secondColumn =
    remainingClubs.slice(
      clubsPerColumn,
      clubsPerColumn * 2
    );


  const thirdColumn =
    remainingClubs.slice(
      clubsPerColumn * 2,
      clubsPerColumn * 3
    );


  const fourthColumn =
    remainingClubs.slice(
      clubsPerColumn * 3
    );


  // ==========================================
  // RENDER COLUMNS
  // ==========================================

  renderColumn(
    firstColumn,
    4,
    column1
  );


  renderColumn(
    secondColumn,
    4 + firstColumn.length,
    column2
  );


  renderColumn(
    thirdColumn,
    4 +
    firstColumn.length +
    secondColumn.length,
    column3
  );


  renderColumn(
    fourthColumn,
    4 +
    firstColumn.length +
    secondColumn.length +
    thirdColumn.length,
    column4
  );


  // ==========================================
  // UPDATE TIME
  // ==========================================

  updateTime();

}


// ==========================================
// UPDATE PODIUM
// ==========================================

function updatePodium(
  rank,
  club
) {

  const clubNameElement =
    document.getElementById(
      `rank${rank}Club`
    );


  const membersElement =
    document.getElementById(
      `rank${rank}Members`
    );


  const flagElement =
    document.getElementById(
      `rank${rank}Flag`
    );


  // ==========================================
  // NO CLUB
  // ==========================================

  if (!club) {

    if (clubNameElement) {

      clubNameElement.textContent =
        "-";

    }

    if (membersElement) {

      membersElement.innerHTML =
        `0 <span>MEMBERS</span>`;

    }

    if (flagElement) {

      flagElement.textContent =
        "🌐";

    }

    return;

  }


  // ==========================================
  // CLUB NAME
  // ==========================================

  if (clubNameElement) {

    clubNameElement.textContent =
      getClubName(
        club
      );

  }


  // ==========================================
  // FLAG / CLUB-SPECIFIC IMAGE
  // PODIUM #1, #2, #3
  // ==========================================

  if (flagElement) {

    const clubImage =
      getClubImage(
        club
      );


    if (clubImage) {

      flagElement.innerHTML = `
        <img
          src="${clubImage}"
          class="podium-club-specific-image"
          alt="${escapeHTML(
            getClubName(club)
          )}"
        >
      `;

    }

    else {

      flagElement.textContent =
        countryCodeToFlag(
          club.flag
        );

    }

  }


  // ==========================================
  // MEMBERS
  // ==========================================

  if (membersElement) {

    membersElement.innerHTML =
      `${Number(
        club.members || 0
      ).toLocaleString()}
      <span>MEMBERS</span>`;

  }

}


// ==========================================
// RENDER RANKS 4+
// ==========================================

function renderColumn(
  clubs,
  startingRank,
  container
) {

  if (!container) {

    return;

  }


  clubs.forEach(
    (club, index) => {

      const rank =
        startingRank + index;


      const element =
        document.createElement(
          "div"
        );


      element.className =
        "club-item";


      // ==========================================
      // RANKING COLOR
      // ==========================================

      element.classList.add(
        getRankClass(
          rank
        )
      );


      // ==========================================
      // NORMAL COUNTRY FLAG
      // ==========================================

      const flag =
        countryCodeToFlag(
          club.flag
        );


      // ==========================================
      // CLUB-SPECIFIC IMAGE
      // ==========================================

      const clubImage =
        getClubImage(
          club
        );


      // ==========================================
      // ROW
      // ==========================================

      element.innerHTML = `

        <div class="rank-num">
          ${rank}
        </div>

        <div class="club-flag">
          ${
            clubImage
              ? `<img
                  src="${clubImage}"
                  class="club-specific-image"
                  alt="${escapeHTML(
                    getClubName(club)
                  )}"
                >`
              : flag
          }
        </div>

        <div class="club-name-list">
          ${escapeHTML(
            getClubName(club)
          )}
        </div>

        <div class="member-count">
          ${Number(
            club.members || 0
          ).toLocaleString()}
        </div>

      `;


      container.appendChild(
        element
      );

    }
  );

}


// ==========================================
// RANK CLASS
// ==========================================

function getRankClass(rank) {

  if (rank === 4) {

    return "rank-4";

  }

  if (rank === 5) {

    return "rank-5";

  }

  if (rank === 6) {

    return "rank-6";

  }

  return "rank-other";

}


// ==========================================
// COUNTRY CODE → FLAG
// ==========================================

function countryCodeToFlag(
  code
) {

  if (!code) {

    return "🏳️";

  }


  code =
    String(code)
      .trim()
      .toUpperCase();


  // ==========================================
  // IF ALREADY AN EMOJI
  // ==========================================

  if (
    [...code].length > 1 &&
    !/^[A-Z]{2}$/.test(code)
  ) {

    return code;

  }


  // ==========================================
  // INVALID COUNTRY CODE
  // ==========================================

  if (
    !/^[A-Z]{2}$/.test(code)
  ) {

    return "🏳️";

  }


  // ==========================================
  // CONVERT COUNTRY CODE → FLAG
  // Example: PH → 🇵🇭
  // ==========================================

  return code
    .split("")
    .map(letter => {

      return String.fromCodePoint(
        127397 +
        letter.charCodeAt(0)
      );

    })
    .join("");

}


// ==========================================
// GET CLUB NAME
// ==========================================

function getClubName(
  club
) {

  if (
    club &&
    club.name !== undefined &&
    club.name !== null
  ) {

    return String(
      club.name
    );

  }


  if (
    club &&
    club.club !== undefined &&
    club.club !== null
  ) {

    return String(
      club.club
    );

  }


  return "Unknown Club";

}


// ==========================================
// CLUB-SPECIFIC IMAGE
// ==========================================

function getClubImage(
  club
) {

  const clubName =
    getClubName(
      club
    )
      .trim()
      .toLowerCase();


  // ==========================================
  // HAWAII CLUB
  // ==========================================

  if (clubName === "hawaii club") 
    {
    return "images/hawaii.png";
  }
  if (clubName === "networking club"
  ) {
    return "images/networking.jpg";
  }
  if (clubName === "pacific studies club"
  ) {
    return "images/pacific.jpeg";
  }
  if (clubName === "running and hiking club"
  ) {
    return "images/running.png";
  }
  if (clubName === "marketing society club"
  ) {
    return "images/marketing.png";
  }
  if (clubName === "latin america club"
  ) {
    return "images/latin.png";
  }
  if (clubName === "afro world"
  ) {
    return "images/afro.png";
  }


  // ==========================================
  // ALL OTHER CLUBS
  // USE NORMAL FLAG
  // ==========================================

  return null;

}


// ==========================================
// UPDATE TIME
// ==========================================

function updateTime() {

  const now =
    new Date();


  const time =
    now.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );


  const headerTime =
    document.getElementById(
      "headerTime"
    );


  if (headerTime) {

    headerTime.textContent =
      time;

  }


  const lastUpdated =
    document.getElementById(
      "lastUpdated"
    );


  if (lastUpdated) {

    lastUpdated.textContent =
      time;

  }

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}


// ==========================================
// ERROR
// ==========================================

function showError(
  message =
    "Unable to load leaderboard."
) {

  const columns = [

    document.getElementById(
      "column1"
    ),

    document.getElementById(
      "column2"
    ),

    document.getElementById(
      "column3"
    ),

    document.getElementById(
      "column4"
    )

  ];


  columns.forEach(column => {

    if (column) {

      column.innerHTML = `

        <div class="loading">
          ${escapeHTML(
            message
          )}
        </div>

      `;

    }

  });

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadLeaderboard();


// ==========================================
// LIVE UPDATE
// ==========================================
// Refresh every 10 seconds

setInterval(
  loadLeaderboard,
  10000
);