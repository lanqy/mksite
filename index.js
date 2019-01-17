const { readFile, writeFile } = require('fs');
const { promisify } = require('util');
const mdIt = require('markdown-it');
const mdItKatex = require('markdown-it-katex');
const mdItFootnote = require('markdown-it-footnote');
const mdItImsize = require('markdown-it-imsize');
const mdItDeflist = require('markdown-it-deflist');
const mdItDecorate = require('markdown-it-decorate');
const highlight = require('./utils/highlight.js');
const render = require('json-templater/string');
const frontmatter = require('front-matter');
const { join, extname, resolve } = require('path');
const glob = require('tiny-glob');
const { green } = require('chalk');
const fs = require('fs-extra');
const _ = require('lodash');
const builder = require('xmlbuilder');

const mkdirp = require('mkdirp');
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const mkdirpAsync = promisify(mkdirp);
const pretty = require('pretty');

const configFile = 'config.json';
const dataFile = 'data.json';
const file = 'index.html';
const atomFile = 'atom.xml';

let md = mdIt({
    linkify: true,
    typographer: true,
    highlight,
})
    .use(mdItKatex)
    .use(mdItFootnote)
    .use(mdItImsize)
    .use(mdItDeflist)
    .use(mdItDecorate);

async function main() {
    let beginTime = new Date().getTime();
    const config = JSON.parse(await readFileAsync(configFile));
    const files = await glob(config.sourceDir);
    const pageFiles = await glob(config.sourceDir.split('/')[0] + '/*.md');

    const tpl = await readFileAsync(config.postTemplateFile, 'utf8');
    const staticDir = config.staticDir;
    const targetDir = config.targetDir;

    let jsonArr = [];

    let pageJsonArr = [];

    await mkdirpAsync(targetDir);

    await fs.copy(staticDir, targetDir);

    for (let item of files) {
        // 创建文章的目录
        let content = await readFileAsync(item, 'utf8');
        let { attributes: info, body } = frontmatter(content);
        let separators = ['//', '\\\\', '\\', '/'];
        let pathArr = item.split(new RegExp(separators.join('|')));
        let ext = extname(item);

        info.link = info.created + '/' + pathArr[2].replace(ext, '');
        info.htmlDir = join(targetDir, info.link);
        info.htmlFile = join(info.htmlDir, file);
        info.body = body;
        info.source = item;
        jsonArr.push(info);

        await mkdirp(info.htmlDir.replace(/\\/g, '/'), function (err) {
            if (err) {
                console.log(err);
            }
        });
    }

    for (let page of pageFiles) {
        // 创建单页面目录
        let pageContent = await readFileAsync(page, 'utf8');
        let { attributes: info, body } = frontmatter(pageContent);
        let separators = ['//', '\\\\', '\\', '/'];
        let pathArr = page.split(new RegExp(separators.join('|')));
        let ext = extname(page);
        info.htmlDir = join(targetDir, pathArr[1].replace(ext, ''));
        info.link = '/' + pathArr[1].replace(ext, '');
        info.htmlFile = join(info.htmlDir, file);
        info.body = body;
        info.source = page;
        pageJsonArr.push(info);
        mkdirpAsync(info.htmlDir, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }

    let jsons = _.sortBy(jsonArr, 'created', 'desc').reverse(); // 根据 created 排序

    let websiteJson = {
        posts: jsons,
        pages: pageJsonArr,
    };

    // 创建首页
    await makeIndex({
        config: config,
        results: websiteJson,
        targetDir: targetDir,
    });

    await writeFileAsync(targetDir + '/' + dataFile, JSON.stringify(websiteJson));

    let data = JSON.parse(await readFileAsync(targetDir + '/' + dataFile));

    let navs = await mkNavs({
        config: config,
        results: websiteJson,
        targetDir: targetDir,
    });

    for (let d of data.posts) {
        // 创建文章
        await _writeFile(d, navs, tpl);
    }

    for (let p of data.pages) {
        // 创建单页
        await _writeFile(p, navs, tpl);
    }

    await makeAtomXml({ config: config, results: websiteJson });

    console.log(green('\n Done in ' + (new Date().getTime() - beginTime) + ' ms\n'));
}

async function makeAtomXml(o) {
    let data = JSON.parse(await readFileAsync(o.config.targetDir + '/' + dataFile));

    var feed = builder
        .create('feed', { encoding: 'utf-8' })
        .att('xmlns', 'http://www.w3.org/2005/Atom')
        .ele('title', o.config.siteName)
        .up()
        .ele('link', { href: o.config.baseUrl })
        .up()
        .ele('summary', o.config.siteName)
        .up();

    for (const item of data.posts) {
        var entry = feed.ele('entry');
        entry.ele('title', item.title);
        entry.ele('link', item.link);
        entry.ele('summary', item.description);
    }

    feed = feed.end({ pretty: true });

    await writeFileAsync(o.config.targetDir + '/' + atomFile, feed);
}

async function makeIndex(o) {
    let indexTpl = await readFileAsync(o.config.indexTemplateFile, 'utf8');

    let index = resolve(o.targetDir, file);

    let lists = await mkList(o);

    let navs = await mkNavs(o);

    await writeFileAsync(
        index,
        pretty(
            render(indexTpl, {
                siteName: o.config.siteName,
                lists: lists,
                navs: navs,
            }),
        ),
    );
}

async function mkList(o) {
    //创建列表
    let itemTpl = await readFileAsync(o.config.itemTemplateFile, 'utf8');

    let lists = '';

    for (const json of o.results.posts) {
        lists += render(itemTpl, {
            link: json.link,
            title: json.title,
            created: json.created.split('/').join('-'),
        });
    }

    return lists;
}

async function mkNavs(o) {
    // 创建导航
    let navTpl = await readFileAsync(o.config.navTemplateFile, 'utf8');
    let navs = '';

    for (const nav of o.results.pages) {
        navs += render(navTpl, {
            link: nav.link,
            title: nav.title,
        });
    }

    return navs;
}

async function _writeFile(info, navs, tpl) {
    await writeFileAsync(
        info.htmlFile,
        pretty(
            render(tpl, {
                body: md.render(info.body),
                title: info.title,
                navs: navs,
                description: info.description,
            }),
        ),
    );

    console.log(green(' Compiled ' + info.source + ' into ' + info.htmlFile));
}

main()
    .then(function () { })
    .catch(function (error) {
        console.log(error);
    });
