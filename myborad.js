 // 画板部分

 //  初始化js，通过id获取元素
 let canvas = document.getElementById("drawing-board");
 let ctx = canvas.getContext("2d");
 let eraser = document.getElementById("eraser");
 let brush = document.getElementById("brush");
 let reSetCanvas = document.getElementById("clear");
 let aColorBtn = document.getElementsByClassName("color-item");
 let save = document.getElementById("save");
 let undo = document.getElementById("undo");
 let range = document.getElementById("range");
 let clear = false;
 let activeColor = 'black';
 let lWidth = 4;

 autoSetSize(canvas);

 setCanvasBg('white');

 listenToUser(canvas);

 getColor();

 //  正要去服务器读取新的页面时候调用，页面刷新或关闭时进行提示
 window.onbeforeunload = function() {
     return "Reload site?"; // 重新加载此网络？
 };

 function autoSetSize(canvas) {
     canvasSetSize();

     //  当执行这个函数时，会先设置canvas的宽高
     function canvasSetSize() {
         //  将画板做成全屏的，设置canvas的宽高
         let pageWidth = document.documentElement.clientWidth;
         let pageHeight = document.documentElement.clientHeight;
         canvas.width = pageWidth;
         canvas.height = pageHeight;
     }

     //  在窗口大小改变之后，就会触发resize事件，重新设置canvas的宽高
     window.onresize = function() {
         canvasSetSize();
     }
 }

 //  设置canvas的背景
 function setCanvasBg(color) {
     ctx.fillStyle = color;
     ctx.fillRect(0, 0, canvas.width, canvas.height);
     ctx.fillStyle = "black";
 }

 function listenToUser(canvas) {
     let painting = false; //定义一个变量初始化画笔状态
     let lastPoint = { //记录画笔最后一次的位置
         x: undefined,
         y: undefined
     };

     if (document.body.ontouchstart !== undefined) {
         //  鼠标按下开始
         canvas.ontouchstart = function(e) {
             this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height); //在这里储存绘图表面
             saveData(this.firstDot);
             painting = true; //表示正在画，鼠标没松开
             let x = e.touches[0].clientX;
             let y = e.touches[0].clientY;
             lastPoint = {
                 "x": x,
                 "y": y
             };
             ctx.save();
             drawCircle(x, y, 0);
         };

         canvas.ontouchmove = function(e) {
             if (painting) {
                 let x = e.touches[0].clientX;
                 let y = e.touches[0].clientY;
                 let newPoint = {
                     "x": x,
                     "y": y
                 };
                 drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
                 lastPoint = newPoint;
             }
         };

         // 鼠标松开，绘画结束
         canvas.ontouchend = function() {
             painting = false;
         }
     } else {
         canvas.onmousedown = function(e) {
             this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height); //在这里储存绘图表面
             saveData(this.firstDot);
             painting = true;
             let x = e.clientX;
             let y = e.clientY;
             lastPoint = {
                 "x": x,
                 "y": y
             };
             ctx.save();
             drawCircle(x, y, 0);
         };
         canvas.onmousemove = function(e) {
             if (painting) {
                 let x = e.clientX;
                 let y = e.clientY;
                 let newPoint = {
                     "x": x,
                     "y": y
                 };
                 drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y, clear);
                 lastPoint = newPoint;
             }
         };

         canvas.onmouseup = function() {
             painting = false;
         };

         canvas.mouseleave = function() {
             painting = false;
         }
     }
 }


 //  画点函数
 function drawCircle(x, y, radius) {
     ctx.save();
     //  新建一条路径，生成之后，图形绘制命令被指向到路径上生成路径
     ctx.beginPath();
     //  画一个以（x，y）为圆心的以radius为半径的圆
     ctx.arc(x, y, radius, 0, Math.PI * 2);
     ctx.fill();
     if (clear) {
         ctx.clip();
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         ctx.restore();
     }
     //  闭合路径之后图形绘制命令又重新指向到上下文中
     ctx.closePath();
 }

 function drawLine(x1, y1, x2, y2) {
     //  设置线条宽度
     ctx.lineWidth = lWidth;
     //  设置线条末端样式
     ctx.lineCap = "round";
     //  设置线条与线条间接合处的样式
     ctx.lineJoin = "round";
     if (clear) {
         ctx.save();
         ctx.globalCompositeOperation = "destination-out";
         ctx.moveTo(x1, y1);
         ctx.lineTo(x2, y2);
         ctx.stroke();
         ctx.closePath();
         ctx.clip();
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         ctx.restore();
     } else {
         ctx.moveTo(x1, y1);
         ctx.lineTo(x2, y2);
         ctx.stroke();
         ctx.closePath();
     }
 }

 range.onchange = function() {
     lWidth = this.value;
 };

 eraser.onclick = function() {
     clear = true;
     this.classList.add("active");
     brush.classList.remove("active");
 };

 brush.onclick = function() {
     clear = false;
     this.classList.add("active");
     eraser.classList.remove("active");
 };
 // 实现清除屏幕
 reSetCanvas.onclick = function() {
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     setCanvasBg('white');
 };
 //下载图片
 save.onclick = function() {
     let imgUrl = canvas.toDataURL("image/png");
     let saveA = document.createElement("a");
     document.body.appendChild(saveA);
     saveA.href = imgUrl;
     saveA.download = "zspic" + (new Date).getTime();
     saveA.target = "_blank";
     saveA.click();
 };
 // 实现改变画笔颜色功能
 function getColor() {
     for (let i = 0; i < aColorBtn.length; i++) {
         aColorBtn[i].onclick = function() {
             for (let i = 0; i < aColorBtn.length; i++) {
                 aColorBtn[i].classList.remove("active");
                 this.classList.add("active");
                 activeColor = this.style.backgroundColor;
                 ctx.fillStyle = activeColor;
                 ctx.strokeStyle = activeColor;
             }
         }
     }
 }

 let historyDeta = [];

 function saveData(data) {
     (historyDeta.length === 10) && (historyDeta.shift()); // 上限为储存10步，太多了怕挂掉
     historyDeta.push(data);
 }

 undo.onclick = function() {
     if (historyDeta.length < 1) return false;
     ctx.putImageData(historyDeta[historyDeta.length - 1], 0, 0);
     historyDeta.pop()
 };
 // 画板部分结束








 // 初始化，通过id获取元素
 let fileInput = document.getElementById('fileInput');
 let uploadBtn = document.getElementById('uploadBtn');
 let title = document.querySelector('.title');


 function renderIframe(url) {
     let iframe = document.createElement('iframe');
     iframe.setAttribute('src', url); //建立属性
     iframe.style.width = "100vw";
     iframe.style.height = "100vh";
     title.style.display = 'none';
     document.body.appendChild(iframe);
 }

 //请求API
 function renderDom(data) {
     let formdata = new FormData();
     formdata.append('_xdoc', data); //append往后面 shift往前面

     fetch('https://view.xdocin.com/xdoc', {
         method: 'post',
         body: formdata
     }).then((result) => {
         console.log(result);
         renderIframe(result.url)
     })
 }

 //监听上传按钮--通过点击上传按钮触发文件上传按钮
 uploadBtn.addEventListener('click', () => {
     fileInput.click();
 })

 //监听上传文件的变化
 fileInput.addEventListener('change', (event) => {
     let file = event.target.files[0]; //只取第一个双击的文件
     // console.log(file);
     let reader = new FileReader(); //实例化filereader，读取文件
     reader.readAsDataURL(file); //以dataurl的方式读取文件
     reader.onload = (event) => {
         let data = event.target.result;
         renderDom(data);
         // console.log(data);
     }
 });