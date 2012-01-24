require(["Olives/Plugins"], function (Plugins) {
	
	describe("PluginsTest", function () {

		it("should have a constructor function", function () {
			expect(Plugins).toBeInstanceOf(Function);
		});

		it("should have the following API", function () {
			var plugins = new Plugins();
			
			expect(plugins.add).toBeInstanceOf(Function);
			expect(plugins.get).toBeInstanceOf(Function);
			expect(plugins.del).toBeInstanceOf(Function);
			expect(plugins.apply).toBeInstanceOf(Function);
		});
	});
	
	describe("PluginsPluginTest", function () {
		
		var plugins = null,
			plugin = {};
		
		beforeEach(function () {
			plugins = new Plugins();
		});
		
		it("should allow for adding plugins", function () {
			
			expect(plugins.add()).toEqual(false);
			expect(plugins.add("test")).toEqual(false);
			expect(plugins.add("test", null)).toEqual(false);
			expect(plugins.add(plugin, "test")).toEqual(false);
			expect(plugins.add("test", plugin)).toEqual(true);
			
			expect(plugins.get("test")).toBe(plugin);
		});
		
		it("should allow for removing plugins", function () {
			plugins.add("test", plugin);
			
			expect(plugins.del("test")).toEqual(true);
			expect(plugins.get("test")).toBeUndefined();
			expect(plugins.del("test")).toEqual(true);
		});
		
	});
	
	describe("PluginsPluginCall", function () {
		
		var plugins = null,
			plugin1 = null,
			plugin2 = null,
			template = document.createElement("div");
		
		beforeEach(function () {
			plugins = new Plugins();
			plugin1 = {
				method: jasmine.createSpy()
			};
			
			plugin2 = {
				method1: jasmine.createSpy(),
				method2: jasmine.createSpy()
			};
		});
		
		it("should apply the plugins to the corresponding dom node and return it", function () {
			expect(plugins.apply()).toEqual(false);
			expect(plugins.apply({})).toEqual(false);
			expect(plugins.apply(template)).toBe(template);
		});
		
		it("should call the plugin on apply", function () {
			template.innerHTML = '<span data-plugin1="method"><span>';
			
			expect(function () {
				plugins.apply(template);
			}).not.toThrow();
			
			expect(plugin1.method.wasCalled).toEqual(false);
			plugins.add("plugin1", plugin1);
			plugins.apply(template);
			expect(plugin1.method.wasCalled).toEqual(true);
			expect(plugin1.method.mostRecentCall.object).toBe(plugin1);
		});
		
		it("should call multiple plugins on apply", function () {
			template.innerHTML = '<span data-plugin1="method"></span><p data-plugin2="method1"></p>' +
								'<div data-plugin1="method" data-plugin2="method1;method2"></div>';
			
			plugins.add("plugin1", plugin1);
			plugins.add("plugin2", plugin2);
			
			plugins.apply(template);
			expect(plugin1.method.callCount).toEqual(2);
			expect(plugin1.method.mostRecentCall.object).toBe(plugin1);
			expect(plugin2.method1.callCount).toEqual(2);
			expect(plugin2.method1.mostRecentCall.object).toBe(plugin2);
			expect(plugin2.method2.callCount).toEqual(1);
			expect(plugin2.method2.mostRecentCall.object).toBe(plugin2);
			
		});
		
		
		it("should call also if spaces are present between two methods", function () {
			template.innerHTML = '<span data-plugin2="method1; method2"></span>';
			plugins.add("plugin2", plugin2);
			plugins.apply(template);
			expect(plugin2.method2.wasCalled).toEqual(true);
		});
		
		it("should'nt fail if no such method", function () {
			template.innerHTML = '<span data-plugin2="method3"></span>';
			plugins.add("plugin2", plugin2);
			expect(function () {
				plugins.apply(template);
			}).not.toThrow();
			
			expect(plugin2.method2.wasCalled);
		});
		
		it("should pass parameters to the method", function () {
			template.innerHTML = '<span data-plugin2="method1:param1, param2; method2: param1"></span>';
			plugins.add("plugin2", plugin2);
			plugins.apply(template);
			expect(plugin2.method1.callCount).toEqual(1);
			expect(plugin2.method1.mostRecentCall.args[0]).toBe(template.childNodes[0]);
			expect(plugin2.method1.mostRecentCall.args[1]).toEqual("param1");
			expect(plugin2.method1.mostRecentCall.args[2]).toEqual("param2");
			expect(plugin2.method2.mostRecentCall.args[0]).toBe(template.childNodes[0]);
			expect(plugin2.method2.mostRecentCall.args[1]).toEqual("param1");
		});
		
	});
	
	describe("PluginsCallEvolvingTemplate", function (){
		
		var template = document.createElement("div"),
			plugins = null,
			plugin1 = null,
			plugin2 = null;
		
		beforeEach(function () {
			plugin1 = {
					expand: function (node, nb) {
						var itemRenderer = node.childNodes[0],
							domFrag = document.createDocumentFragment();
						
						while (nb--) {
							domFrag.appendChild(itemRenderer.cloneNode(true));
						}
						
						node.replaceChild(domFrag, itemRenderer);
					}
			};
			
			plugin2 = {
					fill: jasmine.createSpy()
			};
			
			plugins = new Plugins;
			plugins.add("plugin1", plugin1);
			plugins.add("plugin2", plugin2);
		});
		
		
		it("should call plugins on expanded dom nodes", function () {
			template.innerHTML = '<ul data-plugin1="expand:5">' +
			'<li data-plugin2="fill"></li>' +
			'</ul>';
			spyOn(plugin1, "expand").andCallThrough();
			plugins.apply(template);
			expect(plugin1.expand.callCount).toEqual(1);
			expect(plugin2.fill.callCount).toEqual(5);
		});
		
		
						
		
	});
});