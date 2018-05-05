document.addEventListener('DOMContentLoaded', function(){

	function headerCkick(event) {

	 	let target = event.target;

	 	if (target.tagName === 'BUTTON' && target.classList.contains('toogle-info-js')) {

	 		if(target.parentNode.classList.contains('new-game-wrap')) {
	 			autoFilledForm();
	 		}
	 		let content =  target.nextElementSibling;
	 		content.style.display = (content.style.display == 'flex') ? 'none' : 'flex';

	 		return;
	 	} else if(target.tagName === 'BUTTON' && target.getAttribute('type') == 'submit') {

			if(!isEnoughskirtCardsCount()) {
				alert( "Not enought skirt cards, please checked more (minimum 3)" );
				return false;
			}

	 		let form = document.querySelector(".user-info");
	 		form.style.display = 'none';
	 		gameinfo = fullGameInfo();
	 		event.preventDefault();	
	 		createNewField(gameinfo);

	 		let main = document.querySelector(".game-wrap");
			main.addEventListener("click", cardClick);

	 		return false;
	 	}
	 	return;
	}
	function fullGameInfo() {
		let gameInfo = {
			difficult: null, 
			pictures: [],
		}
		let user = {
			firstName: null,
			lastName: null,
			eMail: null,
		}

 		let firstName = document.querySelector("#first-name").value;
 		let lastName = document.querySelector("#last-name").value;
 		let eMail = document.querySelector("#email").value;

 		user.firstName = firstName;
 		user.lastName = lastName;
 		user.eMail = eMail;

 		let string = JSON.stringify(user); 
		localStorage.setItem("user", string);

 		let picturesInputs = document.querySelectorAll("[id ^= 'card']");
 		let difficultInputs = document.querySelectorAll("[name = 'difficult']"); 

 		picturesInputs.forEach(function( elem ) {
 			if(elem.checked) {
 				let img = elem.nextElementSibling.childNodes[0];
 				let src = img.getAttribute('src');
			 	gameInfo.pictures.push(src);
 			}
		});
		difficultInputs.forEach(function( elem ) {
 			if(elem.checked) {
			 	let value = elem.getAttribute('value');
			 	gameInfo.difficult = value;
 			}
		});
		return gameInfo;
	}

	function createNewField(info) {

		let colsRows = colRowFind(info.difficult);
		let columns = colsRows.columns; 
		let rows = colsRows.rows;
		let imagesSourse = randomDistribution(columns, rows, info.pictures);
		
		let oldMain = document.querySelector("main");
		let newMain = document.createElement('main');

		newMain.setAttribute("class", "game-wrap");

		for (let i=0; i<columns; i++) {

			let newColumn = document.createElement('div'); 
			newColumn.setAttribute("class", "card-column");
			if(columns === 3) {
				newColumn.style.height = '28%';
			}

  			for (let j=0; j<rows; j++) {

  				let newRow = document.createElement('div'); 
  				newRow.setAttribute("class", "card-wrap");

  				let imageSrc = imagesSourse.shift().src;
  				let newCard = document.createElement('img');
  				newCard.setAttribute("class", "show-card");
  				newCard.setAttribute("src", "" + imageSrc);
  				newCard.setAttribute("alt", "card image");
  				newRow.appendChild(newCard);

  				let cardBack = document.createElement('img');
  				cardBack.setAttribute("class", "hide-card");
  				cardBack.setAttribute("src", "img/skirt-down.jpg");
  				cardBack.setAttribute("alt", "card skirt down");
  				newRow.appendChild(cardBack);

  				newColumn.appendChild(newRow);
  			}
  			newMain.appendChild(newColumn);
		}
		oldMain.parentNode.replaceChild(newMain, oldMain);

		return;
	}

	function colRowFind (difficult) {
		
		let res = {
			columns: 0,
			rows: 0
		}
		if(difficult === 'easy'){
			res.columns = 2;
			res.rows = 5;
		} else if(difficult === 'normal') {
			res.columns = 3;
			res.rows = 6;
		} else if(difficult === 'hard') {
			res.columns = 3; 
			res.rows = 8;
		} else {
			return new Error("invalid difficult data");
		}
		return res;
	}

	function randomDistribution(cols, rows, pictures) {

		let cardPairQuantity = cols*rows/2;
		let availableCardQuantity = pictures.length;

		let distribution = []; 
		let j = 0;
		for (let i = 0; i < cardPairQuantity; i++) {

			if(j === availableCardQuantity) {
				j = 0;
			}

			let cardOne = {
				src: pictures[j],
				value: Math.random()
			}
			let cardTwo = {
				src: pictures[j],
				value: Math.random()/2
			}

			distribution.push(cardOne);
			distribution.push(cardTwo);
			j++;
		}
		distribution.sort( (a,b) => (a.value - b.value));

		return distribution; 
	}

	function cardClick(event) {

		let target = event.target;
		if(!isGameStart) {
			isGameStart = true;
			findTime();
		}

		if(target.tagName != 'IMG' || disableClick) {
			return;
		}

		let cardWrap = target.parentNode;
		let neighbour =  target.nextElementSibling || target.previousElementSibling;
		let isActive = cardWrap.classList.contains('active-card');
		let startHeight = getComputedStyle(target).height;
		let	heightVal = Number(startHeight.slice(0, -2));
		
		animation(target, 0);
		setTimeout(function() {
			neighbour.style.height = '0';
			cardWrap.classList.toggle("active-card");
			animation(neighbour, heightVal);

			setTimeout(function() {
				let activeCards = document.querySelectorAll(".active-card");
				if(activeCards.length === 2) {
					let firstCardSrc = activeCards[0].querySelector(".show-card").getAttribute("src");
					let secondCard = activeCards[1].querySelector(".show-card").getAttribute("src");

					if(firstCardSrc === secondCard) {

						deleteCardAnimation(activeCards[0]);
						deleteCardAnimation(activeCards[1]);

						setTimeout(function() {
							disableClick = false;
							isGameOver();
						},1000)

					} else {
						setTimeout(function() {

							closeCardAnimation(activeCards[0]);
							closeCardAnimation(activeCards[1]);

							setTimeout(function() {
								disableClick = false;
							},2000);
						}, 1000);
					}
				} else {
					disableClick = false;
				}
			},1000);
		}, 1000);
	}

	function animation(elem, endHeightElem) {
		disableClick = true;
		let startHeight = getComputedStyle(elem).height; 
		let	startValue = Number(startHeight.slice(0, -2));
		let duration = 1500;
		let frameCount = duration/1000*60;
		let delta = -(endHeightElem - startValue)/frameCount;

		let interval = setInterval(() => {
			if((endHeightElem === 0 && endHeightElem > startValue) ||
			   (endHeightElem != 0 && endHeightElem < startValue)) {
				
				clearInterval(interval);
			}
			startValue -= delta;
			elem.style.height = startValue + "px";
		}, 10);
	}
	function isGameOver() {
		let cards = document.querySelectorAll(".show-card");
		if(cards.length === 0) {
			isGameStart = false;
			let time = findTime();
			let timeStr = rewriteTime(time);
			let user = congratulation(timeStr);
			let results = putResultToLocalStorage(user, time, timeStr, gameinfo);
			reWrileListResults();
			createRulesField();
		}
		return;
	}

	function startTime() { 
		if(isGameStart) {
			start = new Date();
		}
		if(!isGameStart) {
			let end = new Date()
			var time = end.getTime() - start.getTime();
			return time;
		}
	}

	function findTime() {
		if (isGameStart) {
			startDate = new Date();
			startTime();
		} 
		else {
			let resTime = startTime();
			return resTime;
		}
	}
	function rewriteTime(time) {
		let sec = 1000;
		let mm = 1000*60;
		let hh = 1000*60*60;

		let hours = 0;
		let minutes = 0;
		let seconds = 0;

		if(time >= hh) {
			hours = Math.floor(time/hh);
			time = time%hh;
		}
		if(time >= mm) {
			minutes = Math.floor(time/mm);
			time = time%mm;
		}
		if(time >= sec) {
			seconds = Math.floor(time/sec);
			time = time%sec;
		}
		if (hours<10) hours='0'+hours;
		if (minutes<10) minutes='0'+minutes;
		if (seconds<10) seconds='0'+seconds;
		if (time<10) time='0'+time;

		let res = hours + ':' + minutes + ':' + seconds + '.' + time;
		return res;
	}
	function congratulation(timeStr) {

		let user = JSON.parse(localStorage.getItem("user"));
		alert("Congratulation, " + user.firstName + " " + user.lastName +  " , your time is " + timeStr);
		return user;
	}

	function putResultToLocalStorage(user, time, timeStr, gameinfo) {
		let result = {
			user: {
				firstName: user.firstName,
				lastName: user.lastName,
				eMail: user.eMail
			},
			time: time,
			timeSrt: timeStr,
			difficult:  gameinfo.difficult
		}
		let prevResults = JSON.parse(localStorage.getItem("results"))

		if(prevResults === null) {
			prevResults = [];
		}
		prevResults.push(result);
		let arr = JSON.stringify(prevResults); 
		localStorage.setItem("results", arr); 
	}

	function reWrileListResults() {

		let res = JSON.parse(localStorage.getItem("results"));

		if(res === null) {
			res = [];
		}
		let easyRes = res.filter(elem => elem.difficult === 'easy');
		let normalRes = res.filter(elem => elem.difficult === 'normal');
		let hardRes = res.filter(elem => elem.difficult === 'hard');

		easyRes.sort((a, b) => a.time -b.time);
		normalRes.sort((a, b) => a.time -b.time);
		hardRes.sort((a, b) => a.time -b.time);
		let diffArr = [easyRes,normalRes,hardRes];

		let oldUl = document.querySelector(".top-players-list");
		let newUl = document.createElement('ul');
		newUl.setAttribute("class", "top-players-list");

		for (let i=0; i<diffArr.length; i++) {

			let newLi = document.createElement('li');
  			let newP = document.createElement('p');
  			let diff;

  			if (i===0) {
  				diff = "easy";
  			}else if(i===1) {
  				diff = "normal";
  			} else {
  				diff = "hard";
  			}
  			newP.innerHTML = "difficult: " + diff;
  			newLi.appendChild(newP);
  			let newOl = document.createElement('ol');

  			for (let j = 0; j<10; j++) {

  				let li = document.createElement('li');
  				let innerHtml;
  				try { 
					innerHtml = (diffArr[i][j].user.firstName + " " +  diffArr[i][j].user.lastName + ", " + diffArr[i][j].timeSrt);
				} catch (err) {
				 	innerHtml = "-  -";
				}
  				li.innerHTML = innerHtml;

  				newOl.appendChild(li);
  			}

  			newLi.appendChild(newOl);
  			newUl.appendChild(newLi);
		}
		oldUl.parentNode.replaceChild(newUl, oldUl);
	}
	function autoFilledForm() {
		let user;
		 
		user = JSON.parse(localStorage.getItem("user"));
		if(user != null) {
			let firstName =document.querySelector("#first-name");
			firstName.setAttribute("value", user.firstName);

			let lastName =document.querySelector("#last-name");
			lastName.setAttribute("value", user.lastName);

			let email =document.querySelector("#email");
			email.setAttribute("value", user.eMail);
		}
	}
	function deleteCardAnimation(parent) {
		let target = parent.querySelector(".show-card");
		animation(target, 0);
		setTimeout(function() {
			parent.classList.toggle("active-card");
			parent.firstChild.remove();
			parent.firstChild.remove();
		},1000);
	}
	function closeCardAnimation(parent) {
		let target = parent.querySelector(".show-card");
		let startHeight = getComputedStyle(target).height;
		let	heightVal = Number(startHeight.slice(0, -2));
		let neighbour = parent.querySelector(".hide-card");

		animation(target, 0);
		setTimeout(function() {
			neighbour.style.height = '0';
			parent.classList.toggle("active-card");
			animation(neighbour, heightVal);
		},1000);
	}
	function createRulesField() {
		let oldMain = document.querySelector("main");
		let newMain = document.createElement('main');
		
		let h1 = document.createElement('h1');
		h1.innerHTML = "Match-match-game";
		newMain.appendChild(h1);

		let h2 = document.createElement('h2');
		h2.innerHTML = "How to play:";
		newMain.appendChild(h2);

		let p = document.createElement('p');
		p.innerHTML = "Memory is a counter game where the object is to find pairs.";
		newMain.appendChild(p);

		let pp = document.createElement('p');
		pp.innerHTML = "When the game begins, all pictures are hidden.";
		newMain.appendChild(pp);

		let hh2 = document.createElement('h2');
		hh2.innerHTML = "To play:";
		newMain.appendChild(hh2);

		let liArr = [ "Select two cards to try to match the pictures",
			"If you match the pictures you can go again.",
			"If they don't match it is the computer turn them.",
			"If they don't match it is the computer turn them.",
			"The player that finds all pairs wins!",
			"Have Fun!"
		]
		let ol = document.createElement('ol');
		for (let i = 0; i<liArr.length; i++) {
			let li = document.createElement('li');
			li.innerHTML = liArr[i];
			ol.appendChild(li);
		}
		newMain.appendChild(ol);
		oldMain.parentNode.replaceChild(newMain, oldMain);	
	}

	function isEnoughskirtCardsCount() {

		let pictures = document.querySelectorAll("[id ^= 'card']");
		let activePictures = [];
		pictures.forEach( function( elem ) {
			if(elem.checked) {
				activePictures.push(elem);
			}
		})
		let count = activePictures.length;
		let res = count < 3 ? false : true;
		return res;
	}	
	/*delete localStorage['user'];
	delete localStorage['results'];*/

	let start;
	let isGameStart = false;
	let gameinfo;
	let cardOpenCount = 0;
	let disableClick = false;
	reWrileListResults();
	
	let headerElement = document.querySelector("header");
	headerElement.addEventListener("click", headerCkick);
});