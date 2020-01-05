// 请把与index.html页面相关的javascript代码写在这里
// 同时删除该注释

window.onload = function() {
	// 把`loadPromotions()`中的优惠信息以动态加载的方式显示在这里，让用户看到即可
	var halfPriceIds = [];
	var promotionsEle = document.getElementById("promotions");
	promotionsEle.innerHTML = `<ol></ol>`;
	var ol = promotionsEle.children[0];

	var promotions = loadPromotions();
	promotions.forEach((promotion) => {
		if(promotion.type === "满30减6元") {
			ol.innerHTML += `<li>${promotion.type}</li>`;
		} else if (promotion.type === "指定菜品半价") {
			halfPriceIds = promotion.items;
			var ids = ``;
			promotion.items.forEach((id) => {
				ids += `<li>${id}</li>`; 
			});
			ol.innerHTML += `<li>${promotion.type}<ul>${ids}</ul></li>`;
		}
	});

	// 把`loadAllItems()`中的菜品信息以动态加载的方式显示在这里，并且能够让用户输入数量
	var itemsElement = document.getElementById("items");
	var items = loadAllItems();

	itemsElement.innerHTML = `<table id="items-tab" cellspacing="0">
									<tr>
										<th><input id="allselect" onclick="allselect(this)" type="checkbox">全选</th>
										<th>ID</th>
										<th>名称</th>
										<th>价格</th>
										<th>数量</th>
									</tr>
								</table>`;

	var itmesTab = document.getElementById("items-tab");

	items.forEach((item) => {
		var price = `${item.price}`;
		var index = halfPriceIds.indexOf(item.id);
		if(index >= 0) {
			price = `<span class="full-price">${item.price}</span>
				     <span class="half-price">${item.price / 2}</span>`;
		}

		itmesTab.innerHTML += `<tr>
									<td><input onclick="selectFood(this, '${item.id}')" id="cb-${item.id}" type="checkbox"></td>
									<td>${item.id}</td>
									<td>${item.name}</td>
									<td>${price}</td>
									<td>
										<button onclick="minus(this, '${item.id}')">-</button>
										<input type="text" value="0" style="width:50px" id="count-${item.id}"></input>
										<button onclick="add(this, '${item.id}')">+</button>
									</td>
								</tr>`;
	});

	// 购物车
	localStorage.foodcar = JSON.stringify({});
}

function minus(btn, id) {
	var countEle = btn.nextElementSibling;
	var count = parseInt(countEle.value);
	if (count === 0) {
		return;
	}
	count -= 1;

	countEle.value = count;

	// 更新购物车
	var foodcar = JSON.parse(localStorage.foodcar);
	foodcar[id] = count;
	if(count === 0) {
		delete foodcar[id];
		document.getElementById(`cb-${id}`).checked = false;
	}
	localStorage.foodcar = JSON.stringify(foodcar);
}

function add(btn, id) {
	var countEle = btn.previousElementSibling;
	var count = parseInt(countEle.value);
	count += 1;
	countEle.value = count;

	document.getElementById(`cb-${id}`).checked = true;

	// 更新购物车
	var foodcar = JSON.parse(localStorage.foodcar);
	foodcar[id] = count;
	localStorage.foodcar = JSON.stringify(foodcar);
}

function calculatePrice() {
	// 想办法调用`bestCharge`并且把返回的字符串
	// 显示在html页面的`message`中
	var items = loadAllItems();
	var id2price = {};
	items.forEach((item) => {
		id2price[item.id] = item.price;
	});
	var foods = JSON.parse(localStorage.foodcar);

	var halfPriceIds = [];
	var promotions = loadPromotions();
	promotions.forEach((promotion) => {
		if (promotion.type === "指定菜品半价") {
			halfPriceIds = promotion.items;
		}
	});

	var total1 = calculateFullMinus(id2price, foods);
	var total2 = calculateHalfPrice(id2price, foods, halfPriceIds);
	var total = total1 <= total2 ? total1 : total2;

	document.getElementById("message").innerText = total;
}

function calculateHalfPrice(id2price, foods, halfPriceIds) {
	var total = 0;
	for(var id in foods) {
		var price = id2price[id];
		if (halfPriceIds.indexOf(id) >= 0) {
			price /= 2;
		}
		total += price * foods[id];
	}
	return total;
}

function allselect(cb) {
	var items = loadAllItems();

	if(cb.checked) {
		items.forEach((item)=>{
			var cb = document.getElementById(`cb-${item.id}`);
			cb.checked = true;
			selectFood(cb, item.id);
		});
	} else {
		items.forEach((item)=>{
			var cb = document.getElementById(`cb-${item.id}`);
			cb.checked = false;
			selectFood(cb, item.id);

			document.getElementById(`count-${item.id}`).value = 0;
		});
	}
}

function selectFood(cb, id) {
	var foodcar = JSON.parse(localStorage.foodcar);
	var count = parseInt(document.getElementById(`count-${id}`).value);

	if(cb.checked) {
		foodcar[id] = count;
	} else {
		delete foodcar[id];
	}
	localStorage.foodcar = JSON.stringify(foodcar);
}

function calculateFullMinus(id2price, foods) {
	var total = 0;
	for(var id in foods) {
		total += id2price[id] * foods[id];
	}

	if(total >= 30) {
		total -= 6;
	}
	return total;
}

function clearHistory() {
  // 清除用户的选择，以及页面显示的信息
  // 清除之后，用户可以继续正常使用各项功能
  localStorage.foodcar = JSON.stringify({});
  var all = document.getElementById("allselect");
  all.checked = false;
  allselect(all);
  document.getElementById("message").innerText = "";
}