var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BCW;
(function (BCW) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            _super.apply(this, arguments);
        }
        Boot.prototype.preload = function () {
            this.load.image('preloadBar', 'assets/loader.png');
        };

        Boot.prototype.create = function () {
            //  Unless you specifically need to support multitouch I would recommend setting this to 1
            this.input.maxPointers = 1;

            //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
            this.stage.disableVisibilityChange = true;

            if (this.game.device.desktop) {
                //  If you have any desktop specific settings, they can go in here
                // this.stage.scale.pageAlignHorizontally = true;
            } else {
                //  Same goes for mobile settings.
            }
            this.game.state.start('Preloader', true, false);
        };
        return Boot;
    })(Phaser.State);
    BCW.Boot = Boot;
})(BCW || (BCW = {}));
var BCW;
(function (BCW) {
    var EnemyTank = (function () {
        function EnemyTank(name, game, player, bullets) {
            this.game = game;
            this.player = player;
            this.bullets = bullets;
            this.health = 3;
            this.fireRate = 1000;
            this.nextFire = 0;
            this.alive = true;
            var x = this.game.world.randomX;
            var y = this.game.world.randomY;

            this.shadow = this.game.add.sprite(x, y, 'enemy', 'shadow');
            this.tank = this.game.add.sprite(x, y, 'enemy', 'tank1');
            this.turret = this.game.add.sprite(x, y, 'enemy', 'turret');

            this.shadow.anchor.set(0.5, 0.5);
            this.tank.anchor.set(0.5, 0.5);
            this.turret.anchor.set(0.3, 0.5);

            this.tank.name = name;
            this.game.physics.enable(this.tank, Phaser.Physics.ARCADE);
            this.tank.body.immovable = false;
            this.tank.body.collideWorldBounds = true;

            // this.tank.body.bounce.setTo(1, 1);
            this.tank.angle = this.game.rnd.angle();

            this.game.physics.arcade.velocityFromRotation(this.tank.rotation, 100, this.tank.body.velocity);
        }
        EnemyTank.prototype.update = function () {
            this.shadow.x = this.tank.x;
            this.shadow.y = this.tank.y;
            this.shadow.rotation = this.tank.rotation;

            this.turret.x = this.tank.x;
            this.turret.y = this.tank.y;
            this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);

            if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300) {
                if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                    this.nextFire = this.game.time.now + this.fireRate;

                    var bullet = this.bullets.getFirstDead();

                    bullet.reset(this.turret.x, this.turret.y);

                    bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
                }
            }
        };

        EnemyTank.prototype.damage = function () {
            this.health -= 1;

            if (this.health <= 0) {
                this.alive = false;
                this.shadow.kill();
                this.tank.kill();
                this.turret.kill();

                return true;
            }

            return false;
        };
        return EnemyTank;
    })();
    BCW.EnemyTank = EnemyTank;
})(BCW || (BCW = {}));
/// <reference path="../bower_components/phaser/build/phaser.d.ts"/>
var BCW;
(function (BCW) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 800, 600, Phaser.AUTO, 'content', null);

            this.state.add('Boot', BCW.Boot, false);
            this.state.add('Preloader', BCW.Preloader, false);

            // this.state.add('MainMenu', MainMenu, false);
            this.state.add('Level1', BCW.Level1, false);
            this.state.start('Boot');
        }
        return Game;
    })(Phaser.Game);
    BCW.Game = Game;
})(BCW || (BCW = {}));
var BCW;
(function (BCW) {
    var SnapType;
    (function (SnapType) {
        SnapType[SnapType["TANK"] = 0] = "TANK";
        SnapType[SnapType["TURRET"] = 1] = "TURRET";
    })(SnapType || (SnapType = {}));

    var UserControl = (function () {
        function UserControl(game, tank) {
            this.game = game;
            this.tank = tank;
            this.snapMap = {};
            this.movePoint = new Phaser.Point();
            this.vector = new Phaser.Point();
        }
        UserControl.prototype.onDown = function (pointer, isDoubleTap) {
            var halfWidth = this.game.camera.view.width >> 1;

            this.snapMap[pointer.id] = {
                point: new Phaser.Point(pointer.x, pointer.y),
                type: pointer.x > halfWidth ? 1 /* TURRET */ : 0 /* TANK */
            };
        };

        UserControl.prototype.onMove = function (pointer, x, y) {
            var snap;

            if (this.snapMap[pointer.id]) {
                snap = this.snapMap[pointer.id];
                this.movePoint.set(x, y);
                Phaser.Point.subtract(this.movePoint, snap.point, this.vector);
                if (snap.type === 0 /* TANK */) {
                    this.tank.move(this.vector.getMagnitude() * 2, Math.atan2(this.vector.y, this.vector.x));
                } else if (snap.type === 1 /* TURRET */) {
                    this.tank.aim(Math.atan2(this.vector.y, this.vector.x));
                }
            }
        };

        UserControl.prototype.onUp = function (pointer) {
            var snap = this.snapMap[pointer.id];
            if (snap.type === 0 /* TANK */) {
                this.tank.stop();
            } else if (snap.type === 1 /* TURRET */) {
                this.tank.fire();
            }
            delete this.snapMap[pointer.id];
        };

        UserControl.prototype.enable = function () {
            this.game.input.onDown.add(this.onDown, this);
            this.game.input.setMoveCallback(this.onMove, this);
            this.game.input.onUp.add(this.onUp, this);
        };
        return UserControl;
    })();
    var Bullet = (function (_super) {
        __extends(Bullet, _super);
        function Bullet(owner, x, y) {
            _super.call(this, owner.game, x, y, 'bullet');
            this.owner = owner;
            this.x = x;
            this.y = y;
            this.speed = 1000;
            this.damageAmount = 2;
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.checkWorldBounds = true;
            this.outOfBoundsKill = true;
            this.exists = false;
            this.visible = false;
            this.alive = false;
        }
        Bullet.prototype.fire = function () {
            this.game.physics.arcade.velocityFromRotation(this.rotation, this.speed, this.body.velocity);
        };
        Bullet.prototype.update = function () {
            if (this.visible) {
                this.owner.game.debug.spriteInfo(this, 16, 216);
            }
        };
        return Bullet;
    })(Phaser.Sprite);
    BCW.Bullet = Bullet;
    var Level1 = (function (_super) {
        __extends(Level1, _super);
        function Level1() {
            _super.apply(this, arguments);
            this.turretAngle = 0;
            this.fireRate = 0;
            this.nextFire = 0;
            this.currentSpeed = 0;
        }
        Level1.prototype.create = function () {
            this.game.world.setBounds(-1000, -1000, 2000, 2000);

            //  Our tiled scrolling background
            this.land = this.game.add.tileSprite(0, 0, 800, 600, 'earth');
            this.land.fixedToCamera = true;

            this.tank = new BCW.Tank(this, 0, 0);
            (new UserControl(this.game, this.tank)).enable();

            this.tanks = this.game.add.group();
            this.tanks.add(this.tank);

            // for (var i = 0; i < enemiesTotal; i++) {
            // this.tanks.add(new EnemyTank(i.toString(), this.game, this.tank, this.bullets));
            // }
            this.bullets = this.game.add.group();

            //  Explosion pool
            this.explosions = this.game.add.group();
            for (var i = 0; i < 10; i++) {
                var explosionAnimation = this.explosions.create(0, 0, 'kaboom', [0], false);
                explosionAnimation.anchor.setTo(0.5, 0.5);
                explosionAnimation.animations.add('kaboom');
            }

            this.game.camera.follow(this.tank);
            this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
            this.game.camera.focusOnXY(0, 0);
        };

        Level1.prototype.update = function () {
            this.game.physics.arcade.overlap(this.bullets, this.tanks, this.onBulletHit, null, this);
            this.game.physics.arcade.collide(this.tanks, this.tanks);
            this.tanks.callAll('update');

            this.land.tilePosition.x = -this.game.camera.x;
            this.land.tilePosition.y = -this.game.camera.y;
            // this.game.debug.inputInfo(16, 16);
        };

        Level1.prototype.onBulletHit = function (tank, bullet) {
        };

        Level1.prototype.bulletHitPlayer = function (tank, bullet) {
            bullet.kill();
        };
        return Level1;
    })(Phaser.State);
    BCW.Level1 = Level1;
})(BCW || (BCW = {}));
var BCW;
(function (BCW) {
    var MainMenu = (function (_super) {
        __extends(MainMenu, _super);
        function MainMenu() {
            _super.apply(this, arguments);
        }
        MainMenu.prototype.create = function () {
            this.background = this.add.sprite(0, 0, 'titlepage');
            this.background.alpha = 0;

            this.logo = this.add.sprite(this.world.centerX, -300, 'logo');
            this.logo.anchor.setTo(0.5, 0.5);

            this.add.tween(this.background).to({ alpha: 1 }, 2000, Phaser.Easing.Bounce.InOut, true);
            this.add.tween(this.logo).to({ y: 220 }, 2000, Phaser.Easing.Elastic.Out, true, 2000);

            this.input.onDown.addOnce(this.fadeOut, this);
        };

        MainMenu.prototype.fadeOut = function () {
            this.add.tween(this.background).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
            var tween = this.add.tween(this.logo).to({ y: 800 }, 2000, Phaser.Easing.Linear.None, true);

            tween.onComplete.add(this.startGame, this);
        };

        MainMenu.prototype.startGame = function () {
            this.game.state.start('Level1', true, false);
        };
        return MainMenu;
    })(Phaser.State);
    BCW.MainMenu = MainMenu;
})(BCW || (BCW = {}));
var BCW;
(function (BCW) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, x, y) {
            _super.call(this, game, x, y, 'simon', 0);

            this.anchor.setTo(0.5, 0);

            this.animations.add('walk', [0, 1, 2, 3, 4], 10, true);

            game.add.existing(this);
        }
        Player.prototype.update = function () {
            this.body.velocity.x = 0;

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                this.body.velocity.x = -150;
                this.animations.play('walk');

                if (this.scale.x == 1) {
                    this.scale.x = -1;
                }
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                this.body.velocity.x = 150;
                this.animations.play('walk');

                if (this.scale.x == -1) {
                    this.scale.x = 1;
                }
            } else {
                this.animations.frame = 0;
            }
        };
        return Player;
    })(Phaser.Sprite);
    BCW.Player = Player;
})(BCW || (BCW = {}));
var BCW;
(function (BCW) {
    var Preloader = (function (_super) {
        __extends(Preloader, _super);
        function Preloader() {
            _super.apply(this, arguments);
        }
        Preloader.prototype.preload = function () {
            //  Set-up our preloader sprite
            this.preloadBar = this.add.sprite(200, 250, 'preloadBar');
            this.load.setPreloadSprite(this.preloadBar);

            this.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
            this.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');
            this.load.image('logo', 'assets/logo.png');
            this.load.image('bullet', 'assets/bullet.png');
            this.load.image('earth', 'assets/scorched_earth.png');
            this.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
        };

        Preloader.prototype.create = function () {
            var tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(this.startMainMenu, this);
        };

        Preloader.prototype.startMainMenu = function () {
            this.game.state.start('Level1', true, false);
        };
        return Preloader;
    })(Phaser.State);
    BCW.Preloader = Preloader;
})(BCW || (BCW = {}));
var BCW;
(function (BCW) {
    var Tank = (function (_super) {
        __extends(Tank, _super);
        function Tank(level, x, y) {
            _super.call(this, level.game, x, y, 'tank', 'tank1');
            this.level = level;
            this.x = x;
            this.y = y;
            this.BULLET_POOL_SIZE = 10;
            this.fireRate = 300;
            this.nextFire = 0;
            this.gunpoint = new Phaser.Point();
            this.anchor.setTo(0.5, 0.5);
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.collideWorldBounds = true;
            this.addSpriteChilds();
            this.initBulletPool();
        }
        Tank.prototype.addSpriteChilds = function () {
            var shadow = new Phaser.Sprite(this.game, this.x, this.y, 'tank', 'shadow');
            shadow.z = 0;
            shadow.anchor.setTo(0.5, 0.5);
            this.turret = new Phaser.Sprite(this.game, this.x, this.y, 'tank', 'turret');
            this.turret.anchor.setTo(0.3, 0.5);

            this.addChild(shadow);
            this.addChild(this.turret);
        };
        Tank.prototype.initBulletPool = function () {
            var i;
            this.bullets = this.game.add.group();
            for (i = 0; i < this.BULLET_POOL_SIZE; i++) {
                this.bullets.add(new BCW.Bullet(this, 0, 0));
            }
        };
        Tank.prototype.updateGunpoint = function () {
            var gunpoint = this.world.clone(this.gunpoint);
            // .subtract(this.width / 2, this.height / 2);
            // return Phaser.Point.rotate(
            // this.gunpoint,
            // this.gunpoint.x,
            // this.gunpoint.y,
            // this.rotation + this.turret.rotation,
            // false,
            // 0.7 * this.turret.height
            // )
        };
        Tank.prototype.fire = function () {
            var bullet;

            if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                this.nextFire = this.game.time.now + this.fireRate;

                bullet = this.bullets.getFirstExists(false);
                this.updateGunpoint();

                // bullet.x = this.x;
                // bullet.y = this.y;
                bullet.reset(this.x, this.y);
                bullet.anchor.setTo(0, 0.5);
                console.log(bullet.x, bullet.y);
                bullet.rotation = this.rotation + this.turret.rotation;

                // this.level.bullets.add(bullet);
                bullet.fire();
            }
        };
        Tank.prototype.move = function (speed, rotation) {
            this.rotation = rotation;

            this.game.physics.arcade.velocityFromRotation(rotation, speed, this.body.velocity);
        };
        Tank.prototype.aim = function (rotation) {
            this.turret.rotation = rotation - this.rotation;
        };
        Tank.prototype.stop = function () {
            this.body.velocity.setTo(0, 0);
        };
        Tank.prototype.update = function () {
            this.game.debug.inputInfo(16, 16);
            this.game.debug.spriteInfo(this, 16, 116);
        };
        return Tank;
    })(Phaser.Sprite);
    BCW.Tank = Tank;
})(BCW || (BCW = {}));
