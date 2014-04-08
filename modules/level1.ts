module BCW {
    enum SnapType {TANK, TURRET}

    interface Snap {
        point: Phaser.Point;
       type: SnapType;
    }

    class UserControl {
        snapMap = {};
        movePoint = new Phaser.Point();
        vector = new Phaser.Point();


        constructor(public game:Phaser.Game, public tank:Tank) {
        }

        onDown(pointer:Phaser.Pointer, isDoubleTap) {
            var halfWidth = this.game.camera.view.width >> 1;

            this.snapMap[pointer.id] = {
                point: new Phaser.Point(pointer.x, pointer.y),
                type: pointer.x > halfWidth ? SnapType.TURRET:SnapType.TANK
            };
        }

        onMove(pointer:Phaser.Pointer, x:number, y:number) {
            var snap: Snap;

            if (this.snapMap[pointer.id]) {
                snap = this.snapMap[pointer.id];
                this.movePoint.set(x, y)
                Phaser.Point.subtract(
                    this.movePoint,
                    snap.point,
                    this.vector
                );
                if (snap.type === SnapType.TANK) {
                    this.tank.move(
                        this.vector.getMagnitude() * 2,
                        Math.atan2(this.vector.y, this.vector.x)
                    );
                }
            }
        }

        onUp(pointer:Phaser.Pointer) {
            delete this.snapMap[pointer.id];
            this.tank.stop();
        }

        enable() {
            this.game.input.onDown.add(this.onDown, this);
            this.game.input.setMoveCallback(this.onMove, this);
            this.game.input.onUp.add(this.onUp, this);
        }
    }
    export class Level1 extends Phaser.State {
        cursors:{
            up: Phaser.Key;
            down: Phaser.Key;
            left: Phaser.Key;
            right: Phaser.Key;
        }
        turretAngle = 0;
        fireRate = 0;
        nextFire = 0;
        currentSpeed = 0;
        explosions:Phaser.Group;
        enemyBullets:Phaser.Group;
        bullets:Phaser.Group;
        land:Phaser.TileSprite;
        tank:Tank;
        enemies:EnemyTank[] = [];

        create() {
            this.game.world.setBounds(-1000, -1000, 2000, 2000);

            //  Our tiled scrolling background
            this.land = this.game.add.tileSprite(0, 0, 800, 600, 'earth');
            this.land.fixedToCamera = true;

            this.tank = new Tank(this.game, 0, 0);
            this.game.add.existing(this.tank);
            (new UserControl(this.game, this.tank)).enable();

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
                this.enemies.push(new EnemyTank(i.toString(), this.game, this.tank, this.enemyBullets));
            }

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
            for (var i = 0; i < 10; i++)
            {
                var explosionAnimation = this.explosions.create(0, 0, 'kaboom', [0], false);
                explosionAnimation.anchor.setTo(0.5, 0.5);
                explosionAnimation.animations.add('kaboom');
            }

            this.game.camera.follow(this.tank);
            this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
            this.game.camera.focusOnXY(0, 0);

            this.cursors = this.input.keyboard.createCursorKeys();
        }

        update() {
            this.game.physics.arcade.overlap(this.enemyBullets, this.tank, this.bulletHitPlayer, null, this);

            var enemiesAlive = 0;

            for (var i = 0; i < this.enemies.length; i++)
            {
                if (this.enemies[i].alive)
                {
                    enemiesAlive++;
                    this.game.physics.arcade.collide(this.tank, this.enemies[i].tank);
                    this.game.physics.arcade.overlap(this.bullets, this.enemies[i].tank, this.bulletHitEnemy, null, this);
                    this.enemies[i].update();
                }
            }


            this.land.tilePosition.x = - this.game.camera.x;
            this.land.tilePosition.y = - this.game.camera.y;

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                this.tank.fire(this.bullets);
            }
        }

        bulletHitPlayer(tank:Phaser.Sprite, bullet:Phaser.Sprite) {
            bullet.kill();
        }

        bulletHitEnemy(tank:Phaser.Sprite, bullet:Phaser.Sprite) {
            bullet.kill();

            var destroyed:number = this.enemies[tank.name].damage();

            if (destroyed)
            {
                var explosionAnimation = this.explosions.getFirstExists(false);
                explosionAnimation.reset(tank.x, tank.y);
                explosionAnimation.play('kaboom', 30, false, true);
            }
        }
    }
}
