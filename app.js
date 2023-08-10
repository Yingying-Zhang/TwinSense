import { Color } from "three";
import { PerspectiveCamera } from "three";
import { IfcViewerAPI } from "web-ifc-viewer";
import {
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCFURNISHINGELEMENT,
  IFCDOOR,
  IFCWINDOW,
  IFCPLATE,
  IFCMEMBER,
} from "web-ifc";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

const container = document.getElementById("viewer-container");
const viewer = new IfcViewerAPI({
  container,
  backgroundColor: new Color(0x333333),
});
// create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();

loadIfc("./caad.ifc");
let model;

async function loadIfc(url) {
  // Load the model
  model = await viewer.IFC.loadIfcUrl(url);
  model.removeFromParent();
  await viewer.shadowDropper.renderShadow(model.modelID);
  viewer.context.renderer.postProduction.active = true;
  // Add dropped shadow and post-processing efect

  const project = await viewer.IFC.getSpatialStructure(model.modelID);
  console.log(project);
  createTreeMenu(project);

  setupAllCategories();
}

//visbility
const categories = {
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCFURNISHINGELEMENT,
  IFCDOOR,
  IFCWINDOW,
  IFCPLATE,
  IFCMEMBER,
};

// Gets the name of a category
function getName(category) {
  const names = Object.keys(categories);
  return names.find((name) => categories[name] === category);
}

// Gets all the items of a category
async function getAll(category) {
  return viewer.IFC.loader.ifcManager.getAllItemsOfType(
    model.modelID,
    category
  );
}

// Creates a new subset containing all elements of a category
async function newSubsetOfType(category) {
  const ids = await getAll(category);
  const customID = category.toString();
  return viewer.IFC.loader.ifcManager.createSubset({
    modelID: 0,
    scene,
    ids,
    removePrevious: true,
    customID: customID,
  });
}

const subsets = {};

async function setupAllCategories() {
  const allCategories = Object.values(categories);
  for (let i = 0; i < allCategories.length; i++) {
    const category = allCategories[i];
    await setupCategory(category);
  }
}

async function setupCategory(category) {
  subsets[category] = await newSubsetOfType(category);
  setupCheckbox(category);
}

function setupCheckbox(category) {
  const name = getName(category);
  const checkbox = document.getElementById(name);

  if (checkbox) {
    checkbox.addEventListener("change", (event) => {
      const checked = event.target.checked;
      const subset = subsets[category];
      if (checked) scene.add(subset);
      else subset.removeFromParent();
    });
  }
}

// Set up 2d renderer
const scene = viewer.context.getScene();
// const label = document.createElement('h1');
// label.textContent='Hello World';

// const labelObject = new  CSS2DObject(label);
// scene.add(labelObject);

// const labelRenderer = new CSS2DRenderer();
// labelRenderer.setSize( window.innerWidth, window.innerHeight );
// labelRenderer.domElement.style.position = 'absolute';
// labelRenderer.domElement.style.pointerEvents = 'none';
// labelRenderer.domElement.style.top = '0';
// document.body.appendChild( labelRenderer.domElement );

// const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(0, 0, 5);
// camera.lookAt(scene.position);

// function animate(){
//     requestAnimationFrame(animate);
//     labelRenderer.render(scene, camera);
// }

// animate();

//
// spatial tree
//
function createTreeMenu(ifcProject) {
  const root = document.getElementById("tree-root");
  removeAllChildren(root);
  const ifcProjectNode = createNestedChild(root, ifcProject);
  ifcProject.children.forEach((child) => {
    constructTreeMenuNode(ifcProjectNode, child);
  });
}

function constructTreeMenuNode(parent, node) {
  const children = node.children;
  if (children.length === 0) {
    createSimpleChild(parent, node);
    return;
  }
  const nodeElement = createNestedChild(parent, node);
  children.forEach((child) => {
    constructTreeMenuNode(nodeElement, child);
  });
}

