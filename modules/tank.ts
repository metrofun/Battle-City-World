module BCW {
    export class Tank extends Phaser.Sprite {
        BULLET_POOL_SIZE = 10;
        shadow: Phaser.Sprite;
        turret: Phaser.Sprite;
        bullets: Phaser.Group;
        fireRate = 300; //ms
        health = 2;
        nextFire = 0;

        constructor(public game:Phaser.Game, public x:number, public y:number) {
            super(game, x, y, 'tank', 'tank1');
            this.alive = true;
            this.exists = true;
            this.visible = true;
            this.anchor.setTo(0.5, 0.5);
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.collideWorldBounds = true;
            this.addSpriteChilds();
            this.initBulletPool();
        }
        private addSpriteChilds() {
            var shadow = new Phaser.Sprite(this.game, this.x, this.y, 'tank', 'shadow');
            shadow.z = 0;
            shadow.x = 0;
            shadow.y = 0;
            shadow.anchor.setTo(0.5, 0.5);
            this.turret = new Phaser.Sprite(this.game, this.x, this.y, 'tank', 'turret');
            this.turret.x = 0;
            this.turret.y = 0;
            this.turret.anchor.setTo(0.3, 0.5);

            this.addChild(shadow);
            this.addChild(this.turret);
        }
        private initBulletPool() {
            var i:number;
            this.bullets = this.game.add.group();
            for (i = 0; i < this.BULLET_POOL_SIZE; i++) {
                this.bullets.add(new Bullet(this, 0, 0));
            }
        }
        fire() {
            var bullet:Bullet;

            if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                this.nextFire = this.game.time.now + this.fireRate;

                bullet = this.bullets.getFirstExists(false);
                bullet.reset(this.x, this.y);
                bullet.anchor.setTo(0, 0.5);
                bullet.rotation = this.rotation + this.turret.rotation;

                bullet.fire();
            }
        }
        move(speed:number, rotation:number) {
            this.rotation = rotation;

            this.game.physics.arcade.velocityFromRotation(
                rotation,
                speed,
                this.body.velocity
            );
        }
        aim(rotation:number) {
            this.turret.rotation = rotation - this.rotation;
        }
        stop() {
            this.body.velocity.setTo(0, 0);
        }
        update() {
            // this.game.debug.inputInfo(16, 16);
        }
    }
}
