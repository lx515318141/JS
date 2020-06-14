{
  let view = {
    el: "html",
    init() {
      this.$el = $(this.el);
    },
    activeItem(li) {
      $li = $(li);
      $li.addClass("active").siblings(".active").removeClass("active");
    },
  };
  let model = {
    data: {
      lineSize: {
        finest: 1,
        finer: 2,
        fine: 4,
        thick: 6,
        morethick: 8,
        mostthick: 10,
      },
    },
  };
  let controller = {

    context: undefined,
    canvas: undefined,
    lineWidth: 1,
    begin: false,
    using: false,
    lastPoint: { x: undefined, y: undefined },
    newPoint: { x: undefined, y: undefined },
    penOrEraser: pen,
    status: undefined,
    device: undefined,
    init(view, model) {
      this.view = view;
      this.view.init();
      this.model = model;
      // 最初我使用的是下面的原生js的方法获取canvas，但是后来想试试通过使用jquery来实现，于是改为了现在用的这种方法。
      this.canvas = document.getElementById("canvas");
      this.context = this.canvas.getContext("2d");
      // 但是因为getContext是dom方法，无法用jquery对象直接调用，经过查找博客等，找到解决办法
      // 只需要将 canvas.getContext("2d") 改为 canvas[0].getContext('2d') 就可以了
      //   this.canvas = this.view.$el.find("#canvas");
      //   this.context = this.canvas[0].getContext('2d');
      this.setCanvasSize();
      // this.listenToUser(this.canvas);
      this.bindEvents();
    },
    bindEvents() {
      $(window).on("resize", () => {
        this.setCanvasSize();
      });
      this.view.$el.find(".penAndEraser").on("click", "svg", (e) => {
        this.penOrEraser = e.currentTarget.id;
      });
      this.view.$el.find("canvas").on("mousedown", (e) => {
        // 将状态改为开始
        this.status = 'begin';
        // 设备改为电脑
        this.device = 'computer';
        let x = e.clientX;
        let y = e.clientY;
        this.using = true;
        // 如果eraserEnabled为eraser，即橡皮擦按钮被点击过，则执行以下循环
        if (this.eraserEnabled === "eraser") {
          // 清除鼠标指针10单位的矩形区域
          this.context.clearRect(x - 5, y - 5, 10, 10);
        } else {
          // 将鼠标指针的xy赋予上一点的xy里面
          this.lastPoint["x"] = x;
          this.lastPoint["y"] = y;
        }
      });
      this.view.$el.find("canvas").on("mousemove", (e) => {
        // 将状态改为过程
        this.status = "process"
        let x = e.clientX;
        let y = e.clientY;
        if (!this.using) {
          return;
        }
        if (this.eraserEnabled === "eraser") {
          this.context.clearRect(x - 5, y - 5, 10, 10);
        } else {
          // 从上一点到新点画线
          this.newPoint["x"] = x;
          this.newPoint["y"] = y;
          this.drawLine(
            this.lastPoint.x,
            this.lastPoint.y,
            this.newPoint.x,
            this.newPoint.y
          );
          // 让将新点赋值给上一点
          Object.assign(this.lastPoint, this.newPoint);
        }
      });
      this.view.$el.find("canvas").on("mouseup", (e) => {
        // 当鼠标松开时using为假
        this.using = false;
        this.begin = false;
      });
      this.view.$el.find("ol").on("click", "li", (e) => {
        console.log(e.currentTarget);
        this.view.activeItem(e.currentTarget);
        let className = e.currentTarget.parentElement.getAttribute("class");
        if (className === "colors") {
          let color = e.currentTarget.id;
          this.context.strokeStyle = color;
        } else {
          let size = e.currentTarget.id;
          for (let key in this.model.data.lineSize) {
            if (size === key) {
              this.lineWidth = this.model.data.lineSize[key];
            }
          }
        }
      });
      this.view.$el.find("#clear").on("click", (e) => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      });
      this.view.$el.find("#download").on("click", (e) => {
        // var url = this.canvas.toDataURL("image/png")
        // var $a = $('<a></a>').attr({
        //     href: url,
        //     download: 'MyPainting',
        //     target: '_blank'
        // })
        // $a.appendTo('body')
        // console.log($a.click())
        // $a.click()
        var url = this.canvas.toDataURL("image/png");
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.href = url;
        a.download = "MyPainting";
        a.target = "_blank";
        a.click();
      });
      this.view.$el.find('canvas').on('touchstart', (e)=>{
        // 将状态改为开始
        this.status = 'begin';
        // 设备改为电脑
        this.device = 'computer';
        let x = e.touches[0].clientX;
        let y = e.touches[0].clientY;
        this.using = true;
        if (this.eraserEnabled === "eraser") {
          // 清除鼠标指针10单位的矩形区域
          this.context.clearRect(x - 5, y - 5, 10, 10); 
        } else {
          // 将触摸点的xy赋予上一点的xy里面
          this.lastPoint["x"] = x;
          this.lastPoint["y"] = y;
        }
      })
      this.view.$el.find('canvas').on('touchmove', (e)=>{
        let x = e.touches[0].clientX;
        let y = e.touches[0].clientY;
        if (!this.using) {
          return;
        }
        if (this.eraserEnabled === "eraser") {
          this.context.clearRect(x - 5, y - 5, 10, 10);
        } else {
            this.newPoint["x"] = x;
            this.newPoint["y"] = y;
            this.drawLine(
              this.lastPoint.x,
              this.lastPoint.y,
              this.newPoint.x,
              this.newPoint.y
            );
            // 让将新点赋值给上一点
            Object.assign(this.lastPoint, this.newPoint);
        }
      })
      this.view.$el.find('canvas').on('touchend', (e)=>{
        this.using = false;
        this.begin = false;
      })
    },
    // 让画板宽高等于窗口宽高
    setCanvasSize() {
      console.log(this.canvas.width);
      var pageWidth = $(window).width();
      var pageHeight = $(window).height();
      this.canvas.width = pageWidth;
      this.canvas.height = pageHeight;
      console.log(this.canvas.width);
    },
    getPiont(){
        if(){

        }
    },
    drawLine(x1, y1, x2, y2) {
      // 画线功能
      this.context.lineJoin = "round";
      this.context.lineWidth = this.lineWidth;
      if (!this.begin) {
        this.context.beginPath();
        this.begin = true;
      }
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
      this.context.stroke();
      this.context.closePath();
    },
  };
  controller.init(view, model);
}
