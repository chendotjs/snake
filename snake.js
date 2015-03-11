/**
 * author:chen yaqi
 * email:chendotjs@gmail.com
 *
 */
var greedySnake=function(){

	/**
	 * 自己封装简单的队列
	 * 在队列上实现的操作：
	  	empty
		size
		front
		back
		push_back
		pop_front
		at
		newQueueWithHeadAndTail
	 */
	var myQueue=function(){
		'use strict'
		this.queue=[];
		this.qsize=0;
	}
	myQueue.prototype.push_back=function(obj){
		if(this.queue.length>this.qsize)
			this.queue[this.qsize++]=obj;
		else{
			this.queue.push(obj);
			this.qsize++;
		}
		
	}
	myQueue.prototype.pop_front=function(){
		if(this.qsize>=1){
			var front=this.queue[0];
			for(var i=1;i<this.queue.length;i++){
				this.queue[i-1]=this.queue[i];
			}
			this.qsize--;
			return front;
		}
	}
	myQueue.prototype.front=function(){
		return this.queue[0];
	}
	myQueue.prototype.back=function(){
		return this.queue[this.qsize-1];
	}
	myQueue.prototype.size=function(){
		return this.qsize;
	}
	myQueue.prototype.at=function(index){
		if(index<0||index>=this.qsize) return;
		return this.queue[index];
	}
	//返回一个新的queue，原queue的元素加入头尾
	//[A...B]==>[head,A...B,tail]
	myQueue.prototype.newQueueWithHeadAndTail=function(head,tail){
		var h=head;
		var t=tail;
		var _this=this;
		var	newQueue=new myQueue();
		newQueue.push_back(head);
		for(var i=0;i<_this.qsize;i++){
			newQueue.push_back(_this.queue[i]);
		}
		newQueue.push_back(tail);
		return newQueue;
	}
	myQueue.prototype.print=function(){
		var tmp=[]
		var _this=this;
		for(var i=0;i<this.qsize;i++){
			tmp.push(_this.at(i))
		}
		console.log(tmp)
	}

	/***********************************以上仅仅是辅助的数据结构*************************************/
	var container;//canvas的DOM元素
	var width,height;//canvas的宽度和高度
	var context;//canvas的context对象
	var nextDirection=new myQueue();nextDirection.push_back('right');//初始时蛇运动的方向是向右
	var pause=true;
	/**
	 *		col 
	 * 	   	__________
	 *	row| | | | | |
	 * 	   |		
	 * 	   |
	 * 	   |
	 * 
	 */
	var maxRow;//小方格的最大行数,row的范围是[0，maxRow)
	var maxCol;//小方格的最大列数,col的范围是[0，maxCol)
	var squareSize=10;//表示蛇身的每个小方格的边长

	var turningPoints=new myQueue();//蛇的转折点
	//食物被吃了么
	var isFoodEaten=true;
	//游戏速率，越小游戏越快
	var speedRate=300;
	//吃的食物的数量
	var numOfEatenFood=0;
	//结束后的回调函数
	var stop_callBack;

	//定义各个方向的代码
	var DirectionCode={
		up:1,
		down:2,
		left:3,
		right:4
	}
	/**
	 * 舞台类
	 */
	 var Stage=function(ct,f){
	 	'use strict'
		//初始化全局变量
		container=ct;
		context=container.getContext('2d');
		width=container.width=400;
		height=container.height=400;
		maxRow=height/squareSize;
		maxCol=width/squareSize;
		stop_callBack=f;
	}

	/**
	 * 蛇类，表示蛇身的小方块均为一个类似{row:0,col:1}的对象
	 * @param {[type]} head            表示蛇头的小方块
	 * @param {[type]} tail            表示蛇尾的小方块
	 */
	var Snake=function(head,tail){
		'use strict'
		this.body=[];//存放所有组成蛇身的
		var _this=this;
		this.head=head;
		this.tail=tail;

	}
	/**
	 * [run description]
	 * @param  {[type]} f [description]
	 * @return {[type]}   [description]
	 */
	 Stage.prototype.run=function(){
		this.bindListeners();//绑定监听器
		var _this=this;
		//创建蛇的实例
		this.snake=new Snake({row:0+19,col:2+16},{row:0+19,col:0+16});

		//如果蛇吃到食物之后，speedRate自乘0.8，以此实现蛇加速
		onNumOfEatenFoodChange(function(){
			_this.speedUp(_this,0.8);
		});

		this.nextFrame();

		this.st=setInterval(function(){
			if(!pause)
				_this.nextFrame();
			else{
				context.font="30px Verdana";
        		context.fillStyle="grey";
        		context.fillText("按空格键开始",120,170)
			}
		},speedRate)

	}

	Stage.prototype.nextFrame=function(){
		
		this.clear();

		this.drawFood();
		this.snake.draw();
		this.snakeEatFood();
		this.collisionDetect();
		this.snake.move();
		
		
	}

	Stage.prototype.bindListeners=function(){
		var _this=this;
		document.addEventListener('keydown',function(e){
			var keyCode= window.event?e.keyCode:e.which;
			switch(keyCode){
				case 38://上方向键
				e.preventDefault();
				if(nextDirection.back()!='down' && nextDirection.back()!='up'){
					var tBack=turningPoints.back();
					if(tBack!=undefined &&_this.snake.head.row==tBack.row&&_this.snake.head.col==tBack.col) break;
					nextDirection.push_back('up')
					turningPoints.push_back({
						row:_this.snake.head.row,
						col:_this.snake.head.col
					})
				}
				break;

				case 39://右方向键
				e.preventDefault();
				if(nextDirection.back()!='right' && nextDirection.back()!='left'){
					var tBack=turningPoints.back();
					if(tBack!=undefined &&_this.snake.head.row==tBack.row&&_this.snake.head.col==tBack.col) break;
					nextDirection.push_back('right')
					turningPoints.push_back({
						row:_this.snake.head.row,
						col:_this.snake.head.col
					})

				}
				break;

                case 37://左方向键
                e.preventDefault();
                if(nextDirection.back()!='right' && nextDirection.back()!='left'){
                	var tBack=turningPoints.back();
					if(tBack!=undefined &&_this.snake.head.row==tBack.row&&_this.snake.head.col==tBack.col) break;
					nextDirection.push_back('left')
					turningPoints.push_back({
						row:_this.snake.head.row,
						col:_this.snake.head.col
					})

				}
				break;

                case 40://下方向键
                e.preventDefault();
                if(nextDirection.back()!='down' && nextDirection.back()!='up'){
                	var tBack=turningPoints.back();
					if(tBack!=undefined && _this.snake.head.row==tBack.row&&_this.snake.head.col==tBack.col) break;
					nextDirection.push_back('down')
					turningPoints.push_back({
						row:_this.snake.head.row,
						col:_this.snake.head.col
					})

				}
				break;

                case 32:pause=!pause;//空格键控制暂停
            }
            return false;
        },false);
	}
	/**
	 * 处理蛇头触及墙壁以及蛇吃到自己
	 * @return {[type]} [description]
	 */
	Stage.prototype.collisionDetect=function(){
		//蛇头触及墙壁
		if(this.snake.head.row < 0 || this.snake.head.row >= maxRow ||
			this.snake.head.col < 0 || this.snake.head.col >= maxCol){
			this.stop(stop_callBack);
		}
		//蛇咬到自己
		var headCount=0;//body里有几个元素和head位置重合，若大于1，则蛇咬到自己
		for(var i=0;i<this.snake.body.length;i++){
			if(this.snake.body[i].row==this.snake.head.row && 
				this.snake.body[i].col==this.snake.head.col)
				headCount++;
		}
		if(headCount>1){
			this.stop(stop_callBack);
		}


	}
	//生成随机的食物坐标
	Stage.prototype.generateFood=function(){
		var x=Math.floor(Math.random()*maxCol);
		var y=Math.floor(Math.random()*maxRow);
		this.food={row:x,col:y}
	}
	
	Stage.prototype.drawFood=function(){
		var _this=this;
		//判断食物生成在蛇身上
		var isFoodInSnake=function(){
			for(var i=0;i<_this.snake.body.length;i++){
				if(_this.food.row==_this.snake.body.row && 
					_this.food.col==_this.snake.body.col)
					return true;
			}
			return false;
		}

		if(isFoodEaten){
			 do{
			 	this.generateFood();
			 }while(isFoodInSnake())
		}
		context.fillStyle="red";
		this.snake.drawOneSquare(this.food)
	}
	/**
	 * 判断蛇是否吃到食物
	 * @return {[type]} [description]
	 */
	Stage.prototype.snakeEatFood=function(){
		//吃到食物之后，蛇尾增加一节
		if(this.snake.head.row==this.food.row && this.snake.head.col==this.food.col){
			isFoodEaten=true;
			numOfEatenFood++;
			switch(DirectionCode[nextDirection.front()]){
				//上
				case 1: this.snake.tail.row++;break;
				//下
				case 2: this.snake.tail.row--;break;
				//左
				case 3: this.snake.tail.col++;break;
				//右
				case 4: this.snake.tail.col--;break;

			}
			this.snake.drawOneSquare(this.snake.tail);
		}else 
			isFoodEaten=false;//没吃到食物


	}

	//游戏的加速
	Stage.prototype.speedUp=function(self,mul){
		speedRate*=mul;
		clearInterval(self.st);
		self.st=setInterval(function(){
			if(!pause)
				self.nextFrame();
		},speedRate)
	}
	Stage.prototype.clear=function(){
		context.clearRect(0,0,width,height);
	}

	/**
	 * 处理游戏结束:clearInterval
	 * @param  {[type]} f 回调函数
	 * @return {[type]}   [description]
	 */
	 Stage.prototype.stop=function(f){
		//处理结束的代码
		context.font="30px Verdana";
        // 创建渐变
        var gradient=context.createLinearGradient(0,0,width,0);
        gradient.addColorStop("0","magenta");
        gradient.addColorStop("0.5","blue");
        gradient.addColorStop("1.0","red");
        // 用渐变填色
        context.fillStyle=gradient;
        context.fillText("你的分数:"+numOfEatenFood*10,120,170)
        context.fillText("游戏结束",120,200);

		clearInterval(this.st);
		f();//回调函数
	}
	/**
	 * 绘制蛇身
	 * @return {[type]} [description]
	 */
	Snake.prototype.draw=function(){
		var _this=this;
		this.buildBody();
		context.fillStyle="black";
		this.body.forEach(function(element){
			_this.drawOneSquare(element);
		})
	}
	/**
	 * 根据turingPoints和head、tail确定Snake.body的坐标
	 * @return {[type]} [description]
	 */
	Snake.prototype.buildBody=function(){
		//关键点的队列:[tail,1stTuring,2ndTuring...head]
		var keyPoints=turningPoints.newQueueWithHeadAndTail({row:this.tail.row,
			col:this.tail.col},{row:this.head.row,col:this.head.col});
		this.body=[];//清空body
		//关键点全部加入到body里面
		for(var i=0;i<keyPoints.size();i++){
			this.body.push({row:keyPoints.at(i).row,col:keyPoints.at(i).col});
		}
		//去掉body数组里重复的元素的函数
		function uniquePosArray(arr) {
    		var result = [], hash = {};
    		for (var i = 0, elem; (elem = arr[i]) != null; i++) {
    			var index='_i'+elem.row+'_'+elem.col
    		    if (!hash[index]) {
    		        result.push(elem);
    		        hash[index] = true;
    		    }
    		}
    		return result;  
		}
		//因为在头部和转折点会重合，导致蛇的身子有重复元素
		this.body=uniquePosArray(this.body)
		
		//根据关键点队列计算出完整的蛇身方块坐标
		//计算begin和end之间所有点并加入body，不包括begin和end本身
		var calcPoints = function(begin,end){
			if(begin.row==end.row){
				var small,big;
				(begin.col > end.col)?(small=end.col,big=begin.col):(big=end.col,small=begin.col);
				for(var i=small+1;i<=big-1;i++){
					this.body.push({row:begin.row,col:i})
				} 
			}else if(begin.col==end.col){
				var small,big;
				(begin.row > end.row)?(small=end.row,big=begin.row):(big=end.row,small=begin.row);
				for(var i=small+1;i<=big-1;i++){
					this.body.push({col:begin.col,row:i})
				} 
			}
		}
		
		for(var i=0;i<keyPoints.size()-1;i++){
			calcPoints.call(this,keyPoints.at(i),keyPoints.at(i+1));
		}
		
	}
	/**
	 * 当蛇尾巴和第一个转折点重合时，nextDirection和turningPoints都要做pop_front操作
	 * @return {[type]} [description]
	 */
	Snake.prototype.tailMeetsTurningPoint=function(){
		var tail=this.tail;
		var firstTurningPoint=turningPoints.front();

		if(firstTurningPoint==undefined || firstTurningPoint ==null) return;
		if(tail.row==firstTurningPoint.row && tail.col==firstTurningPoint.col){
			nextDirection.pop_front();
			turningPoints.pop_front();
		}
	}
	Snake.prototype.drawOneSquare=function(square){
		drawRect(square.col*10,square.row*10,squareSize,squareSize)
	}
	/**
	 * 蛇的坐标移动
	 * @return {[type]} [description]
	 */
	Snake.prototype.move=function(){
		var headDirection=nextDirection.back();//头前进的方向
		var tailDirection=nextDirection.front();//尾前进的方向
		//改变头和尾方向的函数，pos为head或者tail对象
		var changePos=function(direction,pos){
			switch(DirectionCode[direction]){
				//上
				case 1: pos.row--;break;
				//下
				case 2: pos.row++;break;
				//左
				case 3: pos.col--;break;
				//右
				case 4: pos.col++;break;
			}
		}
		changePos(headDirection,this.head);
		changePos(tailDirection,this.tail);
		//检测尾部是否和队列里第一个转折点重合
		this.tailMeetsTurningPoint();
	}
	
	//全局函数，画矩形
	var drawRect=function(x,y,w,h){
		context.beginPath();
		context.rect(x,y,w,h);
		context.fill();
		context.closePath();
	}
	/**
	 * 监听吃到食物数量的变化，若变化，则调用callback
	 * @return {[type]} [description]
	 */
	var onNumOfEatenFoodChange=function(callback){
		var previousNum=0;
		setInterval(function(){
			if(numOfEatenFood>previousNum){
				callback();
				previousNum=numOfEatenFood;
			}
		},10)
	}

	return Stage;
}();

