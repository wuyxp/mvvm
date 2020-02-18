/**
 * compile解析模板
 */

 class Compile{
   constructor(el, vm){
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if(this.$el){
      this.$fragment = this.node2Fragment(this.$el);
      this.init();
      this.$el.appendChild(this.$fragment);
    }
   }

   node2Fragment(el){
    const fragment = document.createDocumentFragment();
    let child;
    while(child = el.firstChild){
      fragment.appendChild(child);
    }
    return fragment;
   }

   init(){
     this.compileElement(this.$fragment);
   }

   compileElement(el){
     const child = el.childNodes;
     const me = this;
     [].slice.call(child).forEach(node => {
       const text = node.textContent;
       const reg = /\{\{(.*)\}\}/g;
       if(me.isElementNode(node)){
         me.compile(node);
       }else if(me.isTextNode(node) && reg.test(text)){
         me.compileText(node, RegExp.$1);
       }
       if(node.childNodes && node.childNodes.length){
         me.compileElement(node);
       }
     });
   }

   compile(node){
     const nodeAttrs = node.attributes;
     const me = this;

     [].slice.call(nodeAttrs).forEach(attr => {
       const attrName = attr.name;
       if(me.isDirective(attrName)){
         const exp = attr.value;
         const dir = attrName.substring(2);

         // 事件指令，还是普通指令
         if(me.isEventDirective(dir)){
           compileUtil.eventHandler(node, me.$vm, exp, dir);
         }else{
           compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);      
         }
         node.removeAttribute(attrName);
       }
     })
   }

   compileText(node, exp){
     compileUtil.text(node, this.$vm, exp);
   }
   //各种判断
   isDirective(attr){
     return /^v\-/.test(attr);
   }

   isEventDirective(dir){
     return /^on/.test(dir)
   }

   isElementNode(node){
     return node.nodeType === 1;
   }
   isTextNode(node){
     return node.nodeType === 3;
   }
 }
 const compileUtil = {
   text(node, vm, exp){
     this.bind(node, vm, exp, 'text')
   },
   html(node, vm, exp){
     this.bind(node, vm, exp, 'html')
   },
   model(node, vm, exp){
     this.bind(node, vm, exp, 'model');
     const me = this;
     let val = this._getVMVal(vm, exp);
     node.addEventListener('input', function(e){
       const newValue = e.target.value;
       if(val === newValue){
         return;
       }
       me._setVMVal(vm, exp, newValue);
       val =  newValue
     })
   },
   class(node, vm, exp){
     this.bind(node, vm, exp, 'class');
   },
   bind(node, vm, exp, dir){
     const updaterFn = updater[dir + 'Updater'];
     updaterFn && updaterFn(node, this._getVMVal(vm, exp));

     // TODO watcher
     new Watcher(vm, exp, function(value, oldValue){
       updaterFn && updaterFn(node, value, oldValue);
     })

   },
   eventHandler(node, vm, exp, dir){
     const eventType = dir.split(':')[1];
     const fn = vm.$option.methods && vm.$option.methods[exp];

     if(eventType && fn){
       node.addEventListener(eventType, fn.bind(vm), false);
     }
   },
   // TODO get和set看不懂
   // data.a.b.d = 'a'
   _getVMVal(vm, exp){
     let val = vm;
     exp = exp.split('.');
     exp.forEach(k => {
       val = val[k]
     });
     return val;
   },
   _setVMVal(vm, exp, value){
     let val = vm;
     exp = exp.split('.');
     exp.forEach(k => {
       if(k < exp.length -1) {
         val = val[k]
       }else{
         val[k] = value;
       }
     })
   }
 }
 
 const updater = {
   textUpdater(node, value){
     node.textContent = typeof value === 'undefined' ? '' : value;
   },
   htmlUpdater(node, value){
     node.innerHTML = typeof value === 'undefined' ? '' : value;
   },
   // TODO 看不懂这三个参数是怎么穿的
   classUpdater(node, value, oldValue){
     const className = node.className;
     className = className.replace(oldValue, '').replace(/\s$/, '');
     var space = className && String(value) ? ' ' : '';
     node.className = className + space + value;
   },

   modelUpdater(node, value, oldValue){
     node.value = typeof value === 'undefined' ? '' : value;
   }
 }
