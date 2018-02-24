/**
 * 
 * @param {Object} option 
 * 
 * 初始化data数据
 * 初始化computed数据
 * 
 */
class MVVM {
  constructor(option = {}){
    // 初始化参数
    this.$option = option;
    let data = this._data = this.$option.data;
    const me = this;

    // 数据代理
    Object.keys(data).forEach(key => me._proxyData(key));

    // 计算属性
    this._initComputed();

    // 数据监听
    observer(data, me);

    // 编译器
    this.$compile = new Compile(option.el || document.body, me);
  }

  _proxyData(key, setter, getter){
    const me = this;
    setter = setter || 
    Object.defineProperty(me, key, {
      configurable: false,
      enumerable: true,
      get(){
        return me._data[key];
      },
      set(newVal){
        me._data[key] = newVal;
      }
    })
  }

  _initComputed(){
    const me = this;
    const computed = this.$option.computed;
    if(typeof computed === 'object' && typeof computed !== 'null'){
      Object.keys(computed).forEach(key => {
        Object.defineProperty(me, key, {
          get(){
            return typeof computed[key] === 'function' ? computed[key] : computed[key].get;
          },
          set(){}
        })  
      })
    }
  }
}