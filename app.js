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
  // TOP 3
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


  // Clear columns

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
  // FLAG
  // ==========================================

  if (flagElement) {

    flagElement.textContent =
      countryCodeToFlag(
        club.flag
      );

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


      // Ranking color

      element.classList.add(
        getRankClass(
          rank
        )
      );


      // Flag

      const flag =
        countryCodeToFlag(
          club.flag
        );


      // ========================================
      // ROW
      // ========================================

      element.innerHTML = `

        <div class="rank-num">
          ${rank}
        </div>

        <div class="club-flag">
          ${flag}
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

    return "🌐";

  }


  code =
    String(code)
      .trim()
      .toUpperCase();


  // If already an emoji

  if (
    [...code].length > 1 &&
    !/^[A-Z]{2}$/.test(code)
  ) {

    return code;

  }


  // Invalid country code

  if (
    !/^[A-Z]{2}$/.test(code)
  ) {

    return "🌐";

  }


  // Convert PH → 🇵🇭

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