let MyPromise = function(executor){
    let self = this;
    self.data = null;
    self.status = 'pending';
    self.resolvedCallbacks = [];
    self.rejectedCallbacks = [];

    let resolve = function(value){
        if(self.status === 'pending'){
            self.status = 'resolved';
            if(value instanceof MyPromise){
                value.then(resolve, reject);
            }else{
                self.data = value;
                for(let cb of self.resolvedCallbacks){
                    cb(self.data);
                }
            }
        }
    };

    let reject = function(reason){
        if(self.status === 'pending'){
            self.status = 'rejected';
            self.data = reason;
            if(!self.rejectedCallbacks.length){
                throw new Error('unhandled promise')
            }
            for(let cb of self.rejectedCallbacks){
                cb(self.data);
            }
        }
    };

    try{
        executor(resolve, reject);
    }catch(err){
        reject(err);
    }
};

let resolvePromise = function(data, resolve, reject){
    if(data instanceof MyPromise){
        data.then(resolve, reject);
    }else{
        resolve(data);
    }
};

MyPromise.prototype.then = function(onResolved, onRejected){
    onResolved = typeof onResolved === 'function' ? onResolved : a => a;
    onRejected = typeof onRejected === 'function' ? onRejected : a => a;
    let self = this;
    if(self.status === 'resolved'){
        return new MyPromise(function(resolve, reject){
            process.nextTick(function(){
                try{
                    let data = onResolved(self.data);
                    resolvePromise(data, resolve, reject);
                }catch(err){
                    reject(data);
                }
            });
        });
    }else if(self.status === 'rejected'){
        return new MyPromise(function(resolve, reject){
            process.nextTick(function(){
                try{
                    let data = onRejected(self.data);
                    resolvePromise(data, resolve, reject);
                }catch(err){
                    reject(err);
                }
            });
        });
    }else{
        return new MyPromise(function(resolve, reject){
            self.resolvedCallbacks.push(function(data){
                process.nextTick(function(){
                    try{
                        resolve(onResolved(data))
                    }catch(err){
                        reject(err);
                    }
                });
            });
            self.rejectedCallbacks.push(function(reason){
                process.nextTick(function(){
                    try{
                        resolve(onRejected(reason))
                    }catch(err){
                        reject(err);
                    }
                })
            });
        });
    }
};

MyPromise.prototype.catch = function(onRejected){
    return MyPromise.prototype.then(null, onRejected);
};

MyPromise.prototype.resolve = function(data){
    return MyPromise(function(res, rej){
        res(data);
    });
};

MyPromise.prototype.reject = function(reason){
    return MyPromise(function(res, rej){
        rej(reason);
    });
};

MyPromise.prototype.all = function(promises){
    let resolvedLength = 0;
    let resolvedArr = [];
    return new MyPromise(function(res, rej){
        promises.forEach((p, index) => {
            p.then(data => {
                resolvedArr[index] = data;
                if(++resolvedLength === promises.length){
                    res(resolvedArr);
                }
            }, rej);
        });
    })
};

MyPromise.prototype.race = function(promises){
    return new MyPromise(function(res, rej){
        promises.forEach((p) => {
            p.then(res, rej);
        });
    })
};

