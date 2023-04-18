import App from "./App";
import data from "./data";

function main() {
  const divTitle = document.createElement("div");
  document.body.appendChild(divTitle);
  divTitle.className = "title-container";
  (style => {
    style.backgroundColor = "rgb(46, 53, 56)";
    style.paddingTop = "25px";
    style.paddingBottom = "5px";
    style.paddingRight = "5px";
    style.paddingLeft = "5px";
    style.marginBottom = "30px";
    style.boxShadow = "0px 1px 10px rgba(0, 0, 0, 0.65)";
  })(divTitle.style);

  document.body.appendChild(divTitle);
  (style => {
    style.backgroundColor = "rgb(46, 53, 56)"; 
  })(divTitle.style);

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
