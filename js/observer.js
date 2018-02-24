/**
 * 观察者类
 * 全部将数据进行监听
 * get时进行depend事件
 * set时进行notify事件
 */
class Observer{
  constructor(data){
    this.data = data;
    this.walk(data);
  }

  walk(data){
    const me = this;
    Object.keys(data).forEach(key => me.conver(key, data[key]))
  }

  conver(key, value){
    this.defineReactive(this.data, key, value);
  }

  defineReactive(data, key, value){
    const dep = new Dep();
    let childObj = observer(value);

    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get(){
        if(Dep.target){
          dep.depend();
        }
        return value;
      },
      set(newValue){
        if(value === newValue){
          return false;
        }
        value = newValue;

        // 如果新的值还是object的话，继续监听
        childObj = observer(newValue);
        dep.notify();
      }
    })
  }
}

/**
 * 观察者工厂函数
 */
function observer(value, vm){
  if(!value || typeof value !== 'object' || typeof value === 'null'){
    return;
  }
  return new Observer(value);
}


/**
 * Dep 对象
 * 
 * 订阅发布在这里执行
 */

let uid = 0;

class Dep{
  constructor(){
    this.id = uid++;
    this.subs = [];
  }

  addSub(sub){
    this.subs.push(sub)
  }

  depend(){
    if(Dep.target && typeof Dep.target.addDep === 'function'){
      Dep.target.addDep(this);
    }
  }

  removeSub(sub){
    const index = this.subs.indexOf(sub);
    if(index !== -1) {
      this.subs.splice(index, 1)
    }
  }

  notify(){
    this.subs.forEach(sub => sub.update());
  }
}

Dep.target = null;