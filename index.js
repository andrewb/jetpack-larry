a.width = a.height = 640;
a.style.width = "320px";
// Scale for retina
c.scale(2, 2);
// k = keys
// n = entities
k = n = [];
// s = score
// u = time since spawn
// w = player y velocity
// z = player frame
s = u = w = z = 0;
// o = is player alive?
o = 1;
// y = player y
y = 240;
// (S)prite
// a = run length encoded string
// x = sprite x
// y = sprite y
// w = width, i.e. rects in row
// s = size of rect
// See https://levelup.gitconnected.com/having-fun-with-run-length-encoded-sprites-662d6a8147c8
S = (a, x, y, w, s = 320) => {
  // decode string using regex and map over each character
  // If all of the RLE sprites used single digits we could use /(\w)(\d)/g
  // to save a character.
  [...a.replace(/(\w)(\d+)/g, (_, q, r) => q.repeat(r))].map((j, i) => {
    // q = column
    q = i % w;
    // Get color
    // 'a' = hair/feet
    // 'b' = skin
    // 'c' = body/ground
    // 'd' = laser/coin
    // 'e' = cross/highlight
    // 'f' = background 1
    // 'g' = background 2
    h = '213ca8457fd5ffb68a79b'.match(/.../g)[j.charCodeAt(0) - 97];
    c.fillStyle = '#' + h;
    h && c.fillRect(
      // Get x coord for 'pixel'
      ~~(x + q * s),
      // Get y coord for 'pixel' (y + row * s)
      ~~(y + ~~(i / w) * s),
      s,
      s
    );
  });
}
// (T)ick
// e = timestamp
T = e => {
  // Restart when "s" key is pressed?
  if (k[83]) {
    // Reset game values
    k = n = [];
    s = u = w = z = 0;
    o = 1;
    y = 240;
  }
  // Calculate delta
  // 1e3 is shorter than 1000
  l = (e - t) / 1e3;
  // Update time since last spawn
  u += l;
  t = e;
  // Is player alive?
  if (o) {
    // Spawn every nth seconds
    if (u > 1) {
      // Entity type (0 = coin, 1 = vertical laser, 2 = horizontal laser)
      h = 0 | Math.random() * 3;
      // Vertical offset
      i = 0 | Math.random() * 5;
      // Reset time since last spawn
      u = 0;
      // Add entities
      // Spawn 1 laser or 3 coins
      [...(h ? '1' : '123')].map($ => n.push([
        // [0] x coord
        // Place offscreen. Coins will be spaced 30px apart.
        320 + 30 * $,
        // [1] y coord
        i * 40,
        // [2] width
        // h > 1 is fewer bytes than h == 2
        h > 1 ? 100 : 20,
        // [3] height
        h == 1 ? 100 : 20,
        // [4] type
        h
      ]));
    }
    // Update player
    // Animate sprite at 10fps
    // 10 * (e - t) / 1e3 becomes (e - t) / 100
    // Which is the same as l * 10
    z += l * 10;
    // Boosting?
    k[32] ? w = -180 : w;
  }
  // Update y velocity
  // Gravity is 960
  w += 960 * l;
  y += w * l;
  // Clamp to bounds (y)
  // Keep player above ground plane (y)
  if (y >= 240) {
    y = 240;
    w = 0;
  }
  // Keep player in bounds
  if (y < 0) {
    y = w = 0;
  }
  // Draw background
  S('fgf', z * -10 % 640, 0, 3);
  // Render and update entities
  // IRL reduce would be a better choice, but map and pushing to a temp array
  // is fewer bytes
  f = [];
  n.map(e => {
    // Move entity to left (if player is alive)
    e[0] -= 120 * l * o;
    // Destructure to save bytes
    // h = x coord
    // i = y coord
    // j = width
    // q = height
    // r = type
    [h, i, j, q, r] = e;
    // IRL we'd want to remove out of bound entities, but that uses up bytes
    // e.g. if (h < 320 && h > -20)
    // Simple hit detection (also checks if game if player is alive)
    // 90 is player x (60) + width (30)
    60 < h + j && 90 > h && y < i + q && 30 + y > i && o
      // Hit, game over if laser, increment score if coin
      ? r ? (f.push(e), o = 0) : s++
      : f.push(e);
    // Draw
    S(['xd2xde2d2e2dxd2','xa2xc8xdex2dex2dex2dex2dex2dex2dex2dex2dex2dex2dex2dex2dex2dexc8xa2', 'xc2x14c2xac2d14c2a2c2e14c2axc2x14c2'][r], h, i, r > 1 ? 20 : 4, 5);
  });
  // Re-assign entities
  n = f;
  // Draw player
  S(
    [
      // Walking
      'x2a3x3abx4b3x2abcx3abcx4c2x3ac2x4a2',
      'x2a3x3abx4b3x2abcx3acbx4c2xaxc3ax2a2',
      'x3ax4a2x4abx4b3x2abcx3abcx4c3x2a2xa2',
      'x2a3x3abx4b3x2abcx3bc2x4c2x2ac4xax2a2',
      // Boosting
      'x2a3x3abx4b3x2abcx3abcx3dc2x3ec2x4a2',
      // Dead
      'x2e2x4e2x2e9e3x2e2x4e2x4e2x4e2'
    ][
      // Equivalent to
      // if (o) {
      //   if (k[32]) {
      //     j = 4 // Boosting
      //   }
      //   else if (w) {
      //     j = 2 // Falling
      //   }
      //   else {
      //     j = ~~z % 4 // Walking
      //   }
      // } else {
      //   j = 5
      // }
      o ? k[32] ? 4 : w ? 2 : ~~z % 4 : 5
    ],
    // Player x
    60,
    // Player y
    y,
    6,
    5,
  );
  // Draw floor
  // The second char is used to set the color of the text
  S('ce', 0, 280, 1);
  c.fillText(s, 10, 20);
  // Loop
  requestAnimationFrame(T);
}
// Start loop
// t = time
T(t = 0);
// x.type is 'keyup' or 'keydown'
// x.type[5] is undefined on 'keyup'
onkeyup = onkeydown = e => k[e.which] = e.type[5];
