// SECURITY SCRIPT (DISABLE RIGHT CLICK & INSPECT) ---
document.addEventListener("contextmenu", (event) => event.preventDefault());

document.onkeydown = function (e) {
  // F12
  if (e.keyCode == 123) return false;

  // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect Console)
  if (
    e.ctrlKey &&
    e.shiftKey &&
    (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)
  )
    return false;

  // Ctrl+U (View Source)
  if (e.ctrlKey && e.keyCode == 85) return false;
};

const defaultUsers = [
  "Chatura",
  "Henrietta",
  "Thushanaka",
  "Aravinda",
  "Isuri P.",
  "Hirudhi",
  "Rashmi",
  "Brianna",
  "Aksha",
  "Sandy",
  "Pasindi",
  "Kavindi",
  "Mathan",
  "Nethranga",
  "Thidasna",
  "Kasun",
  "Januda",
  "Isuri B.",
  "Ishan",
  "Nuwanthi",
  "Amanda",
  "Subasan",
  "Eddie",
];

const USER_STORAGE_KEY = "wip_user_list_v10";
let validWeekDates = [];
let currentWeekKey = "";
let currentFileName = ""; // Holds the dynamic filename

window.onload = function () {
  calculateWeekAndDates();
  renderTable();
};

// Calculates spacer width only when needed (during capture)
function alignHeaderToDates() {
  const nameCol = document.querySelector("th:first-child");
  const spacer = document.getElementById("header-spacer");
  if (nameCol && spacer) {
    const width = nameCol.getBoundingClientRect().width;
    spacer.style.width = width + "px";
  }
}

function calculateWeekAndDates() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const date = today.getDate();
  const weekNum = Math.ceil((date + firstDayOfMonth.getDay() - 1) / 7);

  // Display Text
  document.getElementById(
    "current-week-display"
  ).innerText = `${monthNames[currentMonth]} ${currentYear} - Week 0${weekNum}`;

  // === FILENAME LOGIC (Date_Month_Year) ===
  // Format: WIP_Attendance_04_Jan_2026
  const dateStr = today.getDate().toString().padStart(2, "0");
  currentFileName = `WIP_Attendance_${dateStr}_${monthNames[currentMonth]}_${currentYear}`;

  // Storage Key
  currentWeekKey = `att_${currentYear}_${currentMonth}_${weekNum}`;

  const currentDay = today.getDay();
  const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + distanceToMon);

  validWeekDates = [];
  for (let i = 0; i < 6; i++) {
    let d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    if (d.getMonth() === currentMonth) {
      validWeekDates.push(d);
    }
  }
}

function renderTable() {
  const headerRow = document.getElementById("table-header-row");
  while (headerRow.children.length > 1) {
    headerRow.removeChild(headerRow.lastChild);
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  validWeekDates.forEach((d) => {
    let th = document.createElement("th");
    let dateNum = d.getDate().toString().padStart(2, "0");
    let dayName = dayNames[d.getDay()];
    th.innerHTML = `${dateNum}<br><small>${dayName}</small>`;
    headerRow.appendChild(th);
  });

  loadUsersAndRenderRows();
}

function loadUsersAndRenderRows() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";
  let storedUsers = localStorage.getItem(USER_STORAGE_KEY);
  let userList = storedUsers ? JSON.parse(storedUsers) : defaultUsers;
  let weekData = localStorage.getItem(currentWeekKey);
  let attendanceMap = weekData ? JSON.parse(weekData) : {};

  userList.forEach((name) => {
    addUserRow(name, attendanceMap[name]);
  });
}

function addUserRow(name, savedStatuses) {
  const tbody = document.getElementById("table-body");
  const tr = document.createElement("tr");
  let html = `<td>
                        <div class="name-wrapper">
                            <span class="name-text">${name}</span> 
                            <button class="btn-remove" onclick="removeRow(this)">&times;</button>
                        </div>
                    </td>`;

  validWeekDates.forEach((date, index) => {
    let status =
      savedStatuses && savedStatuses[index] ? savedStatuses[index] : "default";
    html += `<td>
                <select class="status-select" onchange="saveAttendance()">
                    <option value="default" ${
                      status === "default" ? "selected" : ""
                    } hidden>Select</option>
                    <option value="present" ${
                      status === "present" ? "selected" : ""
                    }>Present</option>
                    <option value="late" ${
                      status === "late" ? "selected" : ""
                    }>Late</option>
                    <option value="leave" ${
                      status === "leave" ? "selected" : ""
                    }>On Leave</option>
                    <option value="excused" ${
                      status === "excused" ? "selected" : ""
                    }>Excused</option>
                    <option value="absent" ${
                      status === "absent" ? "selected" : ""
                    }>Absent</option>
                </select>
            </td>`;
  });
  tr.innerHTML = html;
  tbody.appendChild(tr);
  tr.querySelectorAll("select").forEach((select) => updateColor(select));
}

