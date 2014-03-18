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
            this.tank.body.bounce.setTo(1, 1);

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
    var Level1 = (function (_super) {
        __extends(Level1, _super);
        function Level1() {
            _super.apply(this, arguments);
            this.fireRate = 0;
            this.nextFire = 0;
            this.currentSpeed = 0;
            this.enemies = [];
        }
        Level1.prototype.create = function () {
            this.game.world.setBounds(-1000, -1000, 2000, 2000);

            //  Our tiled scrolling background
            this.land = this.game.add.tileSprite(0, 0, 800, 600, 'earth');
            this.land.fixedToCamera = true;

            //  The base of our tank
            this.tank = this.game.add.sprite(0, 0, 'tank', 'tank1');
            this.tank.anchor.setTo(0.5, 0.5);
            this.tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

            //  This will force it to decelerate and limit its speed
            this.game.physics.enable(this.tank, Phaser.Physics.ARCADE);
            this.tank.body.drag.set(0.2, 0);
            this.tank.body.maxVelocity.setTo(400, 400);
            this.tank.body.collideWorldBounds = true;

            this.turret = this.game.add.sprite(0, 0, 'tank', 'turret');
            this.turret.anchor.setTo(0.3, 0.5);

            //  The enemies bullet group
            this.enemyBullets = this.game.add.group();
            this.enemyBullets.enableBody = true;
            this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.enemyBullets.createMultiple(100, 'bullet');
            this.enemyBullets.setAll('anchor.x', 0.5);
            this.enemyBullets.setAll('anchor.y', 0.5);
            this.enemyBullets.setAll('outOfBoundsKill', true);
            this.enemyBullets.setAll('checkWorldBounds', true);

            //  Create some baddies to waste :)
            var enemiesTotal = 20;
            var enemiesAlive = 20;

            for (var i = 0; i < enemiesTotal; i++) {
                this.enemies.push(new BCW.EnemyTank(i.toString(), this.game, this.tank, this.enemyBullets));
            }

            //  A shadow below our tank
            this.shadow = this.game.add.sprite(0, 0, 'tank', 'shadow');
            this.shadow.anchor.setTo(0.5, 0.5);

            //  Our bullet group
            this.bullets = this.game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.bullets.createMultiple(30, 'bullet', 0, false);
            this.bullets.setAll('anchor.x', 0.5);
            this.bullets.setAll('anchor.y', 0.5);
            this.bullets.setAll('outOfBoundsKill', true);
            this.bullets.setAll('checkWorldBounds', true);

            //  Explosion pool
            this.explosions = this.game.add.group();
            for (var i = 0; i < 10; i++) {
                var explosionAnimation = this.explosions.create(0, 0, 'kaboom', [0], false);
                explosionAnimation.anchor.setTo(0.5, 0.5);
                explosionAnimation.animations.add('kaboom');
            }

            this.tank.bringToTop();
            this.turret.bringToTop();

            this.game.camera.follow(this.tank);
            this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
            this.game.camera.focusOnXY(0, 0);

            this.cursors = this.input.keyboard.createCursorKeys();
        };

        Level1.prototype.update = function () {
            this.game.physics.arcade.overlap(this.enemyBullets, this.tank, this.bulletHitPlayer, null, this);

            var enemiesAlive = 0;

            for (var i = 0; i < this.enemies.length; i++) {
                if (this.enemies[i].alive) {
                    enemiesAlive++;
                    this.game.physics.arcade.collide(this.tank, this.enemies[i].tank);
                    this.game.physics.arcade.overlap(this.bullets, this.enemies[i].tank, this.bulletHitEnemy, null, this);
                    this.enemies[i].update();
                }
            }

            if (this.cursors.left.isDown) {
                this.tank.angle -= 4;
            } else if (this.cursors.right.isDown) {
                this.tank.angle += 4;
            }

            if (this.cursors.up.isDown) {
                //  The speed we'll travel at
                this.currentSpeed = 300;
            } else {
                if (this.currentSpeed > 0) {
                    this.currentSpeed -= 4;
                }
            }

            if (this.currentSpeed > 0) {
                this.game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
            }

            this.land.tilePosition.x = -this.game.camera.x;
            this.land.tilePosition.y = -this.game.camera.y;

            //  Position all the parts and align rotations
            this.shadow.x = this.tank.x;
            this.shadow.y = this.tank.y;
            this.shadow.rotation = this.tank.rotation;

            this.turret.x = this.tank.x;
            this.turret.y = this.tank.y;

            this.turret.rotation = this.game.physics.arcade.angleToPointer(this.turret);

            if (this.game.input.activePointer.isDown) {
                //  Boom!
                this.fire();
            }
        };

        Level1.prototype.bulletHitPlayer = function (tank, bullet) {
            bullet.kill();
        };

        Level1.prototype.bulletHitEnemy = function (tank, bullet) {
            bullet.kill();

            var destroyed = this.enemies[tank.name].damage();

            if (destroyed) {
                var explosionAnimation = this.explosions.getFirstExists(false);
                explosionAnimation.reset(tank.x, tank.y);
                explosionAnimation.play('kaboom', 30, false, true);
            }
        };

        Level1.prototype.fire = function () {
            if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                this.nextFire = this.game.time.now + this.fireRate;

                var bullet = this.bullets.getFirstExists(false);

                bullet.reset(this.turret.x, this.turret.y);
                bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 1000, this.input.activePointer, 500);
            }
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
