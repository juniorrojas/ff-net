class DragBehavior {
  constructor(canvas) {
    this.canvas = canvas;

    this._onDragBegin = this.onDragBegin.bind(this);
    canvas.addEventListener("mousedown", this._onDragBegin, {passive: false});
    canvas.addEventListener("touchstart", this._onDragBegin, {passive: false});
    
    this._onDragProgress = this.onDragProgress.bind(this);
    canvas.addEventListener("mousemove", this._onDragProgress, {passive: false});
    canvas.addEventListener("touchmove", this._onDragProgress, {passive: false});

    this._onDragEnd = this.onDragEnd.bind(this);
    window.addEventListener("mouseup", this._onDragEnd);
    window.addEventListener("touchend", this._onDragEnd);
    window.addEventListener("touchcancel", this._onDragEnd);
  }

  computeCursor(event) {
    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;
    if (event.touches == null) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    const left = clientX - rect.left;
    const top = clientY - rect.top;
    const cursor = {x: left, y: top};
    event.cursor = cursor;
  }

  onDragBegin(event) {
    event.preventDefault();
    this.computeCursor(event);
    this.processDragBegin(event);
  }

  onDragProgress(event) {
    if (this.dragState == null) return;
    event.preventDefault();
    this.computeCursor(event);
    this.processDragProgress(event);
  }

  onDragEnd(event) {
    this.dragState = null;
  }

  dragging() {
    return this.dragState != null;
  }
}

module.exports = DragBehavior;