define("Olives/Model-plugin", 
		
["Store", "Observable", "Tools", "Olives/DomUtils"],
		
/**
 * @class
 * This plugin links dom nodes to a model
 * @requires Store, Observable
 */
function ModelPlugin(Store, Observable, Tools, DomUtils) {
	
	return function ModelPluginConstructor($model) {
		
		/**
		 * The model to watch
		 * @private
		 */
		var _model = null;
		
		/**
		 * Define the model to watch for
		 * @param {Store} model the model to watch for changes
		 * @returns {Boolean} true if the model was set
		 */
		this.setModel = function setModel(model) {
			if (model instanceof Store) {
				// Set the model
				_model = model;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the store that is watched for
		 * @returns the Store
		 */
		this.getModel = function getModel() {
			return _model;
		};
		
		/**
		 * The item renderer defines a dom node that can be duplicated
		 * It is made available for debugging purpose, don't use it
		 * @private
		 */
		this.ItemRenderer = function ItemRenderer(item) {
			
			var _node = null;
			
			/**
			 * Set the duplicated node
			 * @private
			 */
			this.set = function set(node) {
				_node = node;
				return true;
			};
			
			/**
			 * @private
			 * @returns the node that is duplicated
			 */
			this.get = function get() {
				return _node;
			};
			
			/**
			 * Associate the duplicated node to an item in the model
			 * @private
			 * @param id
			 * @param pluginName
			 * @returns the associated node
			 */
			this.associate = function associate(id, pluginName, hey) {
				var newNode = _node.cloneNode(true);
				var nodes = DomUtils.getNodes(newNode);

				
				DomUtils.loopNodes(nodes, function (child) {
            			child.dataset[pluginName+"_id"] = id;
				});
				return newNode;
			};
			
			this.set(item);			
		};
		
		/**
		 * Expands the inner dom nodes of a given dom node, filling it with model's values
		 * @param {HTMLElement} node the dom node to apply toList to
		 */
		this.toList = function toList(node) {
			var domFragment,
				itemRenderer = new this.ItemRenderer(node.childNodes[0]);

	
			domFragment = document.createDocumentFragment();
            _model.loop(function (value, idx) {
                    domFragment.appendChild(this.plugins.apply(itemRenderer.associate(idx, this.plugins.name)));
            }, this);
            

	         node.replaceChild(domFragment, node.childNodes[0]);
            
            _model.watch("added", function (idx, value) {
                node.insertBefore(this.plugins.apply(itemRenderer.associate(idx, this.plugins.name)), node.childNodes[idx]);
            }, this);
            
            _model.watch("deleted", function (idx) {
                    // The document.childNodes indexes need to be preserved,
                    // so I replace the nodes with empty ones.
                    node.replaceChild(document.createTextNode(""), node.childNodes[idx]);
            });


         };
		
		/**
		 * Both ways binding between a dom node attributes and the model
		 * @param {HTMLElement} node the dom node to apply the plugin to
		 * @param {String} name the name of the property to look for in the model's value
		 * @returns
		 */
		this.bind = function bind(node, property, name) {
			
			// Name can be unset if the value of a row is plain text
			name = name || "";

			// In case of an array-like model the id is the index of the model's item to look for.
			// The _id is added by the toList function
			var id = node.dataset[this.plugins.name+"_id"],
			
			// Else, it is the first element of the following
			split = name.split("."),
			
			// So the index of the model is either id or the first element of split
			modelIdx = id || split.shift(),
			
			// And the name of the property to look for in the value is
			prop = id ? name : split.join("."),
			
			// Get the model's value
			get =  Tools.getNestedProperty(_model.get(modelIdx), prop);
			
			// If truthy but 0 is a proper value too
			if (get || get === 0) {
				node[property] = get;
			}
			
			// Watch for changes
			_model.watchValue(modelIdx, function (value) {
					node[property] = Tools.getNestedProperty(value, prop);
			});
		};
		
		/**
		 * Set the node's value into the model, the name is the model's property
		 * @param {HTMLElement} node
		 * @returns true if the property is added
		 */
		this.set = function set(node) {
			if (node instanceof HTMLElement && node.name) {
				_model.set(node.name, node.value);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Prevents the submit and set the model with all form's inputs
		 * @param {HTMLFormElement} form
		 * @returns true if valid form
		 */
		this.form = function form(form) {
			if (form && form.nodeName == "FORM") {
				var that = this;
				form.addEventListener("submit", function (event) {
					DomUtils.loopNodes(form.querySelectorAll("[name]"), that.set, that);
					event.preventDefault();
				}, true);
				return true;
			} else {
				return false;
			}
		};
	
		// Inits the model
		this.setModel($model);
		
		
	};
	
});