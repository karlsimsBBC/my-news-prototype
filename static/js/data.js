class ArticleManager {

  constructor(src) {
    this.src = src;
    this.data = [];


    this.selected = this.getStored()
    this.id2index = {};
    this.cursorIndex = 0;
    this.size = -1;
  }

  getStored() {
    let stored = localStorage.getItem('selected-stories');
    if (stored !== null) {
      return new Set(["business-52504187"]);
    }
    return new Set(JSON.parse(stored));
  }

  load(callOnDone) {
    fetch(this.src)
      .then((res) => res.json())
      .then((res) => {
        this.id2index = {}
        this.data = shuffle(res);
        this.size = this.data.length;
        for (let i = 0; i < this.size; i++) {
          this.id2index[this.data[i].id] = i;
        }
        if (callOnDone !== undefined) {
          callOnDone()
        }
      })
  }

  *
  nextBatch(n = 10) {
    let offest = this.cursorIndex + 10;
    while (this.cursorIndex < offest && this.cursorIndex < this.size) {
      yield this.data[this.cursorIndex]
      this.cursorIndex++
    }
  }

  getSelected() {
    let items = []
    for (let id of this.selected) {
      items.push(this.getArticleFromId(id))
    }
    return items;
  }

  removeSelected(id) {
    this.selected.delete(id)
    let now = JSON.stringify(Array.from(this.selected));
    localStorage.setItem('selected-stories', now)
  }

  getSelectedCount() {
    return this.selected.size;
  }

  addSelected(id) {
    this.selected.add(id)
    let now = JSON.stringify(Array.from(this.selected));
    localStorage.setItem('selected-stories', now)
  }

  getArticleFromId(id) {
    return this.data[this.id2index[id]]
  }
}


function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}