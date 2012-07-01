/*
 Olives ${VERSION} http://flams.github.com/olives
 The MIT License (MIT)
 Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
*/
define("Olives/DomUtils",function(){return{getNodes:function(c,e){return this.isAcceptedType(c)?(c.parentNode||document.createDocumentFragment().appendChild(c),c.parentNode.querySelectorAll(e||"*")):false},getDataset:function(c){var e=0,h,i={},d,b;if(this.isAcceptedType(c))if(c.hasOwnProperty("dataset"))return c.dataset;else{for(h=c.attributes.length;e<h;e++)d=c.attributes[e].name.split("-"),d.shift()=="data"&&(i[b=d.join("-")]=c.getAttribute("data-"+b));return i}else return false},isAcceptedType:function(c){return c instanceof
HTMLElement||c instanceof SVGElement?true:false},setAttribute:function(c,e,h){return c instanceof HTMLElement?(c[e]=h,true):c instanceof SVGElement?(c.setAttribute(e,h),true):false}}});define("Olives/Event-plugin",function(){return function(c){this.listen=function(e,h,i,d){e.addEventListener(h,function(b){c[i].call(c,b,e)},d=="true")}}});
define("Olives/LocalStore",["Store","Tools"],function(c,e){function h(){var c=null,d=localStorage,b=function(){d.setItem(c,this.toJSON())};this.setLocalStorage=function(g){return g&&g.setItem instanceof Function?(d=g,true):false};this.getLocalStorage=function(){return d};this.sync=function(g){return typeof g=="string"?(c=g,g=JSON.parse(d.getItem(g)),e.loop(g,function(g,b){this.has(b)||this.set(b,g)},this),b.call(this),this.watch("added",b,this),this.watch("updated",b,this),this.watch("deleted",b,
this),true):false}}return function(i){h.prototype=new c(i);return new h}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(c,e,h,i){return function(d,b){var g=null,e={},k={};this.observers={};this.setModel=function(a){return a instanceof c?(g=a,true):false};this.getModel=function(){return g};this.ItemRenderer=function(a,j){var f=null,b=null,d=null,e=null,k=null;this.setRenderer=function(a){f=a;return true};this.getRenderer=function(){return f};this.setRootNode=function(a){return i.isAcceptedType(a)?(d=a,a=d.querySelector("*"),this.setRenderer(a),
a&&d.removeChild(a),true):false};this.getRootNode=function(){return d};this.setPlugins=function(a){b=a;return true};this.getPlugins=function(){return b};this.items=new c([]);this.setStart=function(a){return e=parseInt(a,10)};this.getStart=function(){return e};this.setNb=function(a){return k=a=="*"?a:parseInt(a,10)};this.getNb=function(){return k};this.addItem=function(a){var f;return typeof a=="number"&&!this.items.get(a)?(f=this.create(a))?((a=this.getNextItem(a))?d.insertBefore(f,a):d.appendChild(f),
true):false:false};this.getNextItem=function(a){return this.items.alter("slice",a+1).filter(function(a){if(i.isAcceptedType(a))return true})[0]};this.removeItem=function(a){var f=this.items.get(a);return f?(d.removeChild(f),this.items.set(a),true):false};this.create=function(a){if(g.has(a)){var j=f.cloneNode(true),d=i.getNodes(j);h.toArray(d).forEach(function(f){f.setAttribute("data-"+b.name+"_id",a)});this.items.set(a,j);b.apply(j);return j}};this.render=function(){var a=k=="*"?g.getNbItems():k,
f=[];if(k!==null&&e!==null){this.items.loop(function(j,b){(b<e||b>=e+a||!g.has(b))&&f.push(b)},this);f.sort(h.compareNumbers).reverse().forEach(this.removeItem,this);for(var j=e,b=a+e;j<b;j++)this.addItem(j);return true}else return false};this.setPlugins(a);this.setRootNode(j)};this.setItemRenderer=function(a,b){k[a||"default"]=b};this.getItemRenderer=function(a){return k[a]};this.foreach=function(a,b,f,d){var c=new this.ItemRenderer(this.plugins,a);c.setStart(f||0);c.setNb(d||"*");c.render();g.watch("added",
c.render,c);g.watch("deleted",function(a){c.render();this.observers[a]&&this.observers[a].forEach(function(a){g.unwatchValue(a)},this);delete this.observers[a]},this);this.setItemRenderer(b,c)};this.updateStart=function(a,b){var f=this.getItemRenderer(a);return f?(f.setStart(b),true):false};this.updateNb=function(a,b){var f=this.getItemRenderer(a);return f?(f.setNb(b),true):false};this.refresh=function(a){return(a=this.getItemRenderer(a))?(a.render(),true):false};this.bind=function(a,b,f){var f=f||
"",c=a.getAttribute("data-"+this.plugins.name+"_id"),d=f.split("."),e=c||d.shift(),k=c?f:d.join("."),c=h.getNestedProperty(g.get(e),k),l=h.toArray(arguments).slice(3);if(c||c===0||c===false)this.execBinding.apply(this,[a,b,c].concat(l))||i.setAttribute(a,b,c);this.hasBinding(b)||a.addEventListener("change",function(){g.has(e)&&(k?g.update(e,f,a[b]):g.set(e,a[b]))},true);this.observers[e]=this.observers[e]||[];this.observers[e].push(g.watchValue(e,function(f){this.execBinding.apply(this,[a,b,h.getNestedProperty(f,
k)].concat(l))||i.setAttribute(a,b,h.getNestedProperty(f,k))},this))};this.set=function(a){return i.isAcceptedType(a)&&a.name?(g.set(a.name,a.value),true):false};this.form=function j(j){if(j&&j.nodeName=="FORM"){var b=this;j.addEventListener("submit",function(c){h.toArray(j.querySelectorAll("[name]")).forEach(b.set,b);c.preventDefault()},true);return true}else return false};this.addBinding=function(b,f){return b&&typeof b=="string"&&typeof f=="function"?(e[b]=f,true):false};this.execBinding=function(b,
f){return this.hasBinding(f)?(e[f].apply(b,Array.prototype.slice.call(arguments,2)),true):false};this.hasBinding=function(b){return e.hasOwnProperty(b)};this.getBinding=function(b){return e[b]};this.addBindings=function(b){return h.loop(b,function(b,c){this.addBinding(c,b)},this)};this.setModel(d);this.addBindings(b)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils","Tools"],function(c,e,h,i,d){return function(b){var g=function(a){var b=k||document.createElement("div");if(a.template){typeof a.template=="string"?b.innerHTML=a.template.trim():i.isAcceptedType(a.template)&&b.appendChild(a.template);if(b.childNodes.length>1)throw Error("UI.template should have only one parent node");else a.dom=b.childNodes[0];a.plugins.apply(a.dom)}else throw Error("UI.template must be set prior to render");
},l=function f(a,f,b){f&&(b?f.insertBefore(a.dom,b):f.appendChild(a.dom),k=f)},k=null,a=new c("Init",{Init:[["render",g,this,"Rendered"],["place",function(a,b){g(a);l.apply(null,d.toArray(arguments))},this,"Rendered"]],Rendered:[["place",l,this],["render",g,this]]});this.model=b instanceof e?b:new e;this.plugins=new h;this.dom=this.template=null;this.place=function(b,c){a.event("place",this,b,c)};this.render=function(){a.event("render",this)};this.setTemplateFromDom=function(a){return i.isAcceptedType(a)?
(this.template=a,true):false};this.alive=function(a){return i.isAcceptedType(a)?(this.setTemplateFromDom(a),this.place(a.parentNode,a.nextElementSibling),true):false}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(c,e){return function(){var h={},i=function(b){return b.trim()},d=function(b,c,d){c.split(";").forEach(function(c){var a=c.split(":"),c=a[0].trim(),a=a[1]?a[1].split(",").map(i):[];a.unshift(b);h[d]&&h[d][c]&&h[d][c].apply(h[d],a)})};this.add=function(b,c){var d=this;return typeof b=="string"&&typeof c=="object"&&c?(h[b]=c,c.plugins={name:b,apply:function(){return d.apply.apply(d,arguments)}},true):false};this.addAll=function(b){return c.loop(b,
function(b,c){this.add(c,b)},this)};this.get=function(b){return h[b]};this.del=function(b){return delete h[b]};this.apply=function(b){var g;return e.isAcceptedType(b)?(g=e.getNodes(b),c.loop(c.toArray(g),function(b){c.loop(e.getDataset(b),function(c,a){d(b,c,a)})}),b):false}}});
define("Olives/Transport",["Observable","Tools"],function(c,e){return function(h,i){var d=null,b=null,g=new c,l={};this.setIO=function(c){return c&&typeof c.connect=="function"?(b=c,true):false};this.getIO=function(){return b};this.connect=function(c){return typeof c=="string"?(d=b.connect(c),true):false};this.getSocket=function(){return d};this.on=function(b,a){d.on(b,a)};this.once=function(b,a){d.once(b,a)};this.emit=function(b,a,c){d.emit(b,a,c)};this.request=function(b,a,c,f){var e=Date.now()+
Math.floor(Math.random()*1E6),g=function(){c&&c.apply(f||null,arguments)};d[a.__keepalive__?"on":"once"](e,g);a.__eventId__=e;d.emit(b,a);if(a.__keepalive__)return function(){d.emit("disconnect-"+e);d.removeListener(e,g)}};this.listen=function(b,a,c,d){var h=b+"/"+a.path,i;g.hasTopic(h)||(e.mixin({method:"GET",__keepalive__:true},a),l[h]=this.request(b,a,function(a){g.notify(h,a)},this));i=g.watch(h,c,d);return function(){g.unwatch(i);if(!g.hasTopic(h))l[h]()}};this.getStopFunctions=function(){return l};
this.getListenObservable=function(){return g};this.setIO(h);this.connect(i)}});define("Olives/UI-plugin",["Olives/OObject","Tools"],function(c,e){return function(h){var i={};this.place=function(d,b){if(i[b]instanceof c)i[b].place(d);else throw Error(b+" is not an OObject UI in place:"+b);};this.set=function(d,b){return typeof d=="string"&&b instanceof c?(i[d]=b,true):false};this.setAll=function(c){e.loop(c,function(b,c){this.set(c,b)},this)};this.get=function(c){return i[c]};this.setAll(h)}});
