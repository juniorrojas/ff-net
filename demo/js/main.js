import App from "./App";
import data from "./data";

function main() {
  const divTitle = document.createElement("div");
  document.body.appendChild(divTitle);
  divTitle.className = "title-container";

  const h1 = document.createElement("h1");
  h1.textContent = "ff-net";
  divTitle.appendChild(h1);

  const h2 = document.createElement("h2");
  h2.textContent = "feedforward neural network learning in real time";
  divTitle.appendChild(h2);

  window.initData = data;
  const app = new App(data);
  document.body.appendChild(app.domElement);
  window.app = app;
}

main();