function createNestedChild(parent, node) {
  const content = nodeToString(node);
  const root = document.createElement("li");
  createTitle(root, content);
  const childrenContainer = document.createElement("ul");
  childrenContainer.classList.add("nested");
  root.appendChild(childrenContainer);
  parent.appendChild(root);
  return childrenContainer;
}

function createTitle(parent, content) {
  const title = document.createElement("span");
  title.classList.add("caret");
  title.onclick = () => {
    title.parentElement.querySelector(".nested").classList.toggle("active");
    title.classList.toggle("caret-down");
  };
  title.textContent = content;
  parent.appendChild(title);
}

function createSimpleChild(parent, node) {
  const content = nodeToString(node);
  const childNode = document.createElement("li");
  childNode.classList.add("leaf-node");
  childNode.textContent = content;
  parent.appendChild(childNode);

  childNode.onmouseenter = () => {
    viewer.IFC.selector.prepickIfcItemsByID(0, [node.expressID]);
  };

  childNode.onclick = async () => {
    viewer.IFC.selector.pickIfcItemsByID(0, [node.expressID]);
  };
}

function nodeToString(node) {
  return `${node.type} - ${node.expressID}`;
}

function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}



let jsonData; // Variable to store the fetched JSON data

// Function to create table rows for key-value pairs
function createTableRow(key, value) {
    const tbody = document.getElementById("json-body");
    const row = document.createElement("tr");
    const keyCell = document.createElement("td");
    const valueCell = document.createElement("td");
    keyCell.textContent = key;
    valueCell.textContent = value;
    row.appendChild(keyCell);
    row.appendChild(valueCell);
    tbody.appendChild(row);
}

// Print JSON data on the web page
function printJSONData(data) {
    const tbody = document.getElementById("json-body");
    tbody.innerHTML = ""; // Clear existing rows
    for (const item of data) {
        for (const [key, value] of Object.entries(item)) {
            if (typeof value === "object") {
                for (const [nestedKey, nestedValue] of Object.entries(value)) {
                    createTableRow(nestedKey, nestedValue);
                }
            } else {
                createTableRow(key, value);
            }
        }
        // Add a separator row between items
        const separatorRow = document.createElement("tr");
        const separatorCell = document.createElement("td");
        separatorCell.setAttribute("colspan", "2");
        separatorCell.innerHTML = "<hr>";
        separatorRow.appendChild(separatorCell);
        tbody.appendChild(separatorRow);
    }
}

// Filter JSON data based on a key-value pair
function filterData(key, value) {
    const filteredData = jsonData.filter((item) => {
        for (const [k, v] of Object.entries(item)) {
            if (typeof v === "object") {
                for (const [nestedKey, nestedValue] of Object.entries(v)) {
                    if (nestedKey === key && nestedValue === value) {
                        return true;
                    }
                }
            } else {
                if (k === key && v === value) {
                    return true;
                }
            }
        }
        return false;
    });
    printJSONData(filteredData);
}

// Fetch JSON data from the server
async function fetchData() {
    try {
        const response = await fetch("http://localhost:8000/json_data");
        if (response.ok) {
            jsonData = await response.json();
            printJSONData(jsonData);
        } else {
            console.error("Error:", response.status);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

const fetchButton = document.getElementById("fetch-button");
fetchButton.addEventListener("click", fetchData);

// Filter button click event
const filterButton = document.getElementById("filter-button");
filterButton.addEventListener("click", () => {
    const keyInput = document.getElementById("filter-key");
    const valueInput = document.getElementById("filter-value");
    const key = keyInput.value;
    const value = valueInput.value;
    filterData(key, value);
});


//left-tree-menu
const toggler = document.getElementsByClassName("caret");
let i;

for (i = 0; i < toggler.length; i++) {
  toggler[i].addEventListener("click", function () {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("caret-down");
  });
}

//highlight
// window.ondblclick = async () => await viewer.IFC.selector.pickIfcItem();
// window.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();
