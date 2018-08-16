var window = window;

var game =
{
	a: {},

	background:
	{
		canvas: {},
		context: {},
		i: new Image (),

		load: function (window)
		{
			let canvas = window.document.createElement ('canvas');
				canvas.style.position = 'fixed';
				canvas.style.left = 0;
				canvas.style.top = 0;
				canvas.style.zIndex = 0;
			game.background.canvas = canvas;
			game.background.resize (canvas, window);
			game.background.context = canvas.getContext ('2d');
			game.background.context.imageSmoothingEnabled = false;
			window.document.body.appendChild (canvas);
		},

		resize: function (canvas, window)
		{
			canvas.height = window.innerHeight;
			canvas.width = window.innerWidth;
			game.background.context.imageSmoothingEnabled = false;
		},

		set:
		{
			set i (i)
			{
				game.background.i = i;
				game.background.context.drawImage (i, 0, 0, window.innerWidth, window.innerHeight);
			}
		},
	},

	canvas:
	{
		canvas: {},
		context: {},

		load: function (window)
		{
			let canvas = window.document.createElement ('canvas');
				canvas.style.position = 'fixed';
				canvas.style.left = 0;
				canvas.style.top = 0;
				canvas.style.zIndex = 1;
			game.canvas.canvas = canvas;
			game.canvas.resize (canvas, window);
			game.canvas.context = canvas.getContext ('2d');
			game.canvas.context.imageSmoothingEnabled = false;
			window.document.body.appendChild (canvas);
		},

		resize: function (canvas, window)
		{
			canvas.height = window.innerHeight;
			canvas.width = window.innerWidth;
			game.canvas.context.imageSmoothingEnabled = false;
		}
	},

	create:
	{
		animation: function (_)
		{
			let animation = game.create.sprite (_);
				animation.a = _.a;
				animation.action = _.action || function () {};
				animation.delay = _.delay || game.window.tick;
				animation.loops = _.loops;
				animation.step = _.step || 0;
				animation.steps = 0;
				animation.time = _.time || game.window.time;
				animation.type = 'animation';

			animation.animate = function ()
			{
				if (animation.loop ())
				{
					if (game.window.time - animation.time >= animation.delay)
					{
						animation.time = game.window.time;
						if (animation.step >= animation.a.length - 1)
						{
							animation.step = 0;
							animation.steps++;
							if (animation.steps >= animation.loops)
							{
								animation.loop = () => 0;
								return;
							}
						}
						else
						{
							animation.step = animation.step + 1;
						}
						animation.i = animation.a[animation.step];
						game.canvas.context.clearRect (animation.x, animation.y, animation.w, animation.h);
						animation.trace ();
						game.get.redraw ();
						game.draw (game.canvas.context);
					}
				}
				else
				{
					animation.action ();
					delete game.object[this.id];
				}
			}

			animation.tick = function ()
			{
				animation.animate ();
			}

			return animation;
		},

		box: function (_)
		{
			let box = game.create.object (_);
				box.c = _.c || '#f00';
				box.drag = _.drag;
				box.h = _.h || 100;
				box.redraw = 0;
				box.type = 'box';
				box.w = _.w || 100;
				box.x = _.x || 0;
				box.y = _.y || 0;
				box.z = _.z || 0;

			box.draw = function (context)
			{
				context.fillStyle = box.c;
				context.fillRect (box.x, box.y, box.w, box.h);
			}

			box.clear = function (context)
			{
				context.clearRect (box.x, box.y, box.w, box.h);
			}

			box.inbox = function (b)
			{
				return ((Math.abs (box.x - b.x + 0.5 * (box.w - b.w)) < 0.5 * Math.abs (box.w + b.w)) && (Math.abs (box.y - b.y + 0.5 * (box.h - b.h)) < 0.5 * Math.abs (box.h + b.h)));
			}

			box.mousedown = function (event)
			{
				//debug
				if (box.drag)
				{
					box.move (event.x, event.y);
				}
			}

			box.move = function (x, y)
			{
				box.clear (game.canvas.context);
				box.trace ();
				box.x = x;
				box.y = y;
				box.trace ();
				game.get.redraw ();
				game.draw (game.canvas.context);
			}

			box.set =
			{
				set z (z)
				{
					box.z = z;
					let layers = game.draws.length - 1
					if (z > layers)
					{
						for (let delta = z - layers; delta--;)
						{
							game.draws.push ([]);
						}
					}
					game.draws[z].push (box);
				}
			}

			box.load = function ()
			{
				box.set.z = box.z;
				game.draws[box.z].push (box);
				game.objects.push (box);
			}

			box.trace = function ()
			{
				box.redraw = 1;
				for (let object of game.objects)
				{
					if (!object.redraw)
					{
						if (box.inbox (object))
						{
							object.trace ();
						}
					}
				}
			}

			return box;
		},

		button: function (_)
		{
			let button = game.create.sprite (_);
				button.action = _.action || function () {};
				button.in = _.in || function () {};
				button.out = _.out || function () {};
				button.over = 0;
				button.type = 'button';

				button.active = function (event)
				{
					if (button.over)
					{
						if (!game.get.pointinbox ({ x: event.x, y: event.y }, button))
						{
							button.over = 0;
							game.canvas.canvas.style.cursor = 'default';
							button.out ();
						}
					} else
					{
						if (game.get.pointinbox ({ x: event.x, y: event.y }, button))
						{
							button.over = 1;
							game.canvas.canvas.style.cursor = 'pointer';
							button.in ();
						}
					}
				}

				button.mousedown = function (event)
				{
					if (game.get.pointinbox ({ x: event.x, y: event.y }, button))
					{
						button.action ();
					}
				}

				button.mousemove = function (event)
				{
					button.active (event);
				}

				button.mouseup = function (event)
				{
					button.over = 0;
					button.active (event);
				}

			return button;
		},

		cycle: function (_) {
			let cycle = app.create.object (_);
				cycle.action = _.action || function () {};
				cycle.delay = _.delay || window.delay;
				cycle.ok = _.ok || 1;
				cycle.time = _.time || window.time;
				cycle.type = 'cycle';

				cycle.run = function ()
				{
					if (cycle.ok)
					{
						if (window.time - cycle.time >= cycle.delay)
						{
							cycle.time = window.time;
							cycle.action ();
						}
					}
				}

				cycle.tick = function ()
				{
					cycle.run ();
				}

			return cycle;
		},

		object: function (_)
		{
			let object = _ || {};
				object.id = _.id || game.id++;
				object.tag = _.tag;
				object.type = 'object';

			object.load = function ()
			{
				game.objects.push (object);
			}

			return object;
		},

		sprite: function (_)
		{
			let sprite = game.create.box (_);
				sprite.h = _.h || _.i.clientHeight;
				sprite.i = _.i;
				sprite.type = 'sprite';
				sprite.w = _.w || _.i.clientWidth;

			sprite.draw = function (context)
			{
				context.drawImage (sprite.i, sprite.x, sprite.y, sprite.w, sprite.h);
			}

			return sprite;
		},

		text: function (_)
		{
			let text = window.document.createElement ('div');
				text.i = _.i || new Image ();
				text.id = _.id || game.id++;
				text.type = 'text';

			text.draw = function ()
			{
				text.innerHTML = '<img src="' + text.i.src + '"> ' + _.t;
				text.style.background = _.b || '#0000';
				text.style.color = _.c || '#000';
				text.style.display = 'flex';
				text.style.fontFamily = _.f || 'Arial';
				text.style.height = _.h || '12px';
				text.style.left = _.x + 'px' || 0;
				text.style.userSelect = 'none';
				text.style.position = 'fixed';
				text.style.top = _.y + 'px' || 0;
				text.style.width = _.w || 'auto';
				text.style.zIndex = _.z || 1;
			}

			text.load = function ()
			{
				game.objects.push (text);
			}

			text.resize = function ()
			{
				text.remove ();
			}

			text.draw ();
			window.document.body.appendChild (text);

			return text;
		},

		unit: function (_)
		{
			let unit = game.create.sprite (_);
				unit.acc = _.acc || 2;
				unit.energy =
				{
					max: _.energy || 100,
					now: _.energy || 100,
					old: _.energy || 100,
					rec: _.energy_rec || 1
				},
				unit.speed =
				{
					acc: _.acc || 2,
					cost: _.acc_cost || 2,
					def: _.speed || 1,
					now: _.speed || 1
				}

			unit.go =
			{
				down: function ()
				{
					if (game.key.S)
					{
						unit.move (unit.x, unit.y + unit.speed.now);
					}
				},

				left: function ()
				{
					if (game.key.A)
					{

						unit.move (unit.x - unit.speed.now, unit.y);
					}
				},

				right: function ()
				{
					if (game.key.D)
					{
						unit.move (unit.x + unit.speed.now, unit.y);
					}
				},

				shift: function ()
				{
					if (game.key["\u0010"])
					{
						if (unit.energy.now > 0)
						{
							unit.energy.now = (unit.energy.now - unit.speed.cost >= 0) ? unit.energy.now - unit.speed.cost : 0;
							unit.speed.now = unit.speed.acc * unit.speed.def;
						}
						else
						{
							unit.speed.now = unit.speed.def;
						}
					}
					else
					{
						unit.energy.now = (unit.energy.now + unit.energy.rec <= unit.energy.max) ? unit.energy.now + unit.energy.rec : unit.energy.now;
						unit.speed.now = unit.speed.def;
					}
					if (unit.energy.now != unit.energy.old)
					{
						unit.energy.old = unit.energy.now;
						unit.ui.energy.innerHTML = 'energy: ' + unit.energy.now;
					}
				},

				up: function ()
				{
					if (game.key.W)
					{
						unit.move (unit.x, unit.y - unit.speed.now);
					}
				}
			}

			unit.tick = function ()
			{
				unit.go.down ();
				unit.go.left ();
				unit.go.right ();
				unit.go.shift ();
				unit.go.up ();
			}

			unit.ui =
			{
				energy: {},
				load: function ()
				{
					unit.ui.energy = game.create.text({t: 'energy: ' + unit.energy.now, x: 0, y: 0});
					unit.ui.energy.load ();
				}
			}

			unit.ui.load ();

			return unit;
		}
	},

	draw: function (context)
	{
		for (let z = 0; z < game.draws.length; z++)
		{
			for (let i = 0; i < game.draws[z].length; i++)
			{
				game.draws[z][i].draw (context);
			}
			game.draws[z] = [];
		}
	},

	draws: [[]],

	get:
	{
		set animations (a)
		{
			for (id in a)
			{
				game.a[id] = [];
				for (let i = 0; i < a[id]; i++)
				{
					let image = new Image ();
						image.src = 'data/' + id + ' ' + i + '.png';
						game.a[id].push (image);
				}
			}
		},

		cx: 0,
		cy: 0,

		set images (i)
		{
			for (let n of i)
			{
				let image = new Image ();

				image.onload = function ()
				{
					game.i[n] = image;
				}

				image.src = 'data/' + n + '.png';
			}
		},

		pointinbox: function (p, b)
		{
			return ((p.x > b.x) && (p.x < b.x + b.w) && (p.y > b.y) && (p.y < b.y + b.h));
		},

		r: function (a, b, c)
		{
			if (Array.isArray (a))
			{
				let i = Math.floor (Math.random () * (a.length));
				return a[i];
			}

			if (a == 'color')
			{
				return '#' + ((1<<24)*Math.random()|0).toString(16);
			}

			if (c)
			{
				return Math.floor (Math.random () * (b - a + 1)) + a;
			}

			if (b)
			{
				return Math.random () * (b - a) + a;
			}

			return Math.random ();
		},

		redraw: function ()
		{
			for (let object of game.objects)
			{
				if (object.redraw)
				{
					object.redraw = 0;
					game.draws[object.z].push (object);
				}
			}
		}
	},

	load: function ()
	{
		game.window.load (window);
		game.background.load (window);
		game.canvas.load (window);
		game.scene.load ('run');
	},

	i: [],

	id: 0,

	key:
	{
		update: function (event)
		{
			if (event.type == 'keydown')
			{
				game.key[String.fromCharCode (event.keyCode)] = 1;
			}
			if (event.type == 'keyup')
			{
				game.key[String.fromCharCode (event.keyCode)] = 0;
			}
		}
	},

	objects: [],

	scene:
	{
		load: function (name)
		{
			game.scene.now = name;
			game.scene[name] ();
		},

		now: 'run'
	},

	update: function (event)
	{
		game.key.update (event);
		let type = event.type;
		for (let object of game.objects)
		{
			if (object[type])
			{
				object[type] (event);
			}
		}
	},

	window:
	{
		load: function (window)
		{
			game.window.remove ();
			window.onkeydown = game.update;
			window.onkeyup = game.update;
			window.onmousedown = game.update;
			window.onmousemove = game.update;
			window.onmouseup = game.update;
			window.onresize = function (event)
			{
				game.get.cx = Math.floor (0.5 * window.innerWidth);
				game.get.cy = Math.floor (0.5 * window.innerHeight);
				game.update (event);
				game.background.resize (game.background.canvas, window);
				game.background.set.i = game.background.i;
				game.canvas.resize (game.canvas.canvas, window);
				game.scene.load (game.scene.now);
			};
			game.window.ontick (game.update);
		},

		ontick: function (update)
		{
			window.requestAnimationFrame (game.window.ontick);
			let time = new Date ().getTime ();
			game.window.tick = time - game.window.time;
			game.window.time = time;
			game.update ({tick: game.window.tick, time: game.window.time, type: 'tick'});
			game.draw (game.canvas.context);
		},

		remove: function ()
		{
			Element.prototype.remove = function ()
			{
				this.parentElement.removeChild(this);
			}
			NodeList.prototype.remove = HTMLCollection.prototype.remove = function ()
			{
				for(var i = this.length - 1; i >= 0; i--)
				{
					if(this[i] && this[i].parentElement)
					{
						this[i].parentElement.removeChild(this[i]);
					}
				}
			}
		},

		tick: 0,
		time: new Date ().getTime ()
	},

	wipe: function ()
	{
		game.id = 0;
		game.get.cx = Math.floor (0.5 * window.innerWidth);
		game.get.cy = Math.floor (0.5 * window.innerHeight);
		game.objects = [];
		game.background.context.clearRect (0, 0, game.canvas.canvas.width, game.canvas.canvas.height);
		game.canvas.context.clearRect (0, 0, game.canvas.canvas.width, game.canvas.canvas.height);
		game.canvas.canvas.style.cursor = 'default';
		let divs = window.document.getElementsByTagName ('div');
		for (let div of divs)
		{
			div.remove ();
		}
	}
}

