/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

require(["Olives/Model-plugin", "Store", "Olives/Plugins"], function (ModelPlugin, Store, Plugins) {


	describe("ModelPluginTest", function () {
		it("should be a constructor function", function () {
			expect(ModelPlugin).toBeInstanceOf(Function);
		});

		it("should have the following API", function () {
			var modelPlugin = new ModelPlugin();

			expect(modelPlugin.bind).toBeInstanceOf(Function);
			expect(modelPlugin.foreach).toBeInstanceOf(Function);
			expect(modelPlugin.setModel).toBeInstanceOf(Function);
			expect(modelPlugin.getModel).toBeInstanceOf(Function);
			expect(modelPlugin.form).toBeInstanceOf(Function);
			expect(modelPlugin.observers).toBeInstanceOf(Object);
		});

	});

	describe("ModelPluginInit", function () {

		var modelPlugin = null,
		model = new Store;

		beforeEach(function () {
			modelPlugin = new ModelPlugin;
		});

		it("should allow for setting model if it's a store", function () {
			expect(modelPlugin.setModel()).toEqual(false);
			expect(modelPlugin.setModel({})).toEqual(false);
			expect(modelPlugin.setModel(model)).toEqual(true);
		});

		it("should return the model", function () {
			modelPlugin.setModel(model);
			expect(modelPlugin.getModel()).toBe(model);
		});

		it("should directly init the plugin with the given store", function () {
			modelPlugin = new ModelPlugin(model);
			expect(modelPlugin.getModel()).toBe(model);
		});

	});

	describe("ModelPluginBind", function () {

		var plugins = null,
		model = null,
		dom = null,
		modelPlugin = null;

		beforeEach(function () {
			dom = document.createElement("p");

			dom.dataset["model"] = "bind:innerHTML,content";
			model =  new Store({content: "Olives is fun!"});
			plugins = new Plugins;
			modelPlugin =  new ModelPlugin(model);
			plugins.add("model", modelPlugin);
		});

		it("should link the model and the dom node with bind", function () {
			plugins.apply(dom);
			expect(dom.innerHTML).toEqual("Olives is fun!");
			model.set("content", "Olives is cool!");
			expect(dom.innerHTML).toEqual("Olives is cool!");
			expect(modelPlugin.observers["content"]).toBeInstanceOf(Array);
			expect(model.getValueObservable().hasObserver(modelPlugin.observers["content"][0])).toEqual(true);
		});

		it("should not touch the dom if the value isn't set", function () {
			dom.dataset["model"] = "bind:innerHTML,content2";
			plugins.apply(dom);
			expect(dom.innerHTML).toEqual("");
		});

		it("should set up the dom as soon as the value is set", function () {
			dom.dataset["model"] = "bind:innerHTML,content2";
			plugins.apply(dom);
			model.set("content2", "sup!");
			expect(dom.innerHTML).toEqual("sup!");
		});
		
		it("should also work with properties", function () {
			var dom = document.createElement("input");
			dom.dataset["model"] = "bind:checked,bool";
			model.reset({bool:true});
			plugins.apply(dom);
			expect(dom.checked).toEqual(true);
			model.set("bool", false);
			expect(dom.checked).toEqual(false);
		});

	});
	
	describe("ModelPluginBindTheOtherWay", function () {
		
		var plugins = null,
			model = null,
			dom = null;
		
		beforeEach(function () {
			dom = document.createElement("input");
			dom.dataset["model"] = "bind:checked,bool";
			model = new Store({bool:false});
			plugins = new Plugins;
			plugins.add("model", new ModelPlugin(model));
		});
		
		it("should update the model on dom change", function () {
			var func;
			spyOn(dom, "addEventListener");
			plugins.apply(dom);
			expect(dom.addEventListener.wasCalled);
			expect(dom.addEventListener.mostRecentCall.args[0]).toEqual("change");
			expect(dom.addEventListener.mostRecentCall.args[2]).toBe(true);
			func = dom.addEventListener.mostRecentCall.args[1];
			expect(func).toBeInstanceOf(Function);
			dom.checked = true;
			func();
			expect(model.get("bool")).toEqual(true);
		});
		
	});


	describe("ModelPluginBindEnhanced", function () {

		var plugins = null,
		model = null,
		dom = null;

		beforeEach(function () {
			dom = document.createElement("div");
			dom.innerHTML = "<strong data-model='bind:innerHTML,name'></strong>" +
			"		<dl>" +
			"			<dt>Mail:</dt><dd data-model='bind:innerHTML,contact.mail'></dd>" +
			"			<dt>Office:</dt><dd data-model='bind:innerHTML,contact.office'></dd>" +
			"			<dt>Mobile:</dt><dd data-model='bind:innerHTML,contact.mobile'></dd>" +
			"		</dl>";
			model = new Store({
				name: "Olives",
				contact: {
					mail: "mailbox@domain.com",
					office: "+1234567890"
				}
			});	
			plugins = new Plugins;
			plugins.add("model", new ModelPlugin(model));
		});

		it("should also work with complex data", function () {
			plugins.apply(dom);
			expect(dom.querySelectorAll("strong")[0].innerHTML).toEqual("Olives");
			expect(dom.querySelectorAll("dd")[0].innerHTML).toEqual("mailbox@domain.com");
			expect(dom.querySelectorAll("dd")[1].innerHTML).toEqual("+1234567890");
			expect(dom.querySelectorAll("dd")[2].innerHTML).toEqual("");
		});

		it("should also be updatable", function () {
			plugins.apply(dom);
			model.set("contact", {office: "-0987654321"});
			expect(dom.querySelectorAll("dd")[1].innerHTML).toEqual("-0987654321");
		});

	});
	
	describe("ModelPluginBindTheOtherWayEnhanced", function () {

		var plugins = null,
		model = null,
		dom = null;

		beforeEach(function () {
			dom = document.createElement("ul");
			dom.dataset["model"] = "foreach";
			dom.innerHTML = "<li><input type='checkbox' data-model='bind:checked,optin' />" +
					"		<input type='text' data-model='bind:value,name' /></li>";
			
			model = new Store([{
					optin: false,
					name: "Emily"
				}, {
					optin: false,
					name: "Olives"
				}]);	
			
			plugins = new Plugins;
			plugins.add("model", new ModelPlugin(model));
		});

		it("should bind from dom to model", function () {
			var checkbox,
				event = document.createEvent("UIEvent");
			plugins.apply(dom);

			event.initEvent("change", true, true, window, 0);
			
			checkbox = dom.querySelector("input[type='checkbox']");
			checkbox.checked = true;
			
			checkbox.dispatchEvent(event);
			
			expect(model.get(0).optin).toEqual(true);
		});
		
	});

	describe("ModelPluginItemRenderer", function () {

		var modelPlugin = null;

		beforeEach(function () {
			modelPlugin = new ModelPlugin();
		});

		it("should provide an item renderer", function () {
			expect(modelPlugin.ItemRenderer).toBeInstanceOf(Function);
		});

		it("should have the following API", function () {
			var itemRenderer = new modelPlugin.ItemRenderer();
			expect(itemRenderer.set).toBeInstanceOf(Function);
			expect(itemRenderer.get).toBeInstanceOf(Function);
			expect(itemRenderer.associate).toBeInstanceOf(Function);
		});

		it("should set the node to render", function () {
			var itemRenderer = new modelPlugin.ItemRenderer(),
			div = document.createElement("div");

			expect(itemRenderer.set(div)).toEqual(true);
			expect(itemRenderer.get()).toBe(div);
		});

		it("should associate the dom node with the model", function () {
			var itemRenderer = new modelPlugin.ItemRenderer(),
			div = document.createElement("div"),
			associated;

			div.innerHTML = '<p><span>date:</span><span data-model="bind:innerHTML,date"></span></p>' +
			'<p><span>title:</span><span data-model="bind:innerHTML,title"></span></p>';
			itemRenderer.set(div);

			associated = itemRenderer.associate(0, "model");
			expect(associated).toBeInstanceOf(HTMLElement);
			expect(associated.nodeName).toEqual("DIV");
			expect(associated.querySelectorAll("*").length).toEqual(6);

			expect(associated.querySelectorAll("[data-model]")[0].dataset["model_id"]).toEqual('0');
			expect(associated.querySelectorAll("[data-model]")[1].dataset["model_id"]).toEqual('0');
			expect(associated.querySelectorAll("[data-model_id]").length).toEqual(6);
		});

		it("should return a cloned node", function () {
			var itemRenderer = new modelPlugin.ItemRenderer(),
			div = document.createElement("div");

			itemRenderer.set(div);
			expect(itemRenderer.associate(0, "model")).not.toBe(div);
		});

		it("should set the item renderer on init", function () {
			var div = document.createElement("div"),
			itemRenderer = new modelPlugin.ItemRenderer(div);

			expect(itemRenderer.get()).toBe(div);
		});


	});

	describe("ModelPluginToList", function () {
		var modelPlugin = null,
		model = null,
		dom = null,
		plugins = null;

		beforeEach(function () {
			dom = document.createElement("ul");

			dom.setAttribute("data-model", "foreach"); 
			dom.innerHTML = '<li data-model="bind:innerHTML"></li>';

			model = new Store(["Olives", "is", "fun"]);
			modelPlugin = new ModelPlugin(model);
			plugins = new Plugins;
			plugins.add("model", modelPlugin);
		});

		it("should expand the node inside", function () {
			plugins.apply(dom);
			expect(dom.querySelectorAll("li").length).toEqual(3);
			expect(dom.querySelectorAll("li")[0].dataset["model_id"]).toEqual("0");
			expect(dom.querySelectorAll("li")[1].dataset["model_id"]).toEqual("1");
			expect(dom.querySelectorAll("li")[2].dataset["model_id"]).toEqual("2");
		});

		it("should'nt do anything if no inner node declared", function () {
			var dom = document.createElement("div");

			expect(function () {
				plugins.apply(dom);
			}).not.toThrow();
			expect(dom.querySelectorAll("*").length).toEqual(0);
		});

		it("should associate the model with the dom nodes", function () {
			plugins.apply(dom);
			expect(dom.querySelectorAll("li")[0].innerHTML).toEqual("Olives");
			expect(dom.querySelectorAll("li")[1].innerHTML).toEqual("is");
			expect(dom.querySelectorAll("li")[2].innerHTML).toEqual("fun");
			expect(dom.querySelectorAll("li").length).toEqual(3);
		});

		it("should update the generated dom when the model is updated", function () {
			plugins.apply(dom);
			model.set(0, "Olives and Emily");
			expect(dom.querySelectorAll("li")[0].innerHTML).toEqual("Olives and Emily");
			model.set(1, "are");
			expect(dom.querySelectorAll("li")[1].innerHTML).toEqual("are");
			model.alter("splice", 2, 0, "very");
			expect(dom.querySelectorAll("li")[2].innerHTML).toEqual("very");
			expect(dom.querySelectorAll("li")[3].innerHTML).toEqual("fun");
			expect(dom.querySelectorAll("li").length).toEqual(4);
		});

		it("should remove an item if it's removed from the model", function () {
			plugins.apply(dom);
			model.alter("pop");
			expect(dom.querySelectorAll("li")[2]).toBeUndefined();
		});
		
		it("should remove the observers of the removed item", function () {
			var handler;
			plugins.apply(dom);
			handler = modelPlugin.observers[2][0];
			model.alter("pop");
			expect(model.getValueObservable().hasObserver(handler)).toEqual(false);
			expect(modelPlugin.observers[2]).toBeUndefined();
		});
		
		
		it("should not fail if the ItemRenderer is given a DOM that starts with a textnode", function () {
			dom.innerHTML = " \n \t\t <li></li>";
			spyOn(modelPlugin, "ItemRenderer").andCallThrough();
			expect(function () {
				plugins.apply(dom);
			}).not.toThrow();
			expect(dom.querySelectorAll("li").length).toEqual(3);
		});
	});

	describe("ModelPluginToListEnhanced", function () {

		var modelPlugin = null,
		model = null,
		dataSet = null,
		dom = null,
		plugins = null;

		beforeEach(function () {
			dom = document.createElement("ul");
			dom.dataset["model"] = "foreach";

			dataSet = [{value : {
				title: "Olives is cool",
				date: "2012/01/20",
				body: "it's very flexible"
			}},

			{value: {
				title: "Olives is fun",
				date: "2012/01/21",
				body: "you can cut its hair"
			}},

			{value: {
				title: "Olives is nice",
				date: "2012/01/22",
				body: "you ... no"
			}}	
			];
			model = new Store(dataSet);
			modelPlugin = new ModelPlugin(model);

			plugins = new Plugins;
			plugins.add("model", modelPlugin);
		});

		it("should expand and fill in with a complex object's values", function () {
			dom.innerHTML = '<li><em data-model="bind:innerHTML,value.date"></em><strong data-model="bind:innerHTML,value.title"></strong>' +
			'<span data-model="bind:innerHTML,value.body"></span></li>';

			modelPlugin.foreach(dom);
			expect(dom.querySelectorAll("li").length).toEqual(3);
			expect(dom.querySelectorAll("em")[0].innerHTML).toEqual(dataSet[0].value.date);
			expect(dom.querySelectorAll("strong")[0].innerHTML).toEqual(dataSet[0].value.title);
			expect(dom.querySelectorAll("span")[0].innerHTML).toEqual(dataSet[0].value.body);

			expect(dom.querySelectorAll("em")[1].innerHTML).toEqual(dataSet[1].value.date);
			expect(dom.querySelectorAll("strong")[1].innerHTML).toEqual(dataSet[1].value.title);
			expect(dom.querySelectorAll("span")[1].innerHTML).toEqual(dataSet[1].value.body);

			expect(dom.querySelectorAll("em")[2].innerHTML).toEqual(dataSet[2].value.date);
			expect(dom.querySelectorAll("strong")[2].innerHTML).toEqual(dataSet[2].value.title);
			expect(dom.querySelectorAll("span")[2].innerHTML).toEqual(dataSet[2].value.body);
		});

		it("should update such expanded list", function () {
			dom.innerHTML = '<li><em data-model="bind:innerHTML,value.date"></em><strong data-model="bind:innerHTML,value.title"></strong>' +
			'<span data-model="bind:innerHTML,value.body"></span></li>';

			modelPlugin.foreach(dom);

			model.set(1, {
				value: {
					title: "Olives is fantastic",
					date: "2012/01/24",
					body: "innit"
				}
			});
			expect(dom.querySelectorAll("em")[1].innerHTML).toEqual("2012/01/24");
			expect(dom.querySelectorAll("strong")[1].innerHTML).toEqual("Olives is fantastic");
			expect(dom.querySelectorAll("span")[1].innerHTML).toEqual("innit");
		});


	});

	describe("ModelForm", function () {

		var modelPlugin = null,
		plugins = null,
		model = null,
		form = null;

		beforeEach(function () {
			model = new Store();
			modelPlugin = new ModelPlugin(model);
			plugins = new Plugins();
			plugins.add("model", modelPlugin);
			form = document.createElement("form");
			form.innerHTML = '<p><label>Firstname: </label><input type="text" name="firstname" value="olivier" /></p>' +
			'<p><label>Lastname: </label><input type="text" name="lastname" value="wietrich" /></p>' +
			'<p><label>Age: </label><input type="number" step="1" min="0" max="99" name="age" value="25" /></p>' +
			'<p><label>Job: </label><input type="text" name="job" value="engineer" /></p>' +
			'<p><button type="submit">ok</button></p>';
			form.dataset["model"] = "form";
		});

		it("should have a set function to set the model from form values", function () {
			var input = document.createElement("input");
			input.type = "text"
				input.name = "firstname";
			input.value = "olivier";
			expect(modelPlugin.set).toBeInstanceOf(Function);
			expect(modelPlugin.set(document.createElement("input"))).toEqual(false);
			expect(modelPlugin.set(input)).toEqual(true);
			expect(model.get("firstname")).toEqual("olivier");
		});



		it("should have a form function", function () {
			expect(modelPlugin.form).toBeInstanceOf(Function);
		});

		it("should accept only form nodes", function () {
			expect(modelPlugin.form()).toEqual(false);
			expect(modelPlugin.form(document.createElement("div"))).toEqual(false);
			expect(modelPlugin.form(form)).toEqual(true);
		});

		it("should make form listen to submit", function () {
			spyOn(form, "addEventListener").andCallThrough();
			spyOn(modelPlugin, "set");

			modelPlugin.form(form);

			expect(form.addEventListener.wasCalled).toEqual(true);
			expect(form.addEventListener.mostRecentCall.args[0]).toEqual("submit");
			expect(form.addEventListener.mostRecentCall.args[2]).toEqual(true);

		});

		it("should call set on submit and prevent the real submit to avoid the page to be refreshed", function () {
			var func,
			event = {
					preventDefault: jasmine.createSpy()
			};
			spyOn(form, "addEventListener").andCallThrough();
			spyOn(modelPlugin, "set");

			modelPlugin.form(form);
			func = form.addEventListener.mostRecentCall.args[1];

			expect(func).toBeInstanceOf(Function);
			func(event);

			expect(modelPlugin.set.wasCalled).toEqual(true);
			expect(modelPlugin.set.callCount).toEqual(4);
			expect(event.preventDefault.wasCalled).toEqual(true);
		});
	});
	
	describe("ModelPluginPlugins", function () {
		
		var modelPlugin = null,
			model = null,
			newBindings = null,
			dom = null;
		
		beforeEach(function () {
			model = new Store({"property": false});
			newBindings = {
				toggleClass: jasmine.createSpy()
			};
			modelPlugin = new ModelPlugin(model);
			modelPlugin.plugins = {}; modelPlugin.plugins.name = "model";
			dom = document.createElement("div");
		});
		
		it("should have the following methods", function () {
			expect(modelPlugin.addBindings).toBeInstanceOf(Function);
			expect(modelPlugin.getBinding).toBeInstanceOf(Function);
			expect(modelPlugin.addBinding).toBeInstanceOf(Function);
		});
		
		it("should add a new binding", function () {
			expect(modelPlugin.addBinding("")).toEqual(false);
			expect(modelPlugin.addBinding("", {})).toEqual(false);
			expect(modelPlugin.addBinding("", function () {})).toEqual(false);
			expect(modelPlugin.addBinding("toggleClass", newBindings.toggleClass)).toEqual(true);
			expect(modelPlugin.getBinding("toggleClass")).toBe(newBindings.toggleClass);
		});
		
		it("should add multiple bindings at once", function () {
			spyOn(modelPlugin, "addBinding").andCallThrough();
			expect(modelPlugin.addBindings(newBindings)).toEqual(true);
			expect(modelPlugin.addBinding.wasCalled).toEqual(true);
			expect(modelPlugin.addBinding.mostRecentCall.args[0]).toEqual("toggleClass");
			expect(modelPlugin.addBinding.mostRecentCall.args[1]).toBe(newBindings.toggleClass);
		});
		
		it("should execute new bindings", function () {
			modelPlugin.addBindings(newBindings);
			modelPlugin.bind(dom, "toggleClass","property");
			expect(newBindings.toggleClass.mostRecentCall.args[0]).toEqual(false);
			model.set("property", true);
			expect(newBindings.toggleClass.mostRecentCall.args[0]).toEqual(true);
			expect(newBindings.toggleClass.mostRecentCall.object).toBe(dom);
		});
		
		it("should not double way bind the plugins", function () {
			modelPlugin.addBindings(newBindings);
			spyOn(dom, "addEventListener");
			modelPlugin.bind(dom, "toggleClass", "proprietary");
			expect(dom.addEventListener.wasCalled).toEqual(false);
		});
		
		it("should add bindings at ModelPlugin init", function () {
			var modelPlugin = new ModelPlugin(model, newBindings);
			
			expect(modelPlugin.getBinding("toggleClass")).toBe(newBindings.toggleClass);
		});
		
	});
});