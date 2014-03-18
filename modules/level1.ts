module BCW {
    export class Level1 extends Phaser.State {
        cursors:{
            up: Phaser.Key;
            down: Phaser.Key;
            left: Phaser.Key;
            right: Phaser.Key;
        }
        fireRate = 0;
        nextFire = 0;
        currentSpeed = 0;
        explosions:Phaser.Group;
        enemyBullets:Phaser.Group;
        bullets:Phaser.Group;
        land:Phaser.TileSprite;
        turret:Phaser.Sprite;
        shadow:Phaser.Sprite;
        tank:Phaser.Sprite;
        enemies:EnemyTank[] = [];

        create() {
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
                this.enemies.push(new EnemyTank(i.toString(), this.game, this.tank, this.enemyBullets));
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
            for (var i = 0; i < 10; i++)
            {
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
                this.game.physics.arcade.velocityFromRotation(
                    this.tank.rotation, this.currentSpeed, this.tank.body.velocity
                );
            }

            this.land.tilePosition.x = - this.game.camera.x;
            this.land.tilePosition.y = - this.game.camera.y;

            //  Position all the parts and align rotations
            this.shadow.x = this.tank.x;
            this.shadow.y = this.tank.y;
            this.shadow.rotation = this.tank.rotation;

            this.turret.x = this.tank.x;
            this.turret.y = this.tank.y;

            this.turret.rotation = this.game.physics.arcade.angleToPointer(this.turret);

            if (this.game.input.activePointer.isDown)
            {
                //  Boom!
                this.fire();
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

        fire() {
            if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                this.nextFire = this.game.time.now + this.fireRate;

                var bullet:Phaser.Sprite = this.bullets.getFirstExists(false);

                bullet.reset(this.turret.x, this.turret.y);
                bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 1000, this.input.activePointer, 500);
            }
        }
    }
}
