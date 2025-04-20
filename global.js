console.log("IT’S ALIVE!");

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/portfolio-dsc106/";

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Setup nav menu
const pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "resume/", title: "Resume" },
  { url: "https://github.com/chewycrunch", title: "Github Profile" },
];

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  // next step: create link and add it to nav
  url = !url.startsWith("http") ? BASE_PATH + url : url;

  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );

  if (a.host !== location.host) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }

  nav.append(a);
  //
}

const navLinks = $$("nav a");

// Add Dark Mode Toggle
document.body.insertAdjacentHTML(
  "afterbegin",
  `
	<label class="color-scheme">
		Theme:
		<select>
      <option value="light dark">Auto</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
		</select>
	</label>`
);

const select = document.querySelector(".color-scheme select");

// Set color scheme helper
const setColorScheme = (colorScheme) => {
  document.documentElement.style.setProperty("color-scheme", colorScheme);
  console.log("color scheme set to", colorScheme);
  select.value = colorScheme;
  localStorage.setItem("colorScheme", colorScheme);
};

// Set initial color scheme based on localStorage or system preference
const savedColorScheme = localStorage.getItem("colorScheme");
const initialColorScheme = ["light dark", "light", "dark"].includes(
  savedColorScheme
)
  ? savedColorScheme
  : "light dark";
setColorScheme(initialColorScheme);

// Listen for updates to the color scheme
select.addEventListener("input", function (event) {
  console.log("color scheme changed to", event.target.value);

  setColorScheme(event.target.value);
});

// Handle projects loader
export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch projects: ${response.statusText}`);

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching or parsing JSON data:", error);
  }
}

export const renderProjects = (
  project,
  containerElement,
  headingLevel = "h2"
) => {
  // Clear existing content
  containerElement.innerHTML = "";

  // Update the project count in the projects-title element
  const projectsTitle = document.querySelector(".projects-title");
  if (projectsTitle) {
    projectsTitle.textContent = `${project.length} Projects`;
  }

  // Loop through each project and create an article
  project.forEach((proj) => {
    const article = document.createElement("article");

    // Dynamically set the heading level
    const heading = document.createElement(headingLevel);
    heading.textContent = proj.title;

    // Create and populate the image element
    const img = document.createElement("img");
    img.src = proj.image || "https://via.placeholder.com/150";
    img.alt = proj.title || "Project image";

    // Create and populate the description paragraph
    const description = document.createElement("p");
    description.textContent = proj.description || "No description available.";

    // Append elements to the article
    article.appendChild(heading);
    article.appendChild(img);
    article.appendChild(description);

    // Append the article to the container
    containerElement.appendChild(article);
  });
};

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
