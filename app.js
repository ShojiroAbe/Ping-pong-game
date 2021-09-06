//ベクトルのクラスを定義
//constructorはクラスを初期化した時に実行される関数
//x座標y座標の値を持つ
class Vec {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get len() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set len(value) {
    const fact = value / this.len;
    this.x *= fact;
    this.y *= fact;
  }
}

//長方形をクラスを定義
class Rect {
  constructor(w, h) {
    this.pos = new Vec;
    this.size = new Vec(w, h);
  }

  //ボールの中央を起点に跳ね返っているので
  //壁の左端、右端、上、下を定義する
  get left() {
    return this.pos.x - this.size.x / 2;
  }
  get right() {
    return this.pos.x + this.size.x / 2;
  }
  get top() {
    return this.pos.y - this.size.y / 2;
  }
  get bottom() {
    return this.pos.y + this.size.y / 2;
  }
}

//ボールクラスを定義
//Rectを継承するのでextendsを使う
//Rectが親クラスになる
class Ball extends Rect {
  constructor() {
    //superで親クラスを初期化
    super(10, 10);
    //速度
    this.vel = new Vec;
  }
}

//Playerクラスを用意
class Player extends Rect {
  constructor() {
    super(20, 100);
    this.score = 0;
  }
}

//Pongクラスを用意
//このゲーム環境全体を設定するようなクラス
class Pong {
  constructor(canvas) {
    //_変数（アンダーバー変数）はクラス内でしか使わない変数のこと
    this._canvas = canvas;
    // 二次元グラフィックスのコンテキストを取得
    this._context = canvas.getContext("2d");

    //Ballクラスを使い、インスタンス(Ball)を作成
    this.ball = new Ball;

    this.players = [
      new Player,
      new Player
    ];

    //playerの初期位置を設定
    this.players[0].pos.x = 40;
    this.players[1].pos.x = this._canvas.width - 40;
    this.players.forEach(player => {
      player.pos.y = this._canvas.height / 2;
    });


    let lastTime;

    const callback = (millis) => {
      if(lastTime) {
        this.update((millis - lastTime) / 1000);
      }
      lastTime = millis;
      requestAnimationFrame(callback);
      //requestAnimationFrame()メソッドは、ブラウザにアニメーションを行いたいことを知らせ、指定した関数を呼び出して次の描画の前にアニメーションを更新することを要求します
    }

    callback();

    //スコアを描画
    this.CHAR_PIXEL = 10;
    //1は白く塗りつぶし、0は塗りつぶさない
    this.CHARS = [
      '111101101101111',
      '010010010010010',
      '111001111100111',
      '111001111001111',
      '101101111001001',
      '111100111001111',
      '111100111101111',
      '111001001001001',
      '111101111101111',
      '111101111001111'
    ].map(str => {
      const canvas = document.createElement("canvas");
      canvas.height = this.CHAR_PIXEL * 5;
      canvas.width = this.CHAR_PIXEL * 3;

      const context = canvas.getContext("2d");
     context.fillStyle = "#fff";
     str.split("").forEach((fill, i) => {
       if(fill === "1") {
         context.fillRect(
           (i % 3) * this.CHAR_PIXEL,
           (i / 3 | 0) * this.CHAR_PIXEL,
           this.CHAR_PIXEL,
           this.CHAR_PIXEL);
       }
    });
    return canvas;
  });

    this.reset();
  }

  //ラケットの衝突判定
  collide(player, ball) {
    if(player.left < ball.right && player.right > ball.left
    && player.top < ball.bottom && player.bottom > ball.top) {
      const len = ball.vel.len;
      ball.vel.x = -ball.vel.x;
      ball.vel.y += 300 * (Math.random() - .5);
      ball.vel.len = len * 1.05;
    }
  }


  draw() {
      this._context.fillStyle = "#000";
      this._context.fillRect(0, 0, canvas.width, canvas.height);
      this.drawRect(this.ball);

      this.players.forEach(player => this.drawRect(player))

      this.drawScore();
    }

  drawRect(rect) {
    this._context.fillStyle = "#fff";
    this._context.fillRect(rect.left, rect.top,
    rect.size.x, rect.size.y);
  }

  drawScore() {
    const align = this._canvas.width / 3;
    const CHAR_W = this.CHAR_PIXEL * 4;
    this.players.forEach((player, index) => {
      const chars = player.score.toString().split("");
      const offset = align * (index + 1) - (CHAR_W * chars.length / 2) + this.CHAR_PIXEL / 2;

      chars.forEach((char, pos) => {
        this._context.drawImage(this.CHARS[char | 0],
        offset + pos * CHAR_W, 20);
      });
    })
  }

  reset(){
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;

    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
  }

  start() {
    if(this.ball.vel.x === 0 && this.ball.vel.y === 0){
      // ボールの初期値を設定
      this.ball.vel.x = 300 * (Math.random() > .5 ? 1 : -1);
      this.ball.vel.y = 300 * (Math.random() * 2 -1 );

      this.ball.vel.len = 200;
    }
  }

  update(dt) {
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;

    //壁衝突判定　
    if(this.ball.left < 0 || this.ball.right > canvas.width) {
      //スコアをカウント
      let playerId = this.ball.vel.x < 0 | 0;
      // 上の一文と同じ意味
      // if(this.ball.vel.x < 0) {
      //   playerId = 1;
      // } else {
      //   playerId = 0;
      // }

      this.players[playerId].score ++;
      this.reset();

      this.ball.vel.x = -this.ball.vel.x;
    }
    if(this.ball.top < 0 || this.ball.bottom > canvas.height) {
      this.ball.vel.y = -this.ball.vel.y;
    }

    //CPU(左)をボールのy座標に合わせる
    this.players[1].pos.y = this.ball.pos.y;

    this.players.forEach(player => this.collide(player, this.ball));


    this.draw();
  }
}
// getContextメソッドで描画機能を有効します
// キャンパス要素を取得
const canvas = document.getElementById("pong");
const pong = new Pong(canvas);

//ラケットをマウスで動かす
canvas.addEventListener("mousemove", event => {
  pong.players[0].pos.y = event.offsetY;
})
// クリックでpong（ゲーム）スタート
canvas.addEventListener("click", event => {
  pong.start();
})
