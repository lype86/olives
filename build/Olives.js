define("Olives/DomUtils",function(){return{getNodes:function(c,f){return c instanceof HTMLElement?(c.parentNode||document.createDocumentFragment().appendChild(c),c.parentNode.querySelectorAll(f||"*")):false},loopNodes:function(c,f,g){return c instanceof NodeList&&f instanceof Function?(Array.prototype.slice.call(c,0).forEach(f,g),true):false}}});define("Olives/Event-plugin",function(){return function(c){this.listen=function(f,g,h,d){f.addEventListener(g,function(a){c[h].call(c,a,f)},d=="true")}}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(c,f,g,h){return function(d){var a=null;this.setModel=function(b){return b instanceof c?(a=b,true):false};this.getModel=function(){return a};this.ItemRenderer=function(a){var e=null;this.set=function(i){e=i;return true};this.get=function(){return e};this.associate=function(i,a){var b=e.cloneNode(true),c=h.getNodes(b);h.loopNodes(c,function(b){b.dataset[a+"_id"]=i});return b};this.set(a)};this.toList=function(b){var e,
i=b.querySelector("*"),j=new this.ItemRenderer(i);e=document.createDocumentFragment();a.loop(function(a,i){e.appendChild(this.plugins.apply(j.associate(i,this.plugins.name)))},this);b.replaceChild(e,i);a.watch("added",function(a){b.insertBefore(this.plugins.apply(j.associate(a,this.plugins.name)),b.childNodes[a])},this);a.watch("deleted",function(a){b.replaceChild(document.createTextNode(""),b.childNodes[a])})};this.bind=function(b,e,i){var i=i||"",j=b.dataset[this.plugins.name+"_id"],c=i.split("."),
d=j||c.shift(),f=j?i:c.join(".");if((j=g.getNestedProperty(a.get(d),f))||j===0)b[e]=j;b.addEventListener("change",function(){if(f){var c=a.get(d);g.setNestedProperty(c,i,b[e]);a.set(d,c)}else a.set(d,b[e])},true);a.watchValue(d,function(a){b[e]=g.getNestedProperty(a,f)})};this.set=function(b){return b instanceof HTMLElement&&b.name?(a.set(b.name,b.value),true):false};this.form=function e(e){if(e&&e.nodeName=="FORM"){var a=this;e.addEventListener("submit",function(c){h.loopNodes(e.querySelectorAll("[name]"),
a.set,a);c.preventDefault()},true);return true}else return false};this.setModel(d)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils"],function(c,f,g,h){return function(d){var a=function(a){a=a.UI;if(a.template)typeof a.template=="string"?a.dom.innerHTML=a.template:a.template instanceof HTMLElement&&a.dom.appendChild(a.template),a.plugins.apply(a.dom),a.onRender&&a.onRender();else throw Error("UI.template must be set prior to render");},b=function(a){var b=a.UI;if(a.params)h.loopNodes(b.dom.childNodes,function(b){a.params.appendChild(b)}),b.dom=a.params;
b.onPlace&&b.onPlace()},e=new c("Init",{Init:[["render",a,this,"Rendered"],["place",function(c){a(c);b(c)},this,"Rendered"]],Rendered:[["place",b,this],["render",a,this]]});this.model=d instanceof f?d:new f;this.plugins=new g;this.template=null;this.dom=document.createElement("div");this.onRender=function(){};this.action=function(a,b){e.event(a,{UI:this,params:b})};this.onPlace=function(){}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(c,f){return function(){var g={},h=function(a){return a.trim()},d=function(a,b,c){b.split(";").forEach(function(b){var d=b.split(":"),b=d[0].trim(),d=d[1]?d[1].split(",").map(h):[];d.unshift(a);g[c]&&g[c][b]&&g[c][b].apply(g[c],d)})};this.add=function(a,b){var c=this;return typeof a=="string"&&typeof b=="object"&&b?(g[a]=b,b.plugins={name:a,apply:function(){return c.apply.apply(c,arguments)}},true):false};this.get=function(a){return g[a]};
this.del=function(a){return delete g[a]};this.apply=function(a){var b;return a instanceof HTMLElement?(b=f.getNodes(a),c.loop(c.toArray(b),function(a){c.loop(a.dataset,function(b,c){d(a,b,c)})}),a):false}}});
define("Olives/Type-plugin",["Olives/OObject","Tools"],function(c,f){return function(g){var h={};this.place=function(d,a){if(h[a]instanceof c)h[a].action("place",d);else throw Error(a+" is not an OObject UI in place:"+a);};this.set=function(d,a){return typeof d=="string"&&a instanceof c?(h[d]=a,true):false};this.setAll=function(c){f.loop(c,function(a,b){this.set(b,a)},this)};this.get=function(c){return h[c]};this.setAll(g)}});
