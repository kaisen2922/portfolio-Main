/**
 * DIGITAL GRAND LINE — PHASER 3 EDITION
 * Full-screen, sprite-scaled, full-featured platformer
 */

const WORLD_WIDTH = 5000;

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "gameContainer",
  backgroundColor: '#050000',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 1200 }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

// Globals
let player, cursors, wasd, enemies, platforms, attackHitbox;
let canAttack = true;
let score = 0;
let scoreText, hpText;
let playerHP = 3;
let isInvincible = false;
let activeScene;

/* ─────────────────────────────────────────── */
/*  PRELOAD                                    */
/* ─────────────────────────────────────────── */
function preload() {
  this.load.image("player", "assets/player.png");
  this.load.image("enemy", "assets/enemy.png");
}

/* ─────────────────────────────────────────── */
/*  CREATE                                     */
/* ─────────────────────────────────────────── */
function create() {
  activeScene = this;
  const W = this.scale.width;
  const H = this.scale.height;
  const groundY = H - 60;

  /* 🌌 PARALLAX SKY */
  const sky = this.add.graphics();
  sky.fillGradientStyle(0x050000, 0x050000, 0x150000, 0x1a0000, 1);
  sky.fillRect(0, 0, WORLD_WIDTH, H);
  sky.setScrollFactor(0.06);

  /* 🔴 Red moon accents */
  for (let i = 0; i < 10; i++) {
    const g = this.add.graphics();
    g.fillStyle(0x500000, 0.25);
    g.fillCircle(
      Phaser.Math.Between(0, WORLD_WIDTH),
      Phaser.Math.Between(40, H * 0.55),
      Phaser.Math.Between(20, 90)
    );
    g.setScrollFactor(Phaser.Math.FloatBetween(0.1, 0.35));
  }

  /* 🧱 GROUND (drawn — no image, no checkerboard) */
  platforms = this.physics.add.staticGroup();

  for (let x = 0; x < WORLD_WIDTH; x += 200) {
    const g = this.add.graphics();
    g.fillStyle(0x1a0000, 1);
    g.fillRect(x, groundY, 200, 60);
    g.lineStyle(2, 0xD4A96A, 0.7);
    g.strokeRect(x, groundY, 200, 60);

    const body = this.add.rectangle(x + 100, groundY + 30, 200, 60);
    this.physics.add.existing(body, true);
    platforms.add(body);
  }

  /* 🪨 FLOATING PLATFORMS */
  mkPlatform(this, 700,  groundY - 150, 300);
  mkPlatform(this, 1400, groundY - 200, 250);
  mkPlatform(this, 2200, groundY - 170, 320);
  mkPlatform(this, 3000, groundY - 190, 260);
  mkPlatform(this, 3800, groundY - 150, 290);

  /* 👤 PLAYER — scaled to a reasonable game size */
  player = this.physics.add.sprite(120, groundY - 80, "player");
  player.setScale(0.15);          // ← Fix: scale down from large PNG
  player.setCollideWorldBounds(false);
  player.setBounce(0.05);
  // Tighten physics body to match scaled size
  player.body.setSize(
    player.texture.realWidth  * 0.6,
    player.texture.realHeight * 0.85
  );

  /* 👹 ENEMIES */
  enemies = this.physics.add.group();
  [900, 1850, 2800, 3650].forEach(x => spawnEnemy(this, x, groundY - 60));

  /* ⚔️ ATTACK HITBOX (invisible) */
  attackHitbox = this.add.rectangle(-9999, -9999, 55, 55, 0xffcc00, 0);
  this.physics.add.existing(attackHitbox);
  attackHitbox.body.setAllowGravity(false);
  attackHitbox.body.setImmovable(true);

  /* 💥 COLLISIONS */
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(enemies, platforms);
  this.physics.add.overlap(attackHitbox, enemies, hitEnemy, null, this);
  this.physics.add.overlap(player, enemies, hitPlayer, null, this);

  /* 📷 CAMERA */
  this.cameras.main.setBounds(0, 0, WORLD_WIDTH, H);
  this.cameras.main.startFollow(player, true, 0.12, 0.12);

  /* ⌨️ CONTROLS */
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({ up:'W', left:'A', right:'D' });
  this.input.keyboard
    .addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    .on('down', () => { if (canAttack) attack(this); });

  /* 📊 HUD */
  scoreText = this.add.text(24, 24, 'BOUNTY: 0', {
    fontSize: '20px', fontFamily: 'Outfit, sans-serif',
    color: '#D4A96A', fontStyle: 'bold'
  }).setScrollFactor(0).setDepth(200);

  hpText = this.add.text(24, 54, '❤️❤️❤️', {
    fontSize: '22px'
  }).setScrollFactor(0).setDepth(200);

  this.add.text(W / 2, H - 22,
    '← / A  Move     ↑ / W  Jump     SPACE  Attack', {
    fontSize: '13px', fontFamily: 'Outfit, sans-serif',
    color: 'rgba(255,255,255,0.3)'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
}

/* ─────────────────────────────────────────── */
/*  UPDATE                                     */
/* ─────────────────────────────────────────── */
function update() {
  if (!player || !player.active) return;

  const H = this.scale.height;
  const left  = cursors.left.isDown  || wasd.left.isDown;
  const right = cursors.right.isDown || wasd.right.isDown;
  const jump  = (cursors.up.isDown   || wasd.up.isDown) && player.body.touching.down;

  // Movement + lean animation
  if (left) {
    player.setVelocityX(-280);
    player.flipX = true;
    player.setAngle(-7);
  } else if (right) {
    player.setVelocityX(280);
    player.flipX = false;
    player.setAngle(7);
  } else {
    player.setVelocityX(0);
    player.setAngle(0);
  }

  if (jump) {
    player.setVelocityY(-700);
    // Squash & stretch
    this.tweens.add({
      targets: player,
      scaleX: 0.18, scaleY: 0.12,
      yoyo: true, duration: 110, ease: 'Power1'
    });
  }

  // Enemy AI
  enemies.getChildren().forEach(en => {
    if (!en.active || en.isHit) return;
    const d = Phaser.Math.Distance.Between(player.x, player.y, en.x, en.y);
    if (d < 480) {
      en.setVelocityX(en.x > player.x ? -95 : 95);
      en.flipX = en.x > player.x;
    } else {
      en.setVelocityX(0);
    }
  });

  // Fall / edge wrap
  if (player.x < 10) player.x = 10;
  if (player.x > WORLD_WIDTH - 10) player.x = WORLD_WIDTH - 10;
  if (player.y > H + 150) respawnPlayer();
}

/* ─────────────────────────────────────────── */
/*  HELPERS                                    */
/* ─────────────────────────────────────────── */
function mkPlatform(scene, x, y, w) {
  const g = scene.add.graphics();
  g.fillStyle(0x200000, 1);
  g.fillRect(x, y, w, 22);
  g.lineStyle(2, 0xD4A96A, 0.55);
  g.strokeRect(x, y, w, 22);

  const body = scene.add.rectangle(x + w / 2, y + 11, w, 22);
  scene.physics.add.existing(body, true);
  platforms.add(body);
}

function spawnEnemy(scene, x, y) {
  const en = enemies.create(x, y, "enemy");
  en.setScale(0.12);              // ← Fix: scale down from large PNG
  en.setBounce(0.1);
  en.setCollideWorldBounds(false);
  en.body.setSize(
    en.texture.realWidth  * 0.65,
    en.texture.realHeight * 0.85
  );
  en.hp = 2;
  en.isHit = false;
}

function attack(scene) {
  canAttack = false;
  const offset = player.flipX ? -55 : 55;
  attackHitbox.setPosition(player.x + offset, player.y);

  // Slash tween
  scene.tweens.add({
    targets: player,
    angle: player.flipX ? -28 : 28,
    yoyo: true, duration: 100
  });
  player.setTint(0xffcc00);

  setTimeout(() => {
    attackHitbox.setPosition(-9999, -9999);
    player.clearTint();
    canAttack = true;
  }, 220);
}

function hitEnemy(hitbox, en) {
  if (!en.active || en.isHit) return;
  en.hp--;
  en.isHit = true;
  en.setTint(0xff2200);
  en.setVelocityY(-320);
  en.setVelocityX(player.flipX ? -420 : 420);

  if (en.hp <= 0) {
    score += 100;
    scoreText.setText('BOUNTY: ' + score);
    activeScene.tweens.add({
      targets: en, alpha: 0, scaleX: 0.2, scaleY: 0.2,
      duration: 280, onComplete: () => en.destroy()
    });
  } else {
    setTimeout(() => { if (en.active) { en.clearTint(); en.isHit = false; } }, 450);
  }
}

function hitPlayer(p, en) {
  if (isInvincible || en.isHit) return;
  playerHP--;
  isInvincible = true;

  hpText.setText('❤️'.repeat(Math.max(playerHP, 0)));
  player.setTint(0xff0000);
  player.setVelocityY(-380);
  player.setVelocityX(player.x < en.x ? -330 : 330);

  if (playerHP <= 0) {
    setTimeout(respawnPlayer, 400);
  } else {
    activeScene.tweens.add({
      targets: player, alpha: 0.3,
      yoyo: true, repeat: 5, duration: 110,
      onComplete: () => { player.clearTint(); player.setAlpha(1); isInvincible = false; }
    });
  }
}

function respawnPlayer() {
  playerHP = 3;
  hpText.setText('❤️❤️❤️');
  player.setPosition(120, activeScene.scale.height - 150);
  player.setVelocity(0, 0);
  player.clearTint();
  player.setAlpha(1);
  isInvincible = false;
  score = 0;
  scoreText.setText('BOUNTY: 0');
}