function saveUserList() {
  const rows = document.querySelectorAll("#table-body tr");
  const names = [];
  rows.forEach((row) => {
    let nameText = row.querySelector(".name-text").innerText.trim();
    if (nameText) names.push(nameText);
  });
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(names));
}

function saveAttendance() {
  const rows = document.querySelectorAll("#table-body tr");
  const attendanceMap = {};
  rows.forEach((row) => {
    let name = row.querySelector(".name-text").innerText.trim();
    let selects = row.querySelectorAll("select");
    let statuses = [];
    selects.forEach((select) => {
      statuses.push(select.value);
      updateColor(select);
    });
    attendanceMap[name] = statuses;
  });
  localStorage.setItem(currentWeekKey, JSON.stringify(attendanceMap));
}

function addUser() {
  const input = document.getElementById("new-user-name");
  const name = input.value.trim();
  if (name) {
    addUserRow(name, null);
    saveUserList();
    input.value = "";
  } else {
    alert("Enter a name first!");
  }
}

function removeRow(btn) {
  if (confirm("Remove user?")) {
    btn.closest("tr").remove();
    saveUserList();
    saveAttendance();
  }
}

function updateColor(select) {
  const val = select.value;
  let colorVar = "--default-bg";
  switch (val) {
    case "present":
      colorVar = "--present-bg";
      break;
    case "late":
      colorVar = "--late-bg";
      break;
    case "leave":
      colorVar = "--leave-bg";
      break;
    case "excused":
      colorVar = "--excused-bg";
      break;
    case "absent":
      colorVar = "--absent-bg";
      break;
    default:
      colorVar = "--default-bg";
  }
  const computedStyle = getComputedStyle(document.documentElement)
    .getPropertyValue(colorVar)
    .trim();
  select.style.backgroundColor = computedStyle;
}

async function captureAndAction(actionType) {
  const shareBtn = document.querySelector(".btn-share");
  const downloadBtn = document.querySelector(".btn-download");
  const originalShareText = shareBtn.innerText;
  const originalDownloadText = downloadBtn.innerText;

  if (actionType === "share") shareBtn.innerText = "...";
  if (actionType === "download") downloadBtn.innerText = "...";

  document.body.classList.add("capturing-mode");
  alignHeaderToDates(); // Center alignment trigger

  const selects = document.querySelectorAll("select.status-select");
  const tempReplacements = [];
  selects.forEach((select) => {
    const style = window.getComputedStyle(select);
    const div = document.createElement("div");
    div.className = "capture-circle";
    div.style.backgroundColor = style.backgroundColor;
    select.style.display = "none";
    select.parentNode.insertBefore(div, select);
    tempReplacements.push({ select, div });
  });

  const element = document.getElementById("capture-target");

  try {
    await new Promise((r) => setTimeout(r, 100));
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth + 50,
      width: element.scrollWidth,
    });

    // Use DYNAMIC FILENAME
    if (actionType === "download") {
      const link = document.createElement("a");
      link.download = `${currentFileName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else if (actionType === "share") {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `${currentFileName}.png`, {
          type: "image/png",
        });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "WIP Attendance" });
        } else {
          const link = document.createElement("a");
          link.download = `${currentFileName}.png`;
          link.href = canvas.toDataURL();
          link.click();
        }
      });
    }
  } catch (error) {
    console.error(error);
    alert("Error processing image.");
  } finally {
    tempReplacements.forEach((item) => {
      item.div.remove();
      item.select.style.display = "block";
    });
    document.body.classList.remove("capturing-mode");
    shareBtn.innerText = originalShareText;
    downloadBtn.innerText = originalDownloadText;
  }
}
