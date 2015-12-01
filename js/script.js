(function(){

	var KEY_CODE = {
		UP: "38",
		DOWN: "40",
		LEFT: "37",
		RIGHT: "39",
		ENTER: "13"
	}

	function Matrix(containerId, rows, cols) {
		this.matrix = $(containerId);
		this.rows = rows;
		this.cols = cols;

		this.create = function () {
			for (var i = 0; i < this.rows*this.cols; i++) {
				this.matrix.append($("<div class='cell'></div>"));
			}
		}
		this.getIndex = function(row, col) {
				return (row - 1)*20 + col - 1;
		}
		this.getCell = function(row, col) {
			var obj = this.matrix.children().eq(this.getIndex(row, col));
			return obj.attr("class");
		}
		this.setCell = function(row, col, color, val) {
			var div = this.matrix.children().eq(this.getIndex(row, col));
			(val) ? div.addClass(color) : div.removeClass(color);
		}
		this.createFruit = function() {
			var fruit = ["grape", "banana", "watermellon", "apple"];
			this.fruitType = fruit[Math.floor(Math.random()*4)];
			this.indexColFruit = Math.floor(Math.random()*20 +1);
			this.indexRowFruit = Math.floor(Math.random()*20 +1);
			var index = this.getIndex(this.indexRowFruit, this.indexColFruit);
			this.matrix.children().eq(index).addClass(this.fruitType);
		}
		this.removeFruit = function() {
			var index = this.getIndex(this.indexRowFruit, this.indexColFruit);
			this.matrix.children().eq(index).removeClass(this.fruitType);
		}
	}


	function Snake (cordinates, course, color, matrix, alive) {
		this.alive = alive;
		this.body = cordinates;
		this.course = course;
		this.color = color;
		this.matrix = matrix;
		var that = this;

		this.create = function() {
			for (var i = 0; i < that.body.length; i++) {
				that.matrix.setCell(that.body[i].y, that.body[i].x, that.color, true);
			}
			that.matrix.setCell(that.body[0].y, that.body[0].x, "head", true);
		}
		this.move = function() {
			that.body.unshift({y: that.body[0].y, x: that.body[0].x});

			if (that.course == "right" && this.alive) {
				that.body[0].x++;
			} else if (that.course == "left" && this.alive) {
				that.body[0].x--;
			} else if (that.course == "down" && this.alive) {
				that.body[0].y++;
			} else if (that.course == "up" && this.alive) {
				that.body[0].y--;
			}
			/*Check on eat itself*/
			for (i = 1; i < that.body.length; i++ ) {
				if ((that.body[i].x == that.body[0].x) &&  (that.body[i].y == that.body[0].y)) {
					this.alive = false;
					$("#status h2").addClass("game_over");
					$("#status h2").html("Ай-яй-яй змейка сама себя укусила...");
					for (var i = 0; i < that.body.length; i++) {
						that.matrix.setCell(that.body[i].y, that.body[i].x, that.color, false);
					}
					that.matrix.setCell(that.body[1].y, that.body[1].x, "head", false);
					that.matrix.setCell(that.body[0].y, that.body[0].x, "headCried", true);
					return false;
				}
			}

			var deleteCell = that.body.pop();
			that.matrix.setCell(deleteCell.y, deleteCell.x, that.color, false);
			that.matrix.setCell(that.body[0].y, that.body[0].x, that.color, true);
			/*Drawing the head of snake*/
			that.matrix.setCell(that.body[0].y, that.body[0].x, "head", true);
			that.matrix.setCell(that.body[1].y, that.body[1].x, "head", false);
		}
	}

	window.onload = function() {
		var start = null;
		var score = 0;
		var level = 1;
		var speed = 200;
		var recordsJson = "";

		$(".btn-record").click(function(){

			if ($(".records").hasClass("show")) {
				$(".records").animate({ left:"-300px"}, 600);
				$(".btn-record").css("background-image", "url('img/records.png')");
			} else {

				$.get("data/records.json", "data=content" , function(data) {
					$(".results").empty();
					recordsJson = data;
					var jsonData = JSON.parse(data);
					var textToAppend = "<ul>";
					for (var i = 0, len = jsonData.length; i < len; i++) {
						for (var item in jsonData[i]) {
							textToAppend += "<li>" + item + " : " + jsonData[i][item] + "</li>";
						}
					};
					textToAppend += "</ul>";
					$(".results").append(textToAppend);
				},"html");

				$(".records").animate({ left: "0px"}, 600);
				$(".btn-record").css("background-image", "url('img/records_lt.png')");
			};
			$(".records").toggleClass("show");
		});

		$("#player_menu button").click(function(){
			$("#player").text($("#player_menu input").val());
			$("#player_menu").addClass("hidden");
			$(".darkness").fadeOut();
		});

		$("#resetGame").click(function(){
			clearInterval(start);
			if ($("#matrix")) {
				$("#matrix").remove();
				$("#status h2").empty();
				$("#status h2").removeClass("game_over");
			}
			$("#startGame").removeClass("hidden");
			$(this).addClass("hidden");
			speed = 200;
			score = 0;
			level = 1;
		});

		$("#startGame").click(function() {
			$(this).addClass("hidden");
			$("#resetGame").removeClass("hidden");

			$("#score").html(score);
			$("#level").html(level);
			$("#play_ground").append("<div id='matrix'></div>");
			var matrix = new Matrix("#matrix", 20, 20);
			matrix.create();
			matrix.createFruit();

			var snake = new Snake([{x: 5, y: 5},{x: 4, y: 5},{x:3, y: 5}], "right", "yellow", matrix, true);
			snake.create();

			start = setInterval(gameplay, speed);

			function gameplay() {
				snake.move();
				/*Check on hit a wall*/
				if (snake.body[0].y < 1 || snake.body[0].y > 20 || snake.body[0].x < 1 || snake.body[0].x > 20) {
					snake.alive = false;
					$("#status h2").addClass("game_over");
					$("#status h2").html("Ай-яй-яй змейка разбилась об стенку...");
					for (var i = 0; i < snake.body.length; i++) {
						snake.matrix.setCell(snake.body[i].y, snake.body[i].x, snake.color, false);
					}
					snake.matrix.setCell(snake.body[0].y, snake.body[0].x, "head", false);
					snake.matrix.setCell(snake.body[1].y, snake.body[1].x, "headCried", true);
				}
				/*eating fruit*/
				if ((snake.body[0].y == matrix.indexRowFruit) && (snake.body[0].x == matrix.indexColFruit)) {
					matrix.removeFruit();
					snake.body.push({x: 0, y: 0});
					matrix.createFruit();
					score+=100;
					$("#score").html(score);
				}
				function nextLevel(){
					score+=200;
					level+=1;
					speed-=50;
					clearInterval(start);
					start = setInterval(gameplay, speed);
					$("#score").html(score);
					$("#level").html(level);
				}
				if (score == 500) {
					nextLevel();
				} else if (score == 1000){
					nextLevel();
				} else if (score == 1500){
					nextLevel();
				} else if (score == 2000){
					nextLevel();
				}
				if (!snake.alive) {
					matrix.matrix.css("background-color", "red");
					clearInterval(start);
					console.log($("#player").text() + " " + $("#score").text());

					$.get("data/records.json", "data=content" , function(data) {
						recordsJson = JSON.parse(data);
						console.log(recordsJson);
						var stringTemp = "{" + "\"" + $("#player").text() + "\"" + ":"+ "\"" + $("#score").text() + "\"" + "}";

						recordsJson.push(JSON.parse(stringTemp));
						console.log(recordsJson);
						recordsJson = JSON.stringify(recordsJson);
						var tempObj = {
							name: recordsJson
						}
						console.log(tempObj);

						$.post("data/add.php", tempObj, function(){}, "html")
						.done(function(){
							var jsonData = JSON.parse(recordsJson);
							$(".results").empty();
							var textToAppend = "<ul>";
							for (var i = 0, len = jsonData.length; i < len; i++) {
								for (var item in jsonData[i]) {
									textToAppend += "<li>" + item + " : " + jsonData[i][item] + "</li>";
								}
							};
							textToAppend += "</ul>";
							$(".results").append(textToAppend);
						});
					},"html");

					if (!$(".records").hasClass("show")) {
						$(".records").animate({ left: "0px"}, 600);
						$(".btn-record").css("background-image", "url('img/records_lt.png')");
						$(".records").toggleClass("show");
					};
				}
			}

			$(window).keydown(function (event) {
				var keyCode = event.keyCode;
				if (keyCode == KEY_CODE.UP){
					snake.course = "up";
				} else if (keyCode == KEY_CODE.LEFT){
					snake.course = "left";
				} else if (keyCode == KEY_CODE.RIGHT){
					snake.course = "right";
				} else if (keyCode == KEY_CODE.DOWN){
					snake.course = "down";
				}
			});
		});
		var player_menu = $("#player_menu").hasClass("hidden");

		$(window).keydown(function (event) {
			var keyCode = event.keyCode;

			if (keyCode == KEY_CODE.ENTER && !player_menu){
				$("#player_menu button").click();
			}
		});
	}
})();