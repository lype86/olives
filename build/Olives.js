/*
 Olives

 The MIT License (MIT)

 Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
 and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial 
 portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
*/
define("Olives/DomUtils",["Tools"],function(){return{getNodes:function(i,k){return i instanceof HTMLElement?(i.parentNode||document.createDocumentFragment().appendChild(i),i.parentNode.querySelectorAll(k||"*")):false}}});define("Olives/Event-plugin",function(){return function(i){this.listen=function(k,f,h,b){k.addEventListener(f,function(a){i[h].call(i,a,k)},b=="true")}}});
define("Olives/LocalStore",["Store","Tools"],function(i,k){function f(){var f=null,b=function(){localStorage.setItem(f,this.toJSON())};this.sync=function(a){return typeof a=="string"?(f=a,a=JSON.parse(localStorage.getItem(a)),k.loop(a,function(g,a){this.has(a)||this.set(a,g)},this),b.call(this),true):false};this.watch("added",b,this);this.watch("updated",b,this);this.watch("deleted",b,this)}return function(h){f.prototype=new i(h);return new f}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(i,k,f,h){return function(b,a){var g=null,c={},j={};this.observers={};this.setModel=function(a){return a instanceof i?(g=a,true):false};this.getModel=function(){return g};this.ItemRenderer=function(a,e){var d=null,c=null,b=null,m=null,j=null;this.setRenderer=function(a){d=a;return true};this.getRenderer=function(){return d};this.setRootNode=function(a){return a instanceof HTMLElement?(b=a,a=b.querySelector("*"),
this.setRenderer(a),a&&b.removeChild(a),true):false};this.getRootNode=function(){return b};this.setPlugins=function(a){c=a;return true};this.getPlugins=function(){return c};this.items=new i([]);this.setStart=function(a){return m=parseInt(a,10)};this.getStart=function(){return m};this.setNb=function(a){return j=a=="*"?a:parseInt(a,10)};this.getNb=function(){return j};this.addItem=function(a){var d;return typeof a=="number"&&!this.items.get(a)?(d=this.create(a))?(b.insertBefore(d,this.getNextItem(a)),
true):false:false};this.getNextItem=function(a){return this.items.alter("slice",a+1).filter(function(a){if(a instanceof HTMLElement)return true})[0]};this.removeItem=function(a){var d=this.items.get(a);return d?(b.removeChild(d),this.items.set(a),true):false};this.create=function(a){if(g.has(a)){var e=d.cloneNode(true),l=h.getNodes(e);f.toArray(l).forEach(function(d){d.dataset[c.name+"_id"]=a});this.items.set(a,e);c.apply(e);return e}};this.render=function(){var a=j=="*"?g.getNbItems():j,d=[];if(j!==
null&&m!==null){this.items.loop(function(e,l){(l<m||l>=m+a||!g.has(l))&&d.push(l)},this);d.sort(f.compareNumbers).reverse().forEach(this.removeItem,this);for(var e=m,l=a+m;e<l;e++)this.addItem(e);return true}else return false};this.setPlugins(a);this.setRootNode(e)};this.setItemRenderer=function(a,e){j[a||"default"]=e};this.getItemRenderer=function(a){return j[a]};this.foreach=function(a,e,d,c){var b=new this.ItemRenderer(this.plugins,a);b.setStart(d||0);b.setNb(c||"*");b.render();g.watch("added",
b.render,b);g.watch("deleted",function(a){b.render();this.observers[a]&&this.observers[a].forEach(function(a){g.unwatchValue(a)},this);delete this.observers[a]},this);this.setItemRenderer(e,b)};this.updateStart=function(a,e){var d=this.getItemRenderer(a);return d?(d.setStart(e),true):false};this.updateNb=function(a,e){var d=this.getItemRenderer(a);return d?(d.setNb(e),true):false};this.refresh=function(a){return(a=this.getItemRenderer(a))?(a.render(),true):false};this.bind=function(a,e,d){var d=d||
"",c=a.dataset[this.plugins.name+"_id"],b=d.split("."),j=c||b.shift(),i=c?d:b.join("."),c=f.getNestedProperty(g.get(j),i),h=f.toArray(arguments).slice(3);if(c||c===0||c===false)this.execBinding.apply(this,[a,e,c].concat(h))||(a[e]=c);this.hasBinding(e)||a.addEventListener("change",function(){if(i){var c=g.get(j);f.setNestedProperty(c,d,a[e]);g.set(j,c)}else g.set(j,a[e])},true);this.observers[j]=this.observers[j]||[];this.observers[j].push(g.watchValue(j,function(d){this.execBinding.apply(this,[a,
e,f.getNestedProperty(d,i)].concat(h))||(a[e]=f.getNestedProperty(d,i))},this))};this.set=function(a){return a instanceof HTMLElement&&a.name?(g.set(a.name,a.value),true):false};this.form=function e(e){if(e&&e.nodeName=="FORM"){var a=this;e.addEventListener("submit",function(c){f.toArray(e.querySelectorAll("[name]")).forEach(a.set,a);c.preventDefault()},true);return true}else return false};this.addBinding=function(a,d){return a&&typeof a=="string"&&typeof d=="function"?(c[a]=d,true):false};this.execBinding=
function(a,d){return this.hasBinding(d)?(c[d].apply(a,Array.prototype.slice.call(arguments,2)),true):false};this.hasBinding=function(a){return c.hasOwnProperty(a)};this.getBinding=function(a){return c[a]};this.addBindings=function(a){return f.loop(a,function(a,c){this.addBinding(c,a)},this)};this.setModel(b);this.addBindings(a)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils","Tools"],function(i,k,f,h,b){return function(a){var g=function(a){var d=j||document.createElement("div");if(a.template){typeof a.template=="string"?d.innerHTML=a.template.trim():a.template instanceof HTMLElement&&d.appendChild(a.template);if(d.childNodes.length>1)throw Error("UI.template should have only one parent node");else a.dom=d.childNodes[0];a.plugins.apply(a.dom)}else throw Error("UI.template must be set prior to render");
},c=function d(a,d,c){d&&(d.insertBefore(a.dom,c),j=d)},j=null,h=new i("Init",{Init:[["render",g,this,"Rendered"],["place",function(a,j){g(a);c.apply(null,b.toArray(arguments))},this,"Rendered"]],Rendered:[["place",c,this],["render",g,this]]});this.model=a instanceof k?a:new k;this.plugins=new f;this.dom=this.template=null;this.place=function(a,c){h.event("place",this,a,c)};this.render=function(){h.event("render",this)};this.setTemplateFromDom=function(a){return a instanceof HTMLElement?(this.template=
a,true):false};this.alive=function(a){return a instanceof HTMLElement?(this.setTemplateFromDom(a),this.place(a.parentNode,a.nextElementSibling),true):false}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(i,k){return function(){var f={},h=function(a){return a.trim()},b=function(a,g,c){g.split(";").forEach(function(g){var b=g.split(":"),g=b[0].trim(),b=b[1]?b[1].split(",").map(h):[];b.unshift(a);f[c]&&f[c][g]&&f[c][g].apply(f[c],b)})};this.add=function(a,g){var c=this;return typeof a=="string"&&typeof g=="object"&&g?(f[a]=g,g.plugins={name:a,apply:function(){return c.apply.apply(c,arguments)}},true):false};this.addAll=function(a){return i.loop(a,
function(a,c){this.add(c,a)},this)};this.get=function(a){return f[a]};this.del=function(a){return delete f[a]};this.apply=function(a){var g;return a instanceof HTMLElement?(g=k.getNodes(a),i.loop(i.toArray(g),function(a){i.loop(a.dataset,function(g,f){b(a,g,f)})}),a):false}}});
define("Olives/Transport",["Observable"],function(i){return function(k,f){var h=null,b=null,a=new i;this.setIO=function(a){return a&&typeof a.connect=="function"?(b=a,true):false};this.getIO=function(){return b};this.connect=function(a){return typeof a=="string"?(h=b.connect(a),true):false};this.getSocket=function(){return h};this.on=function(a,c){h.on(a,c)};this.once=function(a,c){h.once(a,c)};this.emit=function(a,c,b){h.emit(a,c,b)};this.request=function(a,c,b,f){var e=Date.now()+Math.floor(Math.random()*
1E6),d=function(){b&&b.apply(f||null,arguments)};h[c.keptAlive?"on":"once"](e,d);c.__eventId__=e;h.emit(a,c);if(c.keptAlive)return function(){h.emit("disconnect-"+e);h.removeListener(e,d)}};this.listen=function(b,c,f,i){var e=b+"/"+c,d,h;a.hasTopic(e)||(h=this.request(b,{path:c,method:"GET",keptAlive:true},function(b){a.notify(e,b)},this));d=a.watch(e,f,i);return function(){a.unwatch(d);a.hasTopic(e)||h()}};this.getListenObservable=function(){return a};this.setIO(k);this.connect(f)}});
define("Olives/Type-plugin",["Olives/OObject","Tools"],function(i,k){return function(f){var h={};this.place=function(b,a){if(h[a]instanceof i)h[a].place(b);else throw Error(a+" is not an OObject UI in place:"+a);};this.set=function(b,a){return typeof b=="string"&&a instanceof i?(h[b]=a,true):false};this.setAll=function(b){k.loop(b,function(a,b){this.set(b,a)},this)};this.get=function(b){return h[b]};this.setAll(f)}});
