(function(){

	var KEY_CODE = {
		UP: "38",
		DOWN: "40",
		LEFT: "37",
		RIGHT: "39",
		ENTER: "13",
		SPACE: "32"
	}

	function Matrix(containerId, rows, cols) {
		this.matrix = $(containerId);
		this.rows = rows;
		this.cols = cols;
		this.fruit = ["grape", "banana", "watermellon", "apple"];

		this.randomCellIndex = function() {
			return Math.floor(Math.random()*20 +1);
		}

		this.create = function() {
			var elementsToAppend = "",
					i,
					len;
			for (i = 0, len = this.rows*this.cols; i < len; i++) {
				elementsToAppend += "<div class='cell'></div>";
			}
			this.matrix.append($(elementsToAppend));
		}

		this.getIndex = function(row, col) {
				return (row - 1)*20 + col - 1;
		}

		this.setCell = function(row, col, color, val) {
			var div = this.matrix.children().eq(this.getIndex(row, col));
			(val) ? div.addClass(color) : div.removeClass(color);
		}

		this.createFruit = function() {
			this.fruitType = this.fruit[Math.floor(Math.random()*4)];
			this.indexRowFruit = this.randomCellIndex();
			this.indexColFruit = this.randomCellIndex();
			this.fruitIndex = this.getIndex(this.indexRowFruit, this.indexColFruit);
			this.matrix.children().eq(this.fruitIndex).addClass(this.fruitType);
		}

		this.removeFruit = function() {
			this.matrix.children().eq(this.fruitIndex).removeClass(this.fruitType);
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
			var i,
					len;

			for (i = 0, len = this.body.length; i < len; i++) {
				this.matrix.setCell(this.body[i].y, this.body[i].x, this.color, true);
			}
			this.matrix.setCell(this.body[0].y, this.body[0].x, "head", true);
		}

		this.move = function() {
			this.body.unshift({y: this.body[0].y, x: this.body[0].x});

			if (this.course == "right" && this.alive) {
				this.body[0].x++;
			} else if (this.course == "left" && this.alive) {
				this.body[0].x--;
			} else if (this.course == "down" && this.alive) {
				this.body[0].y++;
			} else if (this.course == "up" && this.alive) {
				this.body[0].y--;
			}

			/*Check on eat itself*/
			for (var i = 1, len = this.body.length; i < len; i++ ) {
				if ((this.body[i].x == this.body[0].x) &&  (this.body[i].y == this.body[0].y)) {
					this.alive = false;
					$("#status h2").addClass("game_over").html("Ай-яй-яй змейка сама себя укусила...");
					this.matrix.setCell(this.body[1].y, this.body[1].x, "head", false);
					this.matrix.setCell(this.body[1].y, this.body[1].x, "headCried", true);
					return false;
				}
			}

			var deleteCell = this.body.pop();
			this.matrix.setCell(deleteCell.y, deleteCell.x, this.color, false);
			this.matrix.setCell(this.body[0].y, this.body[0].x, this.color, true);
			/*Drawing the head of snake*/
			this.matrix.setCell(this.body[0].y, this.body[0].x, "head", true);
			this.matrix.setCell(this.body[1].y, this.body[1].x, "head", false);
		}
	}

	$(window).load(function() {
		var start,
				ready = false,
				matrix = null,
				snake = null,
				score = 0,
				level = 1,
				speed = 200,
				recordsJson = "";

		var results = $(".results"),
				btnRecord = $(".btn-record"),
				records = $(".records"),
				resetGame = $("#resetGame"),
				startGame = $("#startGame"),
				playground = null,
				boxPlayground = $("#play_ground"),
				boxScore = $("#score"),
				boxLevel = $("#level"),
				boxPlayer = $("#player"),
				boxStatus = $("#status h2"),
				player_menu = $("#player_menu");

		$.get("data/records.json", "data=content" , function(data) {
			recordsJson = JSON.parse(data);
			showRecords(recordsJson);
		},"html");

		function showRecords(recordsJson) {
			var jsonData = recordsJson;
			jsonData.sort(function(num1, num2){
				var num1 = parseInt(num1["score"]);
				var num2 = parseInt(num2["score"]);
				if(num1 > num2) {
					return -1
				} else if (num1 < num2) {
					return 1
				} else {
					return 0
				}
			});
			results.empty();
			var textToAppend = "<ul>";
			for (var i = 0, len = jsonData.length; i < len; i++) {
				// for (var item in jsonData[i]) {
					//textToAppend += "<li>" + item + " : " + jsonData[i][item] + "</li>";
					textToAppend += "<li>" + jsonData[i]["name"] + " : " + jsonData[i]["score"] + "</li>";
				// }
			};
			textToAppend += "</ul>";
			results.append(textToAppend);
		}

		function gameplay() {
			function nextLevel(){
				score+=200;
				level+=1;
				speed-=50;
				clearInterval(start);
				start = setInterval(gameplay, speed);
				boxScore.html(score);
				boxLevel.html(level);
			}

			snake.move();

			/*Check on hit a wall*/
			if (snake.body[0].y < 1 || snake.body[0].y > 20 || snake.body[0].x < 1 || snake.body[0].x > 20) {
				snake.alive = false;
				boxStatus.addClass("game_over");
				boxStatus.html("Ай-яй-яй змейка разбилась об стенку...");
				snake.matrix.setCell(snake.body[0].y, snake.body[0].x, "head green", false);
				snake.matrix.setCell(snake.body[1].y, snake.body[1].x, "headCried", true);
			}
			/*eating fruit*/
			if ((snake.body[0].y == matrix.indexRowFruit) && (snake.body[0].x == matrix.indexColFruit)) {
				matrix.removeFruit();
				snake.body.push({x: 0, y: 0});
				matrix.createFruit();
				score+=100;
				boxScore.html(score);
			}
			if ((score != 0) && (score % 500 == 0)) {
				nextLevel();
			}
			if (!snake.alive) {
				playground.css("background-color", "red");
				clearInterval(start);

				var stringTemp = "{" + "\"name\"" + ":"+ "\"" + boxPlayer.text() + "\"," + "\"score\"" + ":"+ "\"" + boxScore.text() + "\"" + "}";
				recordsJson.push(JSON.parse(stringTemp));
				showRecords(recordsJson);
				var jsonData = JSON.stringify(recordsJson);
				// var tempObj = {
				// 	name: recordsJson
				// }
				// console.log(tempObj);

				$.post("data/add.php", {name : jsonData}, "html");

				console.log($(".records").hasClass("show"));
				if (!$(".records").hasClass("show")) {
					btnRecord.click();
				};
			}
		}

		btnRecord.click(function(){
			if (results.hasClass("show")) {
				records.animate({ left:"-300px"}, 600);
				btnRecord.css("background-image", "url('img/records.png')");
			} else {
				records.animate({ left: "0px"}, 600);
				btnRecord.css("background-image", "url('img/records_lt.png')");
			};
			results.toggleClass("show");
		});

		$("#player_menu button").click(function(){
			boxPlayer.text($("#player_menu input").val());
			$("#player_menu").addClass("hidden");
			$(".darkness").fadeOut();
			ready = true;
		});

		resetGame.click(function(){
			clearInterval(start);
			if (playground) {
				playground.remove();
				boxStatus.empty();
				boxStatus.removeClass("game_over");
			}
			startGame.removeClass("hidden");
			$(this).addClass("hidden");
			speed = 200;
			score = 0;
			level = 1;
		});

		startGame.click(function() {
			boxPlayground.append("<div id='matrix'></div>");
			playground = $("#matrix");
			$(this).addClass("hidden");
			resetGame.removeClass("hidden");

			boxScore.html(score);
			boxLevel.html(level);

			matrix = new Matrix("#matrix", 20, 20);
			matrix.create();
			matrix.createFruit();

			snake = new Snake([{x: 5, y: 5},{x: 4, y: 5},{x:3, y: 5}], "right", "green", matrix, true);
			snake.create();

			start = setInterval(gameplay, speed);
		});

		$(window).keydown(function (event) {
			var keyCode = event.keyCode;
			if (keyCode == KEY_CODE.ENTER && !player_menu.hasClass("hidden")){
				$("#player_menu button").click();
			}
			if (keyCode == KEY_CODE.SPACE && ready) {
				startGame.click();
			}
			if (keyCode == KEY_CODE.UP && snake){
				snake.course = "up";
			} else if (keyCode == KEY_CODE.LEFT && snake){
				snake.course = "left";
			} else if (keyCode == KEY_CODE.RIGHT && snake){
				snake.course = "right";
			} else if (keyCode == KEY_CODE.DOWN && snake){
				snake.course = "down";
			}
		});
	});
})();