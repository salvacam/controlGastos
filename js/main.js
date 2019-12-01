document.addEventListener('DOMContentLoaded', function () {
  	app.init();
});

var app = {  
	
	principalDiv: document.getElementById('principalDiv'),
	formBillDiv: document.getElementById('formBillDiv'),

	myModal: document.getElementById('myModal'),
	closeModalButton: document.getElementById('closeClear'),
	addBillButton: document.getElementById('addBill'),
	newBillButton: document.getElementById('newBill'),
	clearBillButton: document.getElementById('clearBill'),
	
	conceptInput: document.getElementById('conceptInput'),
	priceInput: document.getElementById('priceInput'),
	
	listShopping: [],
	idValueEdit: undefined,
	itemShopping: undefined,
	isEdit: false,
  	
  	monthsAsString: function (monthIndex) {
		return [
		  'Enero',
		  'Febrero',
		  'Marzo',
		  'Abril',
		  'Mayo',
		  'Junio',
		  'Julio',
		  'Agosto',
		  'Septimbre',
		  'Octubre',
		  'Noviembre',
		  'Diciembre'
		][monthIndex]
  	},

	getMonth: function(unixtimestamp){
		// Convert timestamp to milliseconds
		let date = new Date(unixtimestamp*1000);
	   
		// Year
		let year = date.getFullYear();
	   
		// Month
		let month = date.getMonth();

		return `${app.monthsAsString(month)} - ${year}`;
	},
	
	convertDate: function(unixtimestamp){
		// Convert timestamp to milliseconds
		let date = new Date(unixtimestamp*1000);
	   
		// Year
		let year = date.getFullYear();
	   
		// Month
		let month = date.getMonth() +1;
	   
		// Day
		let day = date.getDate();
	   
		// Display date time in MM-dd-yyyy h:m:s format
		let convdataTime = `${day}-${month}-${year}`;
		
		return convdataTime;	
	},

	showForm: function(e) {
		app.conceptInput.value = "";
		app.priceInput.value = "";
		app.idValueEdit = undefined;
		app.itemShopping = undefined;
		app.isEdit = false;
		
		if (e !== null && e !== undefined) {
    		app.idValueEdit = e.target.getAttribute('data-id');

			app.itemShopping = app.listShopping.filter(el => el.id == app.idValueEdit);

			app.conceptInput.value = app.itemShopping[0].Concept;
			app.priceInput.value = parseFloat(app.itemShopping[0].Price);

			app.isEdit = true;
    	}

    	app.conceptInput.value
		app.principalDiv.classList.add('hide');
		app.addBillButton.classList.add('hide');
		app.formBillDiv.classList.remove('hide');
	},

	showPrincipal: function() {
		app.principalDiv.classList.remove('hide');
		app.addBillButton.classList.remove('hide');
		app.formBillDiv.classList.add('hide');
	},

	saveBill: function() {
		let concept = app.conceptInput.value;

		let price = app.priceInput.value;
		if(price !== "") {
			price = parseFloat(price).toFixed(2);
		}

		if(concept !== "" && price !== "") {			
			if (!app.isEdit) {
				let itemShoppingNew = {id: app.listShopping.length + 1 ,
					Date: Math.floor(Date.now() / 1000),Concept: concept, Price: price};
				app.addBD(itemShoppingNew);			
			} else {

				app.itemShopping[0].Concept = concept;
				app.itemShopping[0].Price = price;

				app.editBD(app.itemShopping[0]);
			}

			app.readBD();
			app.showPrincipal();
		} else {
			alert("Introduce concepto y precio");
		}
	},

	removeBill: function(e){
		if (e !== null && e !== undefined) {
    		let idValueRemove = e.target.getAttribute('data-id');

			let itemShoppingRemove = app.listShopping.filter(el => el.id == idValueRemove);

			if (confirm(`¿Borrar factura ${itemShoppingRemove[0].Concept} - ${itemShoppingRemove[0].Price} del ${app.convertDate(itemShoppingRemove[0].Date)}?`)){
				app.removeDB(itemShoppingRemove[0]);	

				app.readBD();
				app.showPrincipal();
			}			
    	}
	},

	getTotal: function(month, total) {
		return `<div class="col nopointer">
					<div class="col c3 nopointer"></div>
					<div class="col c6 nopointer"><b>Total ${month}</b></div>
					<div class="col c2 nopointer"><b>${total.toFixed(2)} €</b></div>
					<div class="col c1 nopointer novisible"></div>
					</div>
				</div>`;
	},

	getItem: function(item) {
		return `
				<div class="col itemClass" data-id="${item.id}">
					<div class="col c3" data-id="${item.id}">${app.convertDate(item.Date)}</div>
					<div class="col c6" data-id="${item.id}">${item.Concept}</div>
					<div class="col c2" data-id="${item.id}">${item.Price} €</div>
				</div>
				<div class="c1 removeItem" data-id="${item.id}">-</div>`;
	},

	showData: function(){
		if (app.listShopping != null && app.listShopping.length > 0) {
			app.principalDiv.innerHTML = "";

			let array =new Array();
			let month = "";
			let total = 0;
			for(var f=0; f < app.listShopping.length; f++) {
				if (app.getMonth(app.listShopping[f].Date) !== month) {
					if (total != 0) {
						app.principalDiv.innerHTML += app.getTotal(month, total);
						total = 0;
					}
					month = app.getMonth(app.listShopping[f].Date);
					app.principalDiv.innerHTML += `<div class="flex titleFeed">${month}</div>`;
				}
				total += parseInt(app.listShopping[f].Price);
				app.principalDiv.innerHTML += app.getItem(app.listShopping[f]);
			}

			if (total != 0) {
				app.principalDiv.innerHTML += app.getTotal(month, total);
			}

      		let allPriceLink = document.querySelectorAll('.itemClass');
			allPriceLink.forEach(
  				function(itemLink) {
   					itemLink.addEventListener('click', app.showForm);
  				}
			);
			
			let allRemoveLink = document.querySelectorAll('.removeItem');
			allRemoveLink.forEach(
  				function(itemLink) {
   					itemLink.addEventListener('click', app.removeBill);
  				}
			);			
		}
	},

	initBD: function() {
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        if (!window.indexedDB) {
            window.alert("Tu navegador no soporta IndexedDB.");
        }

        var openRequest = indexedDB.open("_expenseControl", 1);
        openRequest.onupgradeneeded = function (e) { // cuando es necesario crear el almacen de objetos
            thisDB = e.target.result;
            var almacen = thisDB.createObjectStore("listShopping", {
                keyPath: "id"
            }); 
        }

        openRequest.onsuccess = function (e) {
            console.log("se ha creado con exito");
        }

        openRequest.onerror = function (e) {
            console.log("ha ocurrido algún error al crear");
        }
    },

    readBD: function() {
    	app.listShopping = [];
        var open = indexedDB.open("_expenseControl", 1);
        open.onsuccess = function (event) {
            thisDB = event.target.result;
            var transaction = thisDB.transaction(["listShopping"], "readonly");
            var store = transaction.objectStore("listShopping");

            store.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    app.listShopping.push(cursor.value);
                    cursor.continue();
                } else {
                	app.showData();
                }
            }
        }
    },

	addBD: function(item) {
        var open = indexedDB.open("_expenseControl", 1);
        open.onsuccess = function (event) {
            thisDB = event.target.result;
            var transaction = thisDB.transaction(["listShopping"], "readwrite");
            var store = transaction.objectStore("listShopping");

            var request = store.add(item);

            request.onerror = function (e) {
                console.log("No se ha guardado con exito");
            }

            request.onsuccess = function (e) {
                console.log("Se ha guardado con exito");
            }
        }
    },

    editBD: function(item) {
        var open = indexedDB.open("_expenseControl", 1);
        open.onsuccess = function (event) {
            thisDB = event.target.result;
            var transaction = thisDB.transaction(["listShopping"], "readwrite");
            var store = transaction.objectStore("listShopping");

            var request = store.put(item);

            request.onerror = function (e) {
                console.log("No se ha editado / recuperado el item");
            }

            request.onsuccess = function (e) {
            	console.log("Se ha editado con exito");
            }
        }
    },

    removeDB: function(item) {
        var open = indexedDB.open("_expenseControl", 1);
        open.onsuccess = function (event) {
            thisDB = event.target.result;
            var transaction = thisDB.transaction(["listShopping"], "readwrite");
            var store = transaction.objectStore("listShopping");

            var request = store.delete(item.id);

            request.onerror = function (e) {
                console.log("No se ha editado / recuperado el item");
            }

            request.onsuccess = function (e) {
            	console.log("Se ha editado con exito");
            }
        }
    },

  	init: function() {

      	app.initBD();
      	app.readBD();

		app.addBillButton.addEventListener('click', (event) => {
			app.showForm();
		});

		app.clearBillButton.addEventListener('click', (event) => {
			app.showPrincipal();
		});

		app.newBillButton.addEventListener('click', (event) => {
			app.saveBill();
		});

		app.closeModalButton.addEventListener('click', app.closeModal);  

		if ('serviceWorker' in navigator) {
      		navigator.serviceWorker
        		.register('service-worker.js')
        		.then(function() {
          		//console.log('Service Worker Registered');
        	});
		}

  	}
};
