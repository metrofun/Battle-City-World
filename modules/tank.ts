module BCW {
    export class Tank extends Phaser.Sprite {
        acceleration = 300;
        angularVelocity = 3;

        deltaVelocity = 0;
        deltaRotation = 0;

        bulletSpeed = 1000;
        shadow: Phaser.Sprite;
        turret: Phaser.Sprite;
        fireRate = 3000; //ms
        nextFire = 0;

        constructor(public game:Phaser.Game, public x, public y) {
            super(game, x, y, 'tank', 'tank1');
            this.anchor.setTo(0.5, 0.5);
            game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.collideWorldBounds = true;
            var shadow = new Phaser.Sprite(game, x, y, 'tank', 'shadow');
            shadow.x = -shadow.width / 2;
            shadow.y = -shadow.height / 2;
            shadow.z = 0;
            this.turret = new Phaser.Sprite(game, x, y, 'tank', 'turret');
            this.turret.x = -this.turret.width / 2;
            this.turret.y = -this.turret.height / 2;

            this.addChild(shadow);
            this.addChild(this.turret);
        }
        fire(bullets:Phaser.Group) {
            if (this.game.time.now > this.nextFire && bullets.countDead() > 0) {
                this.nextFire = this.game.time.now + this.fireRate;

                var bullet:Phaser.Sprite = bullets.getFirstExists(false);

                bullet.reset(this.turret.x, this.turret.y);
                bullet.angle = this.turret.angle;

                this.game.physics.arcade.velocityFromRotation(
                    this.turret.rotation,
                    this.bulletSpeed,
                    bullet.body.velocity
                );
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
        stop() {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }
        update() {
            // this.rotation = this.body.rotation;
            // this.body.rotation += this.deltaRotation;
            // this.body.rotation = this.game.physics.arcade.angleToPointer(this);
            // this.game.physics.arcade.velocityFromRotation(
                // this.body.rotation,
                // this.body.velocity.getMagnitude() + this.deltaVelocity,
                // this.body.velocity
            // );
            // this.deltaRotation = 0;
            // this.deltaVelocity = 0;
        }
    }
}
