define("Olives/DomUtils",function(){return{getNodes:function(e,g){return e instanceof HTMLElement?(e.parentNode||document.createDocumentFragment().appendChild(e),e.parentNode.querySelectorAll(g||"*")):false},loopNodes:function(e,g,f){return e instanceof NodeList&&g instanceof Function?(Array.prototype.slice.call(e,0).forEach(g,f),true):false}}});define("Olives/Event-plugin",function(){return function(e){this.listen=function(g,f,h){g.addEventListener(f,function(f){e[h].call(e,f,g)},true)}}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(e,g,f,h){return function(i){var a=null;this.setModel=function(b){return b instanceof e?(a=b,true):false};this.getModel=function(){return a};this.ItemRenderer=function(a){var d=null;this.set=function(c){d=c;return true};this.get=function(){return d};this.associate=function(c,a){var b=d.cloneNode(true),e=h.getNodes(b);h.loopNodes(e,function(b){b.dataset[a+"_id"]=c});return b};this.set(a)};this.toList=function(b){var d,
c=new this.ItemRenderer(b.childNodes[0]);d=document.createDocumentFragment();a.loop(function(a,b){d.appendChild(this.plugins.apply(c.associate(b,this.plugins.name)))},this);b.replaceChild(d,b.childNodes[0]);a.watch("added",function(a){b.insertBefore(this.plugins.apply(c.associate(a,this.plugins.name)),b.childNodes[a])},this);a.watch("deleted",function(c){b.replaceChild(document.createTextNode(""),b.childNodes[c])})};this.bind=function(b,d,c){var c=c||"",e=b.dataset[this.plugins.name+"_id"],i=c.split("."),
g=e||i.shift(),h=e?c:i.join(".");if((c=f.getNestedProperty(a.get(g),h))||c===0)b[d]=c;a.watchValue(g,function(c){b[d]=f.getNestedProperty(c,h)})};this.set=function(b){return b instanceof HTMLElement&&b.name?(a.set(b.name,b.value),true):false};this.form=function d(d){if(d&&d.nodeName=="FORM"){var c=this;d.addEventListener("submit",function(a){h.loopNodes(d.querySelectorAll("[name]"),c.set,c);a.preventDefault()},true);return true}else return false};this.fromValue=function(d){return d&&d instanceof HTMLElement?
(this.set(d),d.addEventListener("change",function(){a.set(d.name,d.value)},true),true):false};this.setModel(i)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins"],function(e,g,f){return function(h){var i=function(c){c=c.UI;if(c.template)c.dom=b,typeof c.template=="string"?c.dom.innerHTML=c.template:c.template instanceof HTMLElement&&c.dom.appendChild(c.template),c.plugins.apply(c.dom),c.onRender&&c.onRender();else throw Error("UI.template must be set prior to render");},a=function(c){var a=c.UI;c.params&&c.params.appendChild(a.dom);a.onPlace&&a.onPlace()},b=document.createElement("div"),d=new e("Init",
{Init:[["render",i,this,"Rendered"],["place",function(c){i(c);a(c)},this,"Rendered"]],Rendered:[["place",a,this],["render",i,this]]});this.model=h instanceof g?h:new g;this.plugins=new f;this.dom=this.template=null;this.onRender=function(){};this.action=function(a,b){d.event(a,{UI:this,params:b})};this.onPlace=function(){}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(e,g){return function(){var f={},h=function(a){return a.trim()},i=function(a,b,d){b.split(";").forEach(function(c){var b=c.split(":"),c=b[0].trim(),b=b[1]?b[1].split(",").map(h):[];b.unshift(a);f[d]&&f[d][c]&&f[d][c].apply(f[d],b)})};this.add=function(a,b){var d=this;return typeof a=="string"&&typeof b=="object"&&b?(f[a]=b,b.plugins={name:a,apply:function(){return d.apply.apply(d,arguments)}},true):false};this.get=function(a){return f[a]};
this.del=function(a){return delete f[a]};this.apply=function(a){var b;return a instanceof HTMLElement?(b=g.getNodes(a),e.loop(e.toArray(b),function(a){e.loop(a.dataset,function(c,b){i(a,c,b)})}),a):false}}});
define("Olives/Type-plugin",["Olives/OObject","Tools"],function(e,g){return function(f){var h={};this.place=function(f,a){if(h[a]instanceof e)h[a].action("place",f);else throw Error(a+" is not an OObject UI in place:"+a);};this.set=function(f,a){return typeof f=="string"&&a instanceof e?(h[f]=a,true):false};this.setAll=function(e){g.loop(e,function(a,b){this.set(b,a)},this)};this.get=function(e){return h[e]};this.setAll(f)}});