window.onload = game.load;

game.get.animations = { 'test_animation': 4 }

game.get.images = ['coins', 'pc', 'test', 'unit'];

game.scene.menu = function ()
{
	game.wipe ();
	let wh = window.innerHeight;
	let ww = window.innerWidth;
	let cx = Math.floor (0.5 * ww);
	let cy = Math.floor (0.5 * wh);
	let s = Math.floor (0.2 * Math.min (wh, ww));
	let s2 = Math.floor (0.5 * s);

	game.create.box ({c: '#f00', h: s, x: cx - s - s2, y: cy - s - s2, w: s}).load ();
	game.create.box ({c: '#f80', h: s, x: cx - s2, y: cy - s - s2, w: s}).load ();
	game.create.box ({c: '#ff0', h: s, x: cx + s2, y: cy - s - s2, w: s}).load ();

	game.create.box ({c: '#8f0', h: s, x: cx - s - s2, y: cy - s2, w: s}).load ();
	game.create.box ({c: '#0f8', h: s, x: cx - s2, y: cy - s2, w: s}).load ();
	game.create.box ({c: '#0ff', h: s, x: cx + s2, y: cy - s2, w: s}).load ();

	game.create.box ({c: '#08f', h: s, x: cx - s - s2, y: cy + s2, w: s}).load ();
	game.create.box ({c: '#00f', h: s, x: cx - s2, y: cy + s2, w: s}).load ();
	game.create.box ({c: '#80f', h: s, x: cx + s2, y: cy + s2, w: s}).load ();

	game.create.text ({c: '#000', h: 24, t: 'PixelClicker', x: cx - 40, y: cy - 6, z: 1}).load ();

	game.create.button ({action: function () { game.scene.load ('run'); }, h: 64, i: game.i.test, x: 64, y: 64, w: 64, z: 1}).load ();
	game.draw (game.canvas.context);
}

