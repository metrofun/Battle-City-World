module BCW {
    export class EnemyTank {
        shadow: Phaser.Sprite;
        tank: Phaser.Sprite;
        turret: Phaser.Sprite;

        health = 3;
        fireRate = 1000;
        nextFire = 0;
        alive = true;

        constructor(name, public game:Phaser.Game, public player:Phaser.Sprite, public bullets:Phaser.Group) {
            var x:number = this.game.world.randomX;
            var y:number = this.game.world.randomY;

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

        update() {
            this.shadow.x = this.tank.x;
            this.shadow.y = this.tank.y;
            this.shadow.rotation = this.tank.rotation;

            this.turret.x = this.tank.x;
            this.turret.y = this.tank.y;
            this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);

            if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300) {
                if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                    this.nextFire = this.game.time.now + this.fireRate;

                    var bullet:Phaser.Sprite = this.bullets.getFirstDead();

                    bullet.reset(this.turret.x, this.turret.y);

                    bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
                }
            }
        }

        damage() {
            this.health -= 1;

            if (this.health <= 0) {
                this.alive = false;
                this.shadow.kill();
                this.tank.kill();
                this.turret.kill();

                return true;
            }

            return false;
        }
    }
}
