function Olives(a){this.define=function(b,c,d){return a.declare("Olives."+b,typeof c=="string"?"Olives."+c:c,d)};this.create=function(b){return Object.create(a.require("Olives."+b))}}Olives=new Olives(Emily);Olives.define("Text","_base",function(){});Olives.define("_base",function(a){this.model=a.require("TinyStore").create();this.bind=function(b,c,a,e){return this.model.watch(c,a||function(a){b.innerHTML=a},e)};this.unbind=function(a){return this.model.unwatch(a)}});
