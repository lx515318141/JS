var yyy = document.getElementById('xxx');
var context = yyy.getContext('2d');

//设置画板宽高
autoSetCanvasSize(yyy);

//监听用户鼠标
listenToMouse(yyy);

//设置橡皮擦和画笔按钮切换
var eraserEnabled = false;    // 声明一个叫eraserEnabled且为假的变量
eraser.onclick = function () {    //当橡皮擦按钮被点击时eraserEnabled变为真，class为actions变为actions x状态
    eraserEnabled = true;
    actions.className = 'actions x';
}
brush.onclick = function () {    //当画笔按钮被点击时eraserEnabled变为假，class为actions变为actions状态
    eraserEnabled = false;
    actions.className = 'actions';
}

/****工具函数*****/
function autoSetCanvasSize(canvas) {
    setCanvasSize();

    window.onresize = function () {
        setCanvasSize();
        // 监听用户是否调整了窗口大小，如果调整了，重新让画板宽高等于窗口宽高
    }

    function setCanvasSize() {
        var pageWidth = document.documentElement.clientWidth;
        var pageHeight = document.documentElement.clientHeight;
        canvas.width = pageWidth;
        canvas.height = pageHeight;
        // 让画板宽高等于窗口宽高
    }
}

function listenToMouse(canvas) {
    var using = false;
    var lastPoint = { x: undefined, y: undefined };
    // 声明一个叫上一点的hash
    canvas.onmousedown = function (aaa) {  // 当鼠标被按下时执行下面
        var x = aaa.clientX;   // 让xy等于鼠标在画板中的xy
        var y = aaa.clientY;
        using = true;
        if (eraserEnabled) {   // 如果eraserEnabled为真，即橡皮擦按钮被点击过，则执行以下循环
            context.clearRect(x - 5, y - 5, 10, 10); // 清除鼠标指针10单位的矩形区域
        } else {
            lastPoint = { "x": x, "y": y };   // 将鼠标指针的xy赋予上一点的xy里面
        }
    };

    canvas.onmousemove = function (aaa) {  // 当鼠标移动时执行下面
        var x = aaa.clientX;
        var y = aaa.clientY;
        if (!using) { return; }
        if (eraserEnabled) {
            context.clearRect(x - 5, y - 5, 10, 10);
        } else {
            var newPoint = { "x": x, "y": y };    // 声明一个叫新点的hash
            drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);    // 从上一点到新点画线
            lastPoint = newPoint;   // 让将新点赋值给上一点
        }
    };

    canvas.onmouseup = function (aaa) {    // 当鼠标松开时using为假
        using = false;
    };
}

function drawLine(x1, y1, x2, y2) { // 画线功能
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineWidth = 5;
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}
