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
      this.bindEvents();
    },
    bindEvents() {
      $(window).on("resize", () => {
        this.setCanvasSize();
      });
      this.view.$el.find(".penAndEraser").on("click", "svg", (e) => {
        this.penOrEraser = e.currentTarget.id;
        console.log(this.penOrEraser)
        this.view.activeItem(e.currentTarget)
      });
      this.view.$el.find("canvas").on("mousedown", (e) => {
        // 将状态改为开始
        this.status = 'begin';
        // 设备改为电脑
        this.device = 'computer';
        this.listenToUser(e)
      });
      this.view.$el.find("canvas").on("mousemove", (e) => {
        // 将状态改为过程
        if(this.status === 'begin'){
          this.status = "process"
        }
        if(this.status === 'process'){
          this.listenToUser(e)
        }
      });
      this.view.$el.find("canvas").on("mouseup", (e) => {
        this.status = 'stop';
        this.listenToUser(e)
        // 当鼠标松开时using为假
      });
      this.view.$el.find("ol").on("click", "li", (e) => {
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
        this.device = 'phone';
        this.listenToUser(e)
      })
      this.view.$el.find('canvas').on('touchmove', (e)=>{
        this.status = "process"
        this.listenToUser(e)
      })
      this.view.$el.find('canvas').on('touchend', (e)=>{
        this.status = 'stop';
      })
    },
    // 让画板宽高等于窗口宽高
    setCanvasSize() {
      var pageWidth = $(window).width();
      var pageHeight = $(window).height();
      this.canvas.width = pageWidth;
      this.canvas.height = pageHeight;
    },
    listenToUser(e){
        // 判断是否是stop状态，即鼠标抬起后的状态
        if(this.status === 'stop'){
          this.begin = false;
          this.status = undefined
          return
        }
        let x 
        let y
        // 判断设备及状态，只有是开水或中间状态时才获取坐标，且电脑和手机获取坐标的方式不同
        if(this.device === 'computer' && (this.status === 'begin' || this.status === 'process')){
          x = e.clientX;
          y = e.clientY;
        }else if(this.device === 'phone' && (this.status === 'begin' || this.status === 'process')){
          x = e.touches[0].clientX;
          y = e.touches[0].clientY;
        }
        // 判断橡皮擦是否激活，如果激活清除鼠标指针10单位的矩形区域
        if (this.penOrEraser === "eraser") {
          this.context.clearRect(x - 5, y - 5, 10, 10); 
        } else {
          // 判断是开水状态还是中间状态，如果是开始状态，将鼠标的坐标赋给lastPoint，如果是中间状态，将坐标赋给newPoint
          // 然后用lastPoint和newPoint的坐标画线，再将newPoint的坐标赋给lastPoint
          if(this.status === 'begin'){
            this.lastPoint["x"] = x;
            this.lastPoint["y"] = y;
          }else if(this.status === 'process'){
            this.newPoint["x"] = x;
            this.newPoint["y"] = y;
            this.drawLine(
              this.lastPoint.x,
              this.lastPoint.y,
              this.newPoint.x,
              this.newPoint.y
            );
            Object.assign(this.lastPoint, this.newPoint);
          }
        }
    },
    drawLine(x1, y1, x2, y2) {
      // 画线功能
      this.context.lineJoin = "round";
      // 为了解决画出的线都是一节一节的问题，使用了lineJoin属性，可以设置两条线相交位置的样式，我使用的是round圆头
      // 但是因为执行每次执行画线都要重新开始，此属性无法生效，所以需要进行如下操作
      // 设置一个begin变量，初始值是false，进入画线函数后进行判断，如果是false，就调用beginPath，并将begin给为true
      // 后面在进入画线函数就直接画线，不需要beginPath了，在鼠标抬起时再将begin改为false。
      if (!this.begin) {
        this.context.beginPath();
        this.begin = true;
      }
      this.context.lineWidth = this.lineWidth;
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
      this.context.stroke();
      this.context.closePath();
    },
  };
  controller.init(view, model);
}
