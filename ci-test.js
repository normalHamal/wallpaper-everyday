import test from 'ava';
import execa from 'execa';

test('main', async t => {
	t.true((await execa.stdout('./wallpaper.js', ['-h'], {cwd: __dirname})).length > 0);
});
