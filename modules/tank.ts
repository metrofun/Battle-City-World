module BCW {
    export class Tank extends Phaser.Sprite {
        BULLET_POOL_SIZE = 10;
        shadow: Phaser.Sprite;
        turret: Phaser.Sprite;
        bullets: Phaser.Group;
        fireRate = 300; //ms
        nextFire = 0;
        private gunpoint = new Phaser.Point();

        constructor(public level:Level1, public x:number, public y:number) {
            super(level.game, x, y, 'tank', 'tank1');
            this.anchor.setTo(0.5, 0.5);
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.collideWorldBounds = true;
            this.addSpriteChilds();
            this.initBulletPool();
        }
        private addSpriteChilds() {
            var shadow = new Phaser.Sprite(this.game, this.x, this.y, 'tank', 'shadow');
            shadow.z = 0;
            shadow.anchor.setTo(0.5, 0.5);
            this.turret = new Phaser.Sprite(this.game, this.x, this.y, 'tank', 'turret');
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
        private updateGunpoint() {
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
        }
        fire() {
            var bullet:Bullet;

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
            this.game.debug.inputInfo(16, 16);
            this.game.debug.spriteInfo(this, 16, 116)
        }
    }
}
