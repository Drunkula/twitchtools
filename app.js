/**
 *	https://codepen.io/mimoduo/post/pug-js-cheat-sheet
 *
 *	https://hackr.io/blog/best-css-frameworks
 *	https://hackr.io/blog/css-cheat-sheet
 */
const APP_PRODUCTION = false;

console.log('\x1Bc');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

const express = require('express');
const app = express();

const viewsDir	= 'views';
const publicDir = 'public';
const assetsDir = 'assets';

app.set('view engine', 'pug');
app.set('views', viewsDir);

app.use(express.static(publicDir));
app.use(express.static(assetsDir));
app.use(express.static(publicDir));

if (APP_PRODUCTION) {
	app.enable('view cache');	// what will this do!  Well it certainly works.  Pages go down from hundreds to  < 10 ms.  I think they're cached in memory.
} else {
	app.locals.pretty = true;	// makes put do nicer html
}

	// root handler

app.get('/', (q,r) => {
	console.log('Root handling this:');

	get_tools_from_json().then(list => {
		r.render('index', {
			page: "Twitch Tools",
			toolsList: list
		})
	});
});


async function get_tools_from_json() {
	var list = await fsPromises.readFile('tools-list.json')
	list = JSON.parse(list);
	return list.toolsList;
}

// **** REMEMBER CONSOLE.LOG outputs to the Node console, not the browser *****

	// let's make it easy to get a template so /foo.pug would render the foo.pug in view
	// routing with vars :pug.pug will have a param q.params.pug, similarly with html below
app.get('/:pug.pug/:opt1?/:opt2?/:opt3?/:opt4?',	(q, r) => template_pug_sub_handler(q, r))
	// putting ? after a parameter makes them optional, but they will be in params as undefined
//app.get('/:html.html/:extra?/:optional?/:args?',	(q, r) => template_html_sub_handler(q, r))
app.get('/:pug.html/:extra?/:optional?/:args?',	(q, r) => template_pug_sub_handler(q, r))

app.listen(3000, () => console.log('Twitch Tools listening with Express.'));


	// render pug pages and pass in optional parameters
async function template_pug_sub_handler(q, r) {
		// destructure arg create a new object, apparently lodash _pick(obj,['a', 'd']) does this
	let params = (({opt1, opt2, opt3, opt4}) => ({opt1, opt2, opt3, opt4}))(q.params);

	console.log('PUG handler Params', params);

	const list = await get_tools_from_json();

	let pkg = {
		page: `Twitch Tools: ${q.params.pug}`,
		toolsList: list,
		params
	}

	r.render(q.params.pug, pkg);
}

	// get has /foo.html this receives foo as q.param.html
function template_html_sub_handler(q, r) {
	console.log('HTML handler Params', q.params);
	q.params.htmlreq = q.params.html;
	r.render('html-req', q.params)
}


	// returns an array of all files in the view directory
function get_pug_views_list(exclude = []) {
	const directoryPath = path.join(__dirname, viewsDir);
	let list = fs.readdirSync(directoryPath, {withFileTypes: true});

	list = list.filter(f=>f.isFile()).map(f => f.name);
	list = list.filter(f => path.extname(f).toLowerCase() === '.pug');

	return list;
}