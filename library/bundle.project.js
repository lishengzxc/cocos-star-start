require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Game":[function(require,module,exports){
cc._RFpush(module, '44b142c4fdDX4efKjfzzzRK', 'Game');
// scripts/Game.js

'use strict';

cc.Class({
    'extends': cc.Component,

    properties: {
        // 这个属性引用了星星预制资源
        starPrefab: {
            'default': null,
            type: cc.Prefab
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,
        // 地面节点，用于确定星星生成的高度
        ground: {
            'default': null,
            type: cc.Node
        },
        // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
            'default': null,
            type: cc.Node
        },
        scoreDisplay: {
            'default': null,
            type: cc.Label
        },
        scoreAudio: {
            'default': null,
            url: cc.AudioClip
        }
    },

    onLoad: function onLoad() {
        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height / 2;
        // 生成一个新的星星

        this.timer = 0;
        this.starDuration = 0;
        // 生成一个新的星星
        this.spawnNewStar();
        // 初始化计分
        this.score = 0;
    },

    spawnNewStar: function spawnNewStar() {
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());

        newStar.getComponent('Star').game = this;

        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition: function getNewStarPosition() {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.ground + cc.random0To1() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2;
        randX = cc.randomMinus1To1() * maxX;
        // 返回星星坐标
        return cc.p(randX, randY);
    },

    gainScore: function gainScore() {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    update: function update(dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        this.timer += dt;
    },

    gameOver: function gameOver() {
        this.player.stopAllActions(); //停止 player 节点的跳跃动作
        cc.director.loadScene('game');
    }
});

cc._RFpop();
},{}],"Player":[function(require,module,exports){
cc._RFpush(module, '94165OAGO9B2JSd20CTaMn7', 'Player');
// scripts/Player.js

"use strict";

cc.Class({
    "extends": cc.Component,

    properties: {
        // 主角跳跃高度
        jumpHeight: 0,
        // 主角跳跃持续时间
        jumpDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 0,
        // 加速度
        accel: 0,

        jumpAudio: {
            "default": null,
            url: cc.AudioClip
        }
    },

    setJumpAction: function setJumpAction() {
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
        var callback = cc.callFunc(this.playJumpSound, this);
        // 不断重复，而且每次完成落地动作后调用回调来播放声音
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));
    },

    playJumpSound: function playJumpSound() {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    setInputControl: function setInputControl() {
        var self = this;
        // 添加键盘事件监听
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
            onKeyPressed: function onKeyPressed(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                        self.accRight = false;
                        break;
                }
            }
        }, self.node);
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 初始化跳跃动作
        this.jumpAction = this.setJumpAction();
        this.node.runAction(this.jumpAction);

        // 加速度方向开关
        this.accLeft = false;
        this.accRight = false;
        // 主角当前水平方向速度
        this.xSpeed = 0;

        // 初始化键盘输入监听
        this.setInputControl();
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }
        // 限制主角的速度不能超过最大值
        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            // if speed reach limit, use max speed with current direction
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        // 根据当前速度更新主角的位置
        this.node.x += this.xSpeed * dt;
    }
});

cc._RFpop();
},{}],"Star":[function(require,module,exports){
cc._RFpush(module, '0baf4czshNFf4CW4TTc361h', 'Star');
// scripts/Star.js

"use strict";

cc.Class({
    "extends": cc.Component,

    properties: {
        // 星星和主角之间的距离小于这个数值时，就会完成收集
        pickRadius: 0
    },

    // use this for initialization
    onLoad: function onLoad() {},

    getPlayerDistance: function getPlayerDistance() {
        // 根据 player 节点位置判断距离
        var playerPos = this.game.player.getPosition();
        // 根据两点位置计算两点之间距离
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function onPicked() {
        // 当星星被收集时，调用 Game 脚本中的接口，生成一个新的星星
        this.game.spawnNewStar();
        // 调用 Game 脚本的得分方法
        this.game.gainScore();
        // 然后销毁当前星星节点
        this.node.destroy();
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        // 每帧判断和主角之间的距离是否小于收集距离
        if (this.getPlayerDistance() < this.pickRadius) {
            // 调用收集行为
            this.onPicked();
            return;
        }

        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    }
});

cc._RFpop();
},{}]},{},["Star","Game","Player"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiYXNzZXRzL3NjcmlwdHMvR2FtZS5qcyIsImFzc2V0cy9zY3JpcHRzL1BsYXllci5qcyIsImFzc2V0cy9zY3JpcHRzL1N0YXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjYy5fUkZwdXNoKG1vZHVsZSwgJzQ0YjE0MmM0ZmREWDRlZktqZnp6elJLJywgJ0dhbWUnKTtcbi8vIHNjcmlwdHMvR2FtZS5qc1xuXG4ndXNlIHN0cmljdCc7XG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g6L+Z5Liq5bGe5oCn5byV55So5LqG5pif5pif6aKE5Yi26LWE5rqQXG4gICAgICAgIHN0YXJQcmVmYWI6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLlByZWZhYlxuICAgICAgICB9LFxuICAgICAgICAvLyDmmJ/mmJ/kuqfnlJ/lkI7mtojlpLHml7bpl7TnmoTpmo/mnLrojIPlm7RcbiAgICAgICAgbWF4U3RhckR1cmF0aW9uOiAwLFxuICAgICAgICBtaW5TdGFyRHVyYXRpb246IDAsXG4gICAgICAgIC8vIOWcsOmdouiKgueCue+8jOeUqOS6juehruWumuaYn+aYn+eUn+aIkOeahOmrmOW6plxuICAgICAgICBncm91bmQ6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcbiAgICAgICAgLy8gcGxheWVyIOiKgueCue+8jOeUqOS6juiOt+WPluS4u+inkuW8uei3s+eahOmrmOW6pu+8jOWSjOaOp+WItuS4u+inkuihjOWKqOW8gOWFs1xuICAgICAgICBwbGF5ZXI6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcbiAgICAgICAgc2NvcmVEaXNwbGF5OiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxuICAgICAgICB9LFxuICAgICAgICBzY29yZUF1ZGlvOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB1cmw6IGNjLkF1ZGlvQ2xpcFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICAvLyDojrflj5blnLDlubPpnaLnmoQgeSDovbTlnZDmoIdcbiAgICAgICAgdGhpcy5ncm91bmRZID0gdGhpcy5ncm91bmQueSArIHRoaXMuZ3JvdW5kLmhlaWdodCAvIDI7XG4gICAgICAgIC8vIOeUn+aIkOS4gOS4quaWsOeahOaYn+aYn1xuXG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLnN0YXJEdXJhdGlvbiA9IDA7XG4gICAgICAgIC8vIOeUn+aIkOS4gOS4quaWsOeahOaYn+aYn1xuICAgICAgICB0aGlzLnNwYXduTmV3U3RhcigpO1xuICAgICAgICAvLyDliJ3lp4vljJborqHliIZcbiAgICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgfSxcblxuICAgIHNwYXduTmV3U3RhcjogZnVuY3Rpb24gc3Bhd25OZXdTdGFyKCkge1xuICAgICAgICAvLyDkvb/nlKjnu5nlrprnmoTmqKHmnb/lnKjlnLrmma/kuK3nlJ/miJDkuIDkuKrmlrDoioLngrlcbiAgICAgICAgdmFyIG5ld1N0YXIgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnN0YXJQcmVmYWIpO1xuICAgICAgICAvLyDlsIbmlrDlop7nmoToioLngrnmt7vliqDliLAgQ2FudmFzIOiKgueCueS4i+mdolxuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQobmV3U3Rhcik7XG4gICAgICAgIC8vIOS4uuaYn+aYn+iuvue9ruS4gOS4qumaj+acuuS9jee9rlxuICAgICAgICBuZXdTdGFyLnNldFBvc2l0aW9uKHRoaXMuZ2V0TmV3U3RhclBvc2l0aW9uKCkpO1xuXG4gICAgICAgIG5ld1N0YXIuZ2V0Q29tcG9uZW50KCdTdGFyJykuZ2FtZSA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5zdGFyRHVyYXRpb24gPSB0aGlzLm1pblN0YXJEdXJhdGlvbiArIGNjLnJhbmRvbTBUbzEoKSAqICh0aGlzLm1heFN0YXJEdXJhdGlvbiAtIHRoaXMubWluU3RhckR1cmF0aW9uKTtcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgfSxcblxuICAgIGdldE5ld1N0YXJQb3NpdGlvbjogZnVuY3Rpb24gZ2V0TmV3U3RhclBvc2l0aW9uKCkge1xuICAgICAgICB2YXIgcmFuZFggPSAwO1xuICAgICAgICAvLyDmoLnmja7lnLDlubPpnaLkvY3nva7lkozkuLvop5Lot7Pot4Ppq5jluqbvvIzpmo/mnLrlvpfliLDkuIDkuKrmmJ/mmJ/nmoQgeSDlnZDmoIdcbiAgICAgICAgdmFyIHJhbmRZID0gdGhpcy5ncm91bmQgKyBjYy5yYW5kb20wVG8xKCkgKiB0aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ1BsYXllcicpLmp1bXBIZWlnaHQgKyA1MDtcbiAgICAgICAgLy8g5qC55o2u5bGP5bmV5a695bqm77yM6ZqP5py65b6X5Yiw5LiA5Liq5pif5pifIHgg5Z2Q5qCHXG4gICAgICAgIHZhciBtYXhYID0gdGhpcy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgcmFuZFggPSBjYy5yYW5kb21NaW51czFUbzEoKSAqIG1heFg7XG4gICAgICAgIC8vIOi/lOWbnuaYn+aYn+WdkOagh1xuICAgICAgICByZXR1cm4gY2MucChyYW5kWCwgcmFuZFkpO1xuICAgIH0sXG5cbiAgICBnYWluU2NvcmU6IGZ1bmN0aW9uIGdhaW5TY29yZSgpIHtcbiAgICAgICAgdGhpcy5zY29yZSArPSAxO1xuICAgICAgICAvLyDmm7TmlrAgc2NvcmVEaXNwbGF5IExhYmVsIOeahOaWh+Wtl1xuICAgICAgICB0aGlzLnNjb3JlRGlzcGxheS5zdHJpbmcgPSAnU2NvcmU6ICcgKyB0aGlzLnNjb3JlLnRvU3RyaW5nKCk7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5zY29yZUF1ZGlvLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgICAgIC8vIOavj+W4p+abtOaWsOiuoeaXtuWZqO+8jOi2hei/h+mZkOW6pui/mOayoeacieeUn+aIkOaWsOeahOaYn+aYn1xuICAgICAgICAvLyDlsLHkvJrosIPnlKjmuLjmiI/lpLHotKXpgLvovpFcbiAgICAgICAgaWYgKHRoaXMudGltZXIgPiB0aGlzLnN0YXJEdXJhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZXIgKz0gZHQ7XG4gICAgfSxcblxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbiBnYW1lT3ZlcigpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuc3RvcEFsbEFjdGlvbnMoKTsgLy/lgZzmraIgcGxheWVyIOiKgueCueeahOi3s+i3g+WKqOS9nFxuICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ2dhbWUnKTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiY2MuX1JGcHVzaChtb2R1bGUsICc5NDE2NU9BR085QjJKU2QyMENUYU1uNycsICdQbGF5ZXInKTtcbi8vIHNjcmlwdHMvUGxheWVyLmpzXG5cblwidXNlIHN0cmljdFwiO1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g5Li76KeS6Lez6LeD6auY5bqmXG4gICAgICAgIGp1bXBIZWlnaHQ6IDAsXG4gICAgICAgIC8vIOS4u+inkui3s+i3g+aMgee7reaXtumXtFxuICAgICAgICBqdW1wRHVyYXRpb246IDAsXG4gICAgICAgIC8vIOacgOWkp+enu+WKqOmAn+W6plxuICAgICAgICBtYXhNb3ZlU3BlZWQ6IDAsXG4gICAgICAgIC8vIOWKoOmAn+W6plxuICAgICAgICBhY2NlbDogMCxcblxuICAgICAgICBqdW1wQXVkaW86IHtcbiAgICAgICAgICAgIFwiZGVmYXVsdFwiOiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXRKdW1wQWN0aW9uOiBmdW5jdGlvbiBzZXRKdW1wQWN0aW9uKCkge1xuICAgICAgICB2YXIganVtcFVwID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIHRoaXMuanVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25PdXQoKSk7XG4gICAgICAgIC8vIOS4i+iQvVxuICAgICAgICB2YXIganVtcERvd24gPSBjYy5tb3ZlQnkodGhpcy5qdW1wRHVyYXRpb24sIGNjLnAoMCwgLXRoaXMuanVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25JbigpKTtcbiAgICAgICAgLy8g5re75Yqg5LiA5Liq5Zue6LCD5Ye95pWw77yM55So5LqO5Zyo5Yqo5L2c57uT5p2f5pe26LCD55So5oiR5Lus5a6a5LmJ55qE5YW25LuW5pa55rOVXG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNjLmNhbGxGdW5jKHRoaXMucGxheUp1bXBTb3VuZCwgdGhpcyk7XG4gICAgICAgIC8vIOS4jeaWremHjeWkje+8jOiAjOS4lOavj+asoeWujOaIkOiQveWcsOWKqOS9nOWQjuiwg+eUqOWbnuiwg+adpeaSreaUvuWjsOmfs1xuICAgICAgICByZXR1cm4gY2MucmVwZWF0Rm9yZXZlcihjYy5zZXF1ZW5jZShqdW1wVXAsIGp1bXBEb3duLCBjYWxsYmFjaykpO1xuICAgIH0sXG5cbiAgICBwbGF5SnVtcFNvdW5kOiBmdW5jdGlvbiBwbGF5SnVtcFNvdW5kKCkge1xuICAgICAgICAvLyDosIPnlKjlo7Dpn7PlvJXmk47mkq3mlL7lo7Dpn7NcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLmp1bXBBdWRpbywgZmFsc2UpO1xuICAgIH0sXG5cbiAgICBzZXRJbnB1dENvbnRyb2w6IGZ1bmN0aW9uIHNldElucHV0Q29udHJvbCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvLyDmt7vliqDplK7nm5jkuovku7bnm5HlkKxcbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLktFWUJPQVJELFxuICAgICAgICAgICAgLy8g5pyJ5oyJ6ZSu5oyJ5LiL5pe277yM5Yik5pat5piv5ZCm5piv5oiR5Lus5oyH5a6a55qE5pa55ZCR5o6n5Yi26ZSu77yM5bm26K6+572u5ZCR5a+55bqU5pa55ZCR5Yqg6YCfXG4gICAgICAgICAgICBvbktleVByZXNzZWQ6IGZ1bmN0aW9uIG9uS2V5UHJlc3NlZChrZXlDb2RlLCBldmVudCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5kOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyDmnb7lvIDmjInplK7ml7bvvIzlgZzmraLlkJHor6XmlrnlkJHnmoTliqDpgJ9cbiAgICAgICAgICAgIG9uS2V5UmVsZWFzZWQ6IGZ1bmN0aW9uIG9uS2V5UmVsZWFzZWQoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuYTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYubm9kZSk7XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICAvLyDliJ3lp4vljJbot7Pot4PliqjkvZxcbiAgICAgICAgdGhpcy5qdW1wQWN0aW9uID0gdGhpcy5zZXRKdW1wQWN0aW9uKCk7XG4gICAgICAgIHRoaXMubm9kZS5ydW5BY3Rpb24odGhpcy5qdW1wQWN0aW9uKTtcblxuICAgICAgICAvLyDliqDpgJ/luqbmlrnlkJHlvIDlhbNcbiAgICAgICAgdGhpcy5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgLy8g5Li76KeS5b2T5YmN5rC05bmz5pa55ZCR6YCf5bqmXG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcblxuICAgICAgICAvLyDliJ3lp4vljJbplK7nm5jovpPlhaXnm5HlkKxcbiAgICAgICAgdGhpcy5zZXRJbnB1dENvbnRyb2woKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICBpZiAodGhpcy5hY2NMZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLnhTcGVlZCAtPSB0aGlzLmFjY2VsICogZHQ7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY2NSaWdodCkge1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgKz0gdGhpcy5hY2NlbCAqIGR0O1xuICAgICAgICB9XG4gICAgICAgIC8vIOmZkOWItuS4u+inkueahOmAn+W6puS4jeiDvei2hei/h+acgOWkp+WAvFxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy54U3BlZWQpID4gdGhpcy5tYXhNb3ZlU3BlZWQpIHtcbiAgICAgICAgICAgIC8vIGlmIHNwZWVkIHJlYWNoIGxpbWl0LCB1c2UgbWF4IHNwZWVkIHdpdGggY3VycmVudCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHRoaXMueFNwZWVkID0gdGhpcy5tYXhNb3ZlU3BlZWQgKiB0aGlzLnhTcGVlZCAvIE1hdGguYWJzKHRoaXMueFNwZWVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOagueaNruW9k+WJjemAn+W6puabtOaWsOS4u+inkueahOS9jee9rlxuICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnhTcGVlZCAqIGR0O1xuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJjYy5fUkZwdXNoKG1vZHVsZSwgJzBiYWY0Y3pzaE5GZjRDVzRUVGMzNjFoJywgJ1N0YXInKTtcbi8vIHNjcmlwdHMvU3Rhci5qc1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY2MuQ2xhc3Moe1xuICAgIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOaYn+aYn+WSjOS4u+inkuS5i+mXtOeahOi3neemu+Wwj+S6jui/meS4quaVsOWAvOaXtu+8jOWwseS8muWujOaIkOaUtumbhlxuICAgICAgICBwaWNrUmFkaXVzOiAwXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge30sXG5cbiAgICBnZXRQbGF5ZXJEaXN0YW5jZTogZnVuY3Rpb24gZ2V0UGxheWVyRGlzdGFuY2UoKSB7XG4gICAgICAgIC8vIOagueaNriBwbGF5ZXIg6IqC54K55L2N572u5Yik5pat6Led56a7XG4gICAgICAgIHZhciBwbGF5ZXJQb3MgPSB0aGlzLmdhbWUucGxheWVyLmdldFBvc2l0aW9uKCk7XG4gICAgICAgIC8vIOagueaNruS4pOeCueS9jee9ruiuoeeul+S4pOeCueS5i+mXtOi3neemu1xuICAgICAgICB2YXIgZGlzdCA9IGNjLnBEaXN0YW5jZSh0aGlzLm5vZGUucG9zaXRpb24sIHBsYXllclBvcyk7XG4gICAgICAgIHJldHVybiBkaXN0O1xuICAgIH0sXG5cbiAgICBvblBpY2tlZDogZnVuY3Rpb24gb25QaWNrZWQoKSB7XG4gICAgICAgIC8vIOW9k+aYn+aYn+iiq+aUtumbhuaXtu+8jOiwg+eUqCBHYW1lIOiEmuacrOS4reeahOaOpeWPo++8jOeUn+aIkOS4gOS4quaWsOeahOaYn+aYn1xuICAgICAgICB0aGlzLmdhbWUuc3Bhd25OZXdTdGFyKCk7XG4gICAgICAgIC8vIOiwg+eUqCBHYW1lIOiEmuacrOeahOW+l+WIhuaWueazlVxuICAgICAgICB0aGlzLmdhbWUuZ2FpblNjb3JlKCk7XG4gICAgICAgIC8vIOeEtuWQjumUgOavgeW9k+WJjeaYn+aYn+iKgueCuVxuICAgICAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgICAgIC8vIOavj+W4p+WIpOaWreWSjOS4u+inkuS5i+mXtOeahOi3neemu+aYr+WQpuWwj+S6juaUtumbhui3neemu1xuICAgICAgICBpZiAodGhpcy5nZXRQbGF5ZXJEaXN0YW5jZSgpIDwgdGhpcy5waWNrUmFkaXVzKSB7XG4gICAgICAgICAgICAvLyDosIPnlKjmlLbpm4booYzkuLpcbiAgICAgICAgICAgIHRoaXMub25QaWNrZWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvcGFjaXR5UmF0aW8gPSAxIC0gdGhpcy5nYW1lLnRpbWVyIC8gdGhpcy5nYW1lLnN0YXJEdXJhdGlvbjtcbiAgICAgICAgdmFyIG1pbk9wYWNpdHkgPSA1MDtcbiAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSBtaW5PcGFjaXR5ICsgTWF0aC5mbG9vcihvcGFjaXR5UmF0aW8gKiAoMjU1IC0gbWluT3BhY2l0eSkpO1xuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiXX0=
