var canvas = document.getElementById("canvas");
// 获取二维上下文
var context = canvas.getContext("2d");
var lineWidth = 2;
var begin = false;

//设置画板宽高
autoSetCanvasSize(canvas);

//监听用户
listenToUser(canvas);

//设置橡皮擦和画笔按钮切换
// 声明一个叫eraserEnabled且为假的变量
var eraserEnabled = false;
eraser.onclick = function () {
  //当橡皮擦按钮被点击时eraserEnabled变为真，class为eraser变为active状态，pen被移除active状态
  eraserEnabled = true;
  eraser.classList.add("active");
  pen.classList.remove("active");
};
pen.onclick = function () {
  //当画笔按钮被点击时eraserEnabled变为假，class为pen变为active状态，eraser被移除active状态
  eraserEnabled = false;
  pen.classList.add("active");
  eraser.classList.remove("active");
};

red.onclick = function () {
  context.strokeStyle = "red";
  context.fillStyle = "red";
  red.classList.add("active");
  green.classList.remove("active");
  blue.classList.remove("active");
  yellow.classList.remove("active");
  black.classList.remove("active");
  white.classList.remove("active");
};
green.onclick = function () {
  context.strokeStyle = "green";
  context.fillStyle = "green";
  green.classList.add("active");
  red.classList.remove("active");
  blue.classList.remove("active");
  yellow.classList.remove("active");
  black.classList.remove("active");
  white.classList.remove("active");
};
blue.onclick = function () {
  context.strokeStyle = "blue";
  context.fillStyle = "blue";
  blue.classList.add("active");
  green.classList.remove("active");
  red.classList.remove("active");
  yellow.classList.remove("active");
  black.classList.remove("active");
  white.classList.remove("active");
};
yellow.onclick = function () {
  context.strokeStyle = "yellow";
  context.fillStyle = "yellow";
  blue.classList.remove("active");
  green.classList.remove("active");
  red.classList.remove("active");
  yellow.classList.add("active");
  black.classList.remove("active");
  white.classList.remove("active");
};
black.onclick = function () {
  context.strokeStyle = "black";
  context.fillStyle = "black";
  blue.classList.remove("active");
  green.classList.remove("active");
  red.classList.remove("active");
  yellow.classList.remove("active");
  black.classList.add("active");
  white.classList.remove("active");
};
white.onclick = function () {
  context.strokeStyle = "white";
  context.fillStyle = "white";
  blue.classList.remove("active");
  green.classList.remove("active");
  red.classList.remove("active");
  yellow.classList.remove("active");
  black.classList.remove("active");
  white.classList.add("active");
};

thin.onclick = function () {
  lineWidth = 2;
  thin.classList.add("active");
  thinner.classList.remove("active");
  middle.classList.remove("active");
  thick.classList.remove("active");
  mostthick.classList.remove("active");
};
thinner.onclick = function () {
  lineWidth = 4;
  thin.classList.remove("active");
  thinner.classList.add("active");
  middle.classList.remove("active");
  thick.classList.remove("active");
  mostthick.classList.remove("active");
};

middle.onclick = function () {
  lineWidth = 6;
  thin.classList.remove("active");
  thinner.classList.remove("active");
  middle.classList.add("active");
  thick.classList.remove("active");
  mostthick.classList.remove("active");
};
thick.onclick = function () {
  lineWidth = 8;
  thin.classList.remove("active");
  thinner.classList.remove("active");
  middle.classList.remove("active");
  thick.classList.add("active");
  mostthick.classList.remove("active");
};
mostthick.onclick = function () {
  lineWidth = 10;
  thin.classList.remove("active");
  thinner.classList.remove("active");
  middle.classList.remove("active");
  thick.classList.remove("active");
  mostthick.classList.add("active");
};

clear.onclick = function () {
  context.clearRect(0, 0, canvas.width, canvas.height);
};

