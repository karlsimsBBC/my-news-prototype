let handleTouchMove;
let handleMouseMove;

const swipeThreshold = 150;
var animating = false;
var deltaX = 0;
var pos = undefined;

const counter = document.getElementById('counter')
const maxCount = 10;


const articleManager = new ArticleManager('./static/data/comp.json');


const pickList = document.querySelector('.my-picks-list')

function getCurrent() {
  let articles = document.querySelectorAll('.article');
  if (articles.length <= 0) {
    createArticles()
    return;
  }
  curr = articles[articles.length - 1];
  curr.id = 'current-article'
  matt = curr.querySelector('.article-matt')
  mattText = matt.querySelector('.material-icons')
  curr.addEventListener('mousedown', handleMouseDown)
  curr.addEventListener('touchstart', handleTouchStart)
}

function handleMouseDown(e) {
  if (animating) {
    animating = false;
    return;
  }
  animating = true;
  let initalX = e.pageX;
  curr.style.transition = '0'
  curr.className += ' active-article'
  curr.style.boxShadow = '0px 10px 10px 0px rgba(0, 0, 0, 0.26)'
  handleMouseMove = (e) => swiping(initalX, e.pageX);
  curr.addEventListener('mousemove', handleMouseMove)
}

function handleTouchStart(e) {
  if (animating) {
    animating = false;
    return;
  }
  animating = true;
  let initalX = e.touches[0].clientX;
  curr.style.transition = '0'
  curr.className += ' active'
  handleTouchMove = (e) => swiping(initalX, e.touches[0].clientX);
  curr.addEventListener('touchstart', handleTouchMove)
}

function swiping(initalX, x) {
  if (!animating) {
    return;
  }
  deltaX = x - initalX;
  let deg = deltaX / 10;
  let opacity = Math.min(Math.abs(deg) / 45, .5);
  matt.style.backgroundColor = deg > 0 ? '#37bfa7' : '#f44336';
  mattText.textContent = deg > 0 ? 'check' : 'close';
  matt.style.opacity = opacity;
  curr.style.transform = `translateX(${deltaX}px) rotate(${deg}deg)`
}

function handleEnd(event) {
  if (!animating) {
    deltaX = 0;
    return;
  }
  animating = false;
  curr.className = 'article'
  curr.removeEventListener('touchmove', handleTouchMove)
  curr.removeEventListener('mousemove', handleMouseMove)
  curr.style.transition = '0.5s'
  matt.style.opacity = 0;
  curr.style.transform = `translateX(0px) rotate(0deg)`
  setTimeout(() => {
    curr.style.transition = '0s';
  }, 0.5)
  if (Math.abs(deltaX) > swipeThreshold) {
    sumbit(deltaX > 0)
  }
  deltaX = 0;
}

function sumbit(yes) {
  if (articleManager.getSelectedCount() >= maxCount) {
    document.querySelector('.articles').style.display = 'none';
    document.querySelector('.limit-msg').style.display = 'block';
    return;
  }
  if (yes) {
    articleManager.addSelected(curr.dataset.id)
    let n = articleManager.getSelectedCount()
    counter.textContent = `${n} / ${maxCount}`
  }
  curr.parentNode.removeChild(curr);
  getCurrent()
}

function createArticles() {
  let container = document.querySelector('.articles')
  let added = false;
  for (let row of articleManager.nextBatch()) {
    let article = createArticle(row);
    article.dataset.id = row.id;
    container.appendChild(article)
    added = true;
  }
  if (added) {
    getCurrent()
  }
  createList(articleManager.getSelected())
  let n = articleManager.getSelectedCount()
  counter.textContent = `${n} / ${maxCount}`
}

function createArticle(row) {
  let article = createElement('article', 'article')

  let matt = createElement('div', 'article-matt');
  matt.appendChild(createElement('span', 'material-icons'))
  article.appendChild(matt)

  let image = createElement('div', 'article-image');
  image.style.backgroundImage = `url("${row.img}")`
  article.appendChild(image)

  let info = createElement('div', 'article-info');
  info.appendChild(createElement('h2', 'article-title', row.title))
  info.appendChild(createElement('p', 'article-text', row.summary))

  article.appendChild(info);
  article.appendChild(createButtons());
  return article;
}

function createButtons() {
  let buttons = createElement('div', 'buttons')
  let options = ['close', 'check'];
  for (let op of options) {
    let btn = createElement('button', 'btn btn-' + op)
    btn.appendChild(createElement('span', 'material-icons', op))
    btn.onclick = () => {
      sumbit(op === 'check')
    }
    buttons.appendChild(btn)
  }
  return buttons;
}

function createElement(type, className, textContent) {
  let item = document.createElement(type);
  item.className = className;
  if (textContent !== null) {
    item.textContent = textContent;
  }
  return item
}

function createList(selected) {
  pickList.innerHTML = ''
  console.log(selected)
  for (let item of selected) {
    let liItem = createElement('li', 'my-picks-list-item')
    let a = createElement('a', 'list-item-link')
    a.href = item.link;

    let img = createElement('div', 'list-item-img')
    img.style.backgroundImage = `url("${item.img}")`
    a.appendChild(img)

    let info = createElement('div', 'list-item-info')
    info.appendChild(createElement('h3', 'list-item-title', item.title))

    let p = createElement('div', 'list-item-text');

    p.appendChild(createElement('span', 'list-item-text-topic', item.topic.replace(/-/g, ' ')))
    info.appendChild(p)


    a.appendChild(info)
    a.target = "_blank";
    liItem.appendChild(a)

    let contain = createElement('div', 'del-btn-wrapper')
    let deleteBtn = createElement('span', 'material-icons delbtn', 'close');
    deleteBtn.onclick = () => {
      articleManager.removeSelected(item.id)
      createList(articleManager.getSelected())
      counter.textContent = `${articleManager.getSelectedCount()} / ${maxCount}`
    }
    contain.appendChild(deleteBtn)
    liItem.appendChild(contain)
    pickList.appendChild(liItem);
  }
}


const libAdd = document.getElementById('lib-add');
const libBrowse = document.getElementById('lib-browse');

libBrowse.onclick = function(e) {
  createList(articleManager.getSelected())
  libAdd.className = 'header-option'
  libBrowse.className += ' active'
  document.querySelector('.my-picks').style.display = 'block';
  document.querySelector('.articles').style.display = 'none';
  document.querySelector('.limit-msg').style.display = 'none';
}

libAdd.onclick = function(e) {
  libBrowse.className = 'header-option'
  libAdd.className += ' active'
  document.querySelector('.my-picks').style.display = 'none';

  if (articleManager.getSelectedCount() >= maxCount) {
    document.querySelector('.limit-msg').style.display = 'block';
  } else {
    document.querySelector('.articles').style.display = 'block';
  }
}


window.addEventListener('mouseup', handleEnd)
window.addEventListener('touchstop', handleEnd)
articleManager.load(createArticles)