module BCW {
    export class Preloader extends Phaser.State {
        preloadBar: Phaser.Sprite;

        preload() {
            //  Set-up our preloader sprite
            this.preloadBar = this.add.sprite(200, 250, 'preloadBar');
            this.load.setPreloadSprite(this.preloadBar);

            this.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
            this.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');
            this.load.image('logo', 'assets/logo.png');
            this.load.image('bullet', 'assets/bullet.png');
            this.load.image('earth', 'assets/scorched_earth.png');
            this.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
        }

        create() {
            var tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(this.startMainMenu, this);

        }

        startMainMenu() {
            this.game.state.start('Level1', true, false);
        }
    }
}
