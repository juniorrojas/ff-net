function init(onReady) {
  const link = document.createElement("link");
  link.onload = onReady;
  document.head.appendChild(link);
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "css/main.css";

  const mm = document.createElement("meta");
  mm.name = "monetization";
  mm.content = "$ilp.uphold.com/aBBxeDFZNa3N";
  document.head.appendChild(mm);
}

module.exports = {
  init: init,
  ControlPanel: require("./ControlPanel"),
  DataCanvas: require("./DataCanvas")
};