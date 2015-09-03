/**
 * 
 * 
 */
(function (root, factory) {
    
    "use strict";

    /**
     * Generate shuffle states.
     */
    var Chaoser = function (stepCounts) {
        // make chaoser singleton.
        if (Chaoser.instance !== undefined) {
            return Chaoser.instance; 
        }
        
        this.stepCounts = stepCounts || 25;
        Chaoser.instance = this;
    };
    
    Chaoser.prototype.gen = function () {

        var result = [],
            curAction = '',
            i,
            
            isSlice = function (cur, prev) {
                return Math.floor(cur / 2) === Math.floor(prev / 2);
            },
            
            checkMove = function (action) {
        
                var len = result.length;

                // The curAction is the same as the last one in result;
                return (action === result[len - 1])
                    /*
                     * The curAction is the same as the last two in result
                     * and the two elements in result can not 01, 23, 45
                     */
                    || (action === result[len - 2] && isSlice(action, result[len - 1]));
            };

        for (i = 0; i < this.stepCounts; i++) {
            do {
                // generate a new action.
                curAction = Math.floor(Math.random() * 6);
            } while (checkMove(curAction));

            result.push(curAction);
        }

        this.result = result;
        // console.log(result.join(' '));
    };

    Chaoser.prototype.shuffle = function () {

        var actions = ['R', 'L', 'F', 'B', 'U', 'D'],
            action = 0,
            dummy = 0,
            actionStr = '',
            actionStrs = [],
            i;

        for (i = 0; i < this.result.length; i++) {
            dummy = Math.floor(Math.random() * 5);
            action = actions[this.result[i]];

            if (dummy === 4) {
                actionStr = action + '2';
            } else if (dummy === 2 || dummy === 3) {
                actionStr = action + '\'';
            } else {
                actionStr = action;
            }

            actionStrs.push(actionStr);
        }

        this.actionStrs = actionStrs;
    };

    Chaoser.prototype.next = function () {
        
        this.gen();
        this.shuffle();

        return this.actionStrs.join(' ');
    };
    
    /**
     * 
     */
    var ousia = window.Ousia = function () {
        
        this.isPreparing = false;

        this.preLast = 500;
        this.preTicker = null;
        this.preStartTime = null;

        this.isRunning = false;
        this.startTime = null;

        this.ticker = null;
        this.tickInterval = 30;
        
        this.everySecondTicker = null;

        this.onFinishPrepare   = function () {};
        this.onBeforeStart     = function () {};
        this.onPostEnd         = function (evt) {};
        this.onTick            = function (evt) {};
    };

    ousia.prototype.prepare = function () {
        var self = this;
        
        this.isPreparing = true;

        this.preStartTime = new Date().getTime();
        this.preTicker = setTimeout(function () {
            console.log('fire.');
            self.onFinishPrepare();
        }, this.preLast);
    };
    
    ousia.prototype.isPrepareWell = function () {
        
        this.isPreparing = false;

        var diff = new Date().getTime() - this.preStartTime;
        if (diff < this.preLast) {
            clearTimeout(this.preTicker);
            return false;
        }
        return true;
    };
    
    ousia.prototype.calcTime = function () {
        var
            curDiff    = new Date().getTime() - this.startTime,
            curSeconds = Math.floor(curDiff / 1000),
            curMS      = Math.floor((curDiff - curSeconds * 1000) / 10),

            fixXX = function (xx) {
                return xx < 10 ? ('0' + xx) : xx;
            },

            evt = {
                total  : curDiff, // total ms
                second : fixXX(curSeconds), // total seconds
                ms     : fixXX(curMS)
            };

        return evt;
    };
    
    ousia.prototype.start = function () {
        console.log('start');
        this.onBeforeStart();
        
        this.isRunning = true;
        this.startTime = new Date().getTime();

        var self = this;
        this.ticker = setInterval(function () {
            self.onTick(self.calcTime());
        }, this.tickInterval);
    };

    ousia.prototype.end = function () {
        console.log('end');
        
        clearInterval(this.ticker);
        var evt = this.calcTime();

        this.isRunning = false;
        this.onPostEnd(evt);
    };
    
    ousia.prototype.initEvents = function () { 
        var self = this;
        
        $(document)
            .keydown(function (event) {
                console.log('keydown:', event.keyCode);
                // end 
                if (self.isRunning) {
                    self.end();
                    return;
                }
                // start
                if (event.keyCode === 32 && !self.isPreparing) {
                    self.prepare();
                    return;
                }
            })
            .keyup(function (event) {
                console.log('keyup:', event.keyCode);
                if (event.keyCode === 32 // space
                        && self.isPreparing 
                        && self.isPrepareWell()) {
                    self.start();
                }
            });
    };
    
    function setText (sec, ms) {
        $('#time > span').html(sec + ':' + ms);
    };
        
    
    /*
     * ----------------------------------------------
     *  Do statictis and ui change.
     * ----------------------------------------------
     */
    var Oarsman = window.Oarsman = function() {
        this.chaoser = new Chaoser();
        
        this.times = [];
        this.avg   = 0;
        
        this._initOusia(); 
        
        $('#chaos').html(this.chaoser.next());
    };
    
    Oarsman.prototype.calcAVg = function(){
        
        if (this.times.length < 5) {
            return '--';
        }
        
        var quickSort = function (arr) {
                if (arr.length <= 1) { 
                    return arr; 
                }

                var pivotIndex = Math.floor(arr.length / 2),
                    pivot      = arr.splice(pivotIndex, 1)[0],
                    left  = [],
                    right = [];

                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] < pivot) {
                        left.push(arr[i]);
                    } else {
                        right.push(arr[i]);
                    }
                }
                return quickSort(left).concat([pivot], quickSort(right));
            },
                                                                   
            dummy = this.times,  
            
            sum = 0,
            i   = 0,
            len = dummy.length;
        
        dummy = quickSort(dummy).slice(1, len - 1);
        
        for(i = 0; i < dummy.length; i++) {
            sum += dummy[i];
        }
        
        // (45 / 13).toFixed(2) = 3.46
        return (sum / dummy.length / 1000).toFixed(2);
    };

    Oarsman.prototype._initOusia = function () {
        var 
            self = this,
            ousia = new Ousia();
        
        ousia.initEvents();
        ousia.onTick = function (evt) {
            setText(evt.second, evt.ms);
        };
        
        ousia.onPostEnd = function (evt) {
            $('#time-row').animate({ backgroundColor: '#F1654C' });

            var
                total = evt.total,
                timeStr = evt.second + ':' + evt.ms;

            self.times.push(total);
            self.avg = self.calcAVg();

            setTimeout(function () {
                setText('00', '00');

                $('#chaos').html(self.chaoser.next());

                $('<li>' + timeStr + '</li>')
                    .appendTo($('#grades'))
                    .hide()
                    .fadeIn();
                
                $('#grades li:first').html(self.avg);
            }, 1000);
        };
        // ousia.onEverySecondTick = function (evt) {};
        ousia.onBeforeStart = function () {
            $('#time-row').animate({backgroundColor: '#ADB742'});
        };
        ousia.onFinishPrepare = function() {
            $('#time-row').animate({backgroundColor: '#00B5B5'})
        };
        
        this.ousia = ousia;
    };
    
})();


