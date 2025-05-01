import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const allProjects = await fetchJSON("../lib/projects.json");
const projectsContainer = document.querySelector(".projects");

// D3 Pie Chart
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let selectedYear = null;
let query = "";

function getFilteredProjects() {
  let list = allProjects;

  if (selectedYear) {
    list = list.filter((p) => p.year.toString() === selectedYear);
  }

  if (query) {
    const q = query.toLowerCase();
    list = list.filter((p) =>
      Object.values(p).join(" ").toLowerCase().includes(q)
    );
  }

  return list;
}

const renderPieChart = (filteredProjects) => {
  const rolledData = d3.rollups(
    filteredProjects,
    (v) => v.length,
    (d) => d.year
  );
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map((d) => arcGenerator(d));
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Grab svg element
  const newSVG = d3.select("svg");

  // Clear existing paths
  newSVG.selectAll("path").remove();

  arcs.forEach((arc, idx) => {
    newSVG
      .append("path")
      .attr("d", arc)
      .attr("fill", colors(idx))
      .classed("selected", arcData[idx].data.label === selectedYear)
      .on("click", () => {
        selectedYear =
          selectedYear === arcData[idx].data.label
            ? null
            : arcData[idx].data.label;
        // selectedIndex = selectedIndex === idx ? -1 : idx;

        // newSVG.selectAll("path").attr("class", (_, i) => {
        //   return arcData[i].data.label === selectedYear ? "selected" : "";
        //   // return i === selectedIndex ? "selected" : "";
        // });

        const filtered = getFilteredProjects();
        renderProjects(filtered, projectsContainer, "h2");
        if (query == "") {
          renderPieChart(allProjects);
        } else renderPieChart(filtered);
      });
  });

  // Update legends
  const legendElement = d3.select(".legend");
  legendElement.selectAll("li").remove(); // Clear existing legend items
  data.forEach((d, idx) => {
    legendElement
      .append("li")
      .attr("style", `--color:${colors(idx)}`) // set the style attribute while passing in parameters
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
  });
};

renderProjects(allProjects, projectsContainer, "h2");
renderPieChart(allProjects);

let searchInput = document.querySelector(".searchBar");

searchInput.addEventListener("input", (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  const filtered = getFilteredProjects();
  renderProjects(filtered, projectsContainer, "h2");
  if (query == "") {
    renderPieChart(allProjects);
  } else renderPieChart(filtered);
});
