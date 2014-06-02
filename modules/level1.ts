module BCW {
    enum SnapType {TANK, TURRET}

    interface Snap {
        point: Phaser.Point;
        type: SnapType;
    }

    class UserControl {
        snapMap:  {[index: number]: Snap; } = {};
        private movePoint = new Phaser.Point();
        private vector = new Phaser.Point();


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
                Phaser.Point.subtract(this.movePoint, snap.point, this.vector);
                if (snap.type === SnapType.TANK) {
                    this.tank.move(
                        this.vector.getMagnitude() * 2,
                        Math.atan2(this.vector.y, this.vector.x)
                    );
                } else if (snap.type === SnapType.TURRET) {
                    this.tank.aim(Math.atan2(this.vector.y, this.vector.x));
                }

            }
        }

        onUp(pointer:Phaser.Pointer) {
            var snap = this.snapMap[pointer.id];
            if (snap.type === SnapType.TANK) {
                this.tank.stop();
            } else if (snap.type === SnapType.TURRET) {
                this.tank.fire();
            }
            delete this.snapMap[pointer.id];
        }

        enable() {
            this.game.input.onDown.add(this.onDown, this);
            this.game.input.setMoveCallback(this.onMove, this);
            this.game.input.onUp.add(this.onUp, this);
        }
    }
    export class Bullet extends Phaser.Sprite {
        speed = 1000;
        damageAmount = 2;
        constructor(public owner:Tank, public x:number, public y:number) {
            super(owner.game, x, y, 'bullet');
            this.anchor.setTo(0, 0.5);
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.checkWorldBounds = true;
            this.outOfBoundsKill = true;
            this.exists = false;
            this.visible = false;
            this.alive = false;
        }
        fire() {
            // this.game.physics.arcade.velocityFromRotation(
                // this.rotation,
                // this.speed,
                // this.body.velocity
            // );
        }
        update() {
            if (this.visible) {
                this.owner.game.debug.spriteCoords(this, 16, 116, 'red');
            }
        }
    }
    export class Level1 extends Phaser.State {
        turretAngle = 0;
        fireRate = 0;
        nextFire = 0;
        currentSpeed = 0;
        explosions:Phaser.Group;
        bullets:Phaser.Group;
        tanks:Phaser.Group;
        land:Phaser.TileSprite;
        tank:Tank;

        create() {
            this.game.world.setBounds(-1000, -1000, 2000, 2000);

            //  Our tiled scrolling background
            this.land = this.game.add.tileSprite(0, 0, 800, 600, 'earth');
            this.land.fixedToCamera = true;

            this.tank = new Tank(this, 0, 0);
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
        }

        update() {
            this.game.physics.arcade.overlap(this.bullets, this.tanks, this.onBulletHit, null, this);
            this.game.physics.arcade.collide(this.tanks, this.tanks);
            this.tanks.callAll('update');

            this.land.tilePosition.x = - this.game.camera.x;
            this.land.tilePosition.y = - this.game.camera.y;
            // this.game.debug.inputInfo(16, 16);
        }

        onBulletHit(tank:Tank, bullet:Bullet) {
        }

        bulletHitPlayer(tank:Phaser.Sprite, bullet:Phaser.Sprite) {
            bullet.kill();
        }

        // bulletHitEnemy(tank:Phaser.Sprite, bullet:Phaser.Sprite) {
            // bullet.kill();

            // var destroyed:number = this.enemies[tank.name].damage();

            // if (destroyed)
            // {
                // var explosionAnimation = this.explosions.getFirstExists(false);
                // explosionAnimation.reset(tank.x, tank.y);
                // explosionAnimation.play('kaboom', 30, false, true);
            // }
        // }
    }
}