game.scene.run = function ()
{
	game.wipe ();
	game.background.set.i = game.i.test;
	for (let i = 50; i--;)
	{
		game.create.animation
		({
			a: game.a.test_animation,
			c: game.get.r ('color'),
			delay: game.get.r (100, 1000, 1),
			h: 32,
			i: game.i.test,
			loop: () => 1,
			w: 32,
			x: game.get.r (0, window.innerWidth, 1),
			y: game.get.r (0, window.innerHeight, 1),
			z: game.get.r (0, 2, 1)
		}).load ();
	}
	game.create.sprite ({drag: true, i: game.i.test, x: 64, y: 64, z: 1}).load ();
	game.create.button ({action: function () { game.scene.load ('menu'); }, h: 64, i: game.i.test, x: 64, y: 64, w: 64, z: 1}).load ();
	game.create.animation ({a: game.a.test_animation, delay: 1000, i: game.i.test, loop: () => 1, x: 200, y: 64, z: 1}).load ();
	game.create.text ({c: '#555', f: 'Verdana', h: 24, i: game.i.coins, t: '10000', x: 500, y: 50}).load ();
	game.draw (game.canvas.context);
}

game.scene.color = function ()
{
	game.wipe ();

	/*
	for (let x = window.innerWidth; x--;)
	{
		for (let y = window.innerHeight; y--;)
		{
			let r = Math.floor (255 * x / window.innerWidth);
			let g = Math.floor (255 * y / window.innerHeight);
			let b = game.get.r (0, 255, 1);
			game.canvas.context.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
			game.canvas.context.fillRect (x, y, 1, 1);
		}
	}
	*/

	game.scene.load ('x' + 0 + 'y' + 0);
}

game.scene.x0y0 = function ()
{
	game.wipe ();

	game.create.unit ({h: game.i.unit.height, i: game.i.unit, w: game.i.unit.width, x: game.get.cx - Math.floor (game.i.unit.width), y: game.get.cy - Math.floor (game.i.unit.height)}).load ();

}