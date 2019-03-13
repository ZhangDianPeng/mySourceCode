#### 自己实现Promise
```javascript
let {MyPromise} = require('./index');
let p1 = MyPromise.resolve(3);
let p2 = new MyPromise(function(res, rej){
    setTimeout(function(){
        res('hello-world');
    }, 1000);
})

```