download.onclick = function () {
  var url = canvas.toDataURL("image/png");
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.href = url;
  a.download = "我的画";
  a.target = "_blank";
  a.click();
};
/****工具函数*****/
function autoSetCanvasSize(canvas) {
  setCanvasSize();

  window.onresize = function () {
    setCanvasSize();
    // 监听用户是否调整了窗口大小，如果调整了，重新让画板宽高等于窗口宽高
  };

  function setCanvasSize() {
    var pageWidth = document.documentElement.clientWidth;
    var pageHeight = document.documentElement.clientHeight;
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    // 让画板宽高等于窗口宽高
    console.log(canvas)
  }
}

function listenToUser(canvas) {
  var using = false;
  var lastPoint = { x: undefined, y: undefined };
  // 声明一个叫上一点的hash

  //特性检查
  if (document.body.ontouchstart !== undefined) {
    //判断是否为触屏设备
    canvas.ontouchstart = function (aaa) {
      var x = aaa.touches[0].clientX; // 让xy等于鼠标在画板中的xy
      var y = aaa.touches[0].clientY;
      using = true;
      if (eraserEnabled) {
        // 如果eraserEnabled为真，即橡皮擦按钮被点击过，则执行以下循环
        context.clearRect(x - 5, y - 5, 10, 10); // 清除鼠标指针10单位的矩形区域
      } else {
        lastPoint = { x: x, y: y }; // 将触摸点的xy赋予上一点的xy里面
        drawCircle(x, y, lineWidth / 2);
      }
    };

    canvas.ontouchmove = function (aaa) {
      var x = aaa.touches[0].clientX;
      var y = aaa.touches[0].clientY;
      if (!using) {
        return;
      }
      if (eraserEnabled) {
        context.clearRect(x - 5, y - 5, 10, 10);
      } else {
        var newPoint = { x: x, y: y }; // 声明一个叫新点的hash
        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y); // 从上一点到新点画线
        drawCircle(x, y, lineWidth / 2);
        lastPoint = newPoint; // 让将新点赋值给上一点
      }
    };

    canvas.ontouchend = function (aaa) {
      using = false;
    };
  } else {
    //非触屏设备
    canvas.onmousedown = function (aaa) {
      // 当鼠标被按下时执行下面
      var x = aaa.clientX; // 让xy等于鼠标在画板中的xy
      var y = aaa.clientY;
      using = true;
      if (eraserEnabled) {
        // 如果eraserEnabled为真，即橡皮擦按钮被点击过，则执行以下循环
        context.clearRect(x - 5, y - 5, 10, 10); // 清除鼠标指针10单位的矩形区域
      } else {
        lastPoint = { x: x, y: y }; // 将鼠标指针的xy赋予上一点的xy里面
        // drawCircle(x, y, lineWidth / 2);
      }
    };

    canvas.onmousemove = function (aaa) {
      // 当鼠标移动时执行下面
      var x = aaa.clientX;
      var y = aaa.clientY;
      if (!using) {
        return;
      }
      if (eraserEnabled) {
        context.clearRect(x - 5, y - 5, 10, 10);
      } else {
        var newPoint = { x: x, y: y }; // 声明一个叫新点的hash
        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y); // 从上一点到新点画线
        // drawCircle(x, y, lineWidth / 2);
        lastPoint = newPoint; // 让将新点赋值给上一点
      }
    };

    canvas.onmouseup = function (aaa) {
      // 当鼠标松开时using为假
      using = false;
    };
  }
}

// function drawCircle(x, y, radius) {
//   context.beginPath();
//   // context.fillStyle = "black"
//   context.arc(x, y, radius, 0, Math.PI * 2);
//   context.fill();
// }
function drawLine(x1, y1, x2, y2) {
  // 画线功能
  context.lineJoin = "round";
  context.lineWidth = lineWidth;
  if(!begin){
    context.beginPath();
    begin = true
  }
  
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}