// 1.初始化数据
var hashA = init();
var keys = hashA["keys"];
var hash = hashA["hash"];
// 2.生成键盘
generateKeyboard(keys, hash);
// 3.监听键盘
listenToUser(hash);
//下面是工具函数
function init() {
  var keys = {
    0: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    1: ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    2: ["z", "x", "c", "v", "b", "n", "m"],
    length: 3,
  };
  var hash = {
    q: "www.qq.com",
    w: "weibo.com",
    e: "ele.me",
    r: "www.renren.com",
    t: "tianya.cn",
    y: "www.youku.com",
    u: "uc.cn",
    i: "iqiyi.com",
    o: "opera.com",
    a: "acfun.cn",
    s: "souhu.com",
    z: "zhihu.com",
    b: "baidu.com",
  };
  // 取出locaStorage中的zzz对应的hash
  var hashInLocalStorage = getFromLocalStorage("zzz");
  // 如果hashInLocalStorage存在则执行下面的
  if (hashInLocalStorage) {
    hash = hashInLocalStorage;
  }
  return {
    keys: keys,
    hash: hash,
  };
}
function getFromLocalStorage(name) {
  return JSON.parse(localStorage.getItem(name) || "null");
}
function generateKeyboard(keys, hash) {
  // 遍历keys，生成三个div，在div里生成键盘，键盘内生成span，button，img
  for (var index = 0; index < keys["length"]; index = index + 1) {
    var div1 = tag("div", { className: "row" });
    keyboard.appendChild(div1);
    var row = keys[index];
    for (var index2 = 0; index2 < row["length"]; index2 = index2 + 1) {
      var span = tag("span", { textContent: row[index2], className: "text" });
      var button1 = createButton(row[index2]);
      var img1 = createIamge(hash[row[index2]]);
      var kbd1 = tag("kbd", { className: "key" });
      div1.appendChild(kbd1);
      kbd1.appendChild(span);
      kbd1.appendChild(img1);
      kbd1.appendChild(button1);
    }
  }
}
// 声明一个函数tag(创建一个标签，给他一个hash)
function tag(tagName, attributes) {
  // 先根据tagName创建一个标签(如div)
  var element = document.createElement(tagName);
  // 遍历attributes，key为className,id,textContent
  for (var key in attributes) {
    // 将attributes中的value赋值给element
    element[key] = attributes[key];
  }
  // 返回element
  return element;
}
// 创建按钮
function createButton(id) {
  // 钮的文本为E，id为传进来的字母
  var button1 = tag("button", { textContent: "E", id: id });
  // 监听按钮的点击事件，获取按钮的id，并获取输入的网址，将其存入hash中，以id为key的，网址为value
  // 再将hash存入localStorage
  button1.onclick = function (skr) {
    var button2 = skr.target;
    let img2 = button2.previousSibling;
    var key = button2.id;
    var url = prompt("请输入网址");
    hash[key] = url;
    localStorage.setItem("zzz", JSON.stringify(hash));
    img2.src = "http://" + url + "/favicon.ico";
    img2.onerror = function (e) {
        e.target.src = "//i.loli.net/2019/10/14/McmNCXrzpIEKS2F.png";
      };
  };
  return button1;
}
// 获取icon
function createIamge(domain) {
  var img1 = tag("img");
  // 如果键盘字母对于与hash中的value为真值则获取对应icon，否则使用小蓝点
  if (domain) {
    img1.src = "http://" + domain + "/favicon.ico";
  } else {
    img1.src = "//i.loli.net/2019/10/14/McmNCXrzpIEKS2F.png";
  }
  // 若获取图片出错，也使用小蓝点
  img1.onerror = function (e) {
    e.target.src = "//i.loli.net/2019/10/14/McmNCXrzpIEKS2F.png";
  };
  return img1;
}
function listenToUser(hash) {
  document.onkeypress = function (skr) {
    var key = skr.key;
    var website = hash[key];
    if(website){
        window.open("http://" + website, "_blank");
    }
    
  };
}
