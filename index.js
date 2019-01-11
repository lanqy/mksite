const {readFile, writeFile} = require('fs');
const {promisify} = require('util');
const mdIt = require('markdown-it');
const mdItKatex = require('markdown-it-katex');
const mdItFootnote = require('markdown-it-footnote');
const mdItImsize = require('markdown-it-imsize');
const mdItDeflist = require('markdown-it-deflist');
const mdItDecorate = require('markdown-it-decorate');
const highlight = require('./highlight.js');
const render = require('json-templater/string');
const frontmatter = require('front-matter');
const {join, extname, resolve, relative, dirname, basename} = require('path');
const glob = require('tiny-glob');
const {gray, green} = require('chalk');
const fs = require('fs-extra');
const _ = require('lodash');

const mkdirp = require('mkdirp');
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const mkdirpAsync = promisify(mkdirp);
const pretty = require('pretty');

const configFile = 'config.json';
const dataFile = 'data.json';
const pageJsonFile = 'page.json';
const file = 'index.html';

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

    const tpl = await readFileAsync(config.templateFile, 'utf8');
    const staticDir = config.staticDir;
    const targetDir = config.targetDir;

    let jsonArr = [];

    let pageJsonArr = [];

    await mkdirpAsync(targetDir);

    await fs.copy(staticDir, targetDir);

    for (let item of files) {
        // 创建文章的目录
        let content = await readFileAsync(item, 'utf8');
        let {attributes: info, body} = frontmatter(content);
        let ext = extname(item);

        info.htmlDir = join(targetDir, info.created);
        info.link = info.created;
        info.htmlFile = join(info.htmlDir, file);
        info.body = body;
        info.source = item;
        jsonArr.push(info);

        await mkdirp(info.htmlDir.replace(/\\/g, '/'), function(err) {
            if (err) {
                console.log(err);
            }
        });
    }

    for (let page of pageFiles) {
        // 创建单页面目录
        let pageContent = await readFileAsync(page, 'utf8');
        let {attributes: info, body} = frontmatter(pageContent);
        let ext = extname(page);
        let separators = ['//', '\\\\', '\\', '/'];
        let pathArr = page.split(new RegExp(separators.join('|')));
        info.htmlDir = join(targetDir, pathArr[1].replace(ext, ''));
        info.link = info.htmlDir;
        info.htmlFile = join(info.link, file);
        info.body = body;
        info.source = page;
        pageJsonArr.push(info);
        mkdirpAsync(info.htmlDir, function(err) {
            if (err) {
                console.log(err);
            }
        });
    }

    let jsons = _.sortBy(jsonArr, 'created', 'desc').reverse(); // 根据 created 排序

    // 创建首页
    await makeIndex({
        config: config,
        jsons: jsons,
        targetDir: targetDir,
    });

    await writeFileAsync(dataFile, JSON.stringify(jsons));

    await writeFileAsync(pageJsonFile, JSON.stringify(pageJsonArr));

    let postData = JSON.parse(await readFileAsync(dataFile));

    let pageData = JSON.parse(await readFileAsync(pageJsonFile));

    for (let d of postData) {
        await _writeFile(d, tpl);
    }

    for (let p of pageData) {
        await _writeFile(p, tpl);
    }

    console.log(green(' Done in ' + (new Date().getTime() - beginTime) + ' ms'));
}

async function makeIndex(o) {
    let itemTpl = await readFileAsync(o.config.itemTemplateFile, 'utf8');

    let lists = '';

    for (const json of o.jsons) {
        lists += render(itemTpl, {
            link: json.link,
            title: json.title,
            created: json.created,
        });
    }

    let indexTpl = await readFileAsync(o.config.indexTemplateFile, 'utf8');

    let index = resolve(o.targetDir, file);

    await writeFileAsync(
        index,
        pretty(
            render(indexTpl, {
                siteName: o.config.siteName,
                lists: lists,
            }),
        ),
    );
}

async function _writeFile(info, tpl) {
    await writeFileAsync(
        info.htmlFile,
        pretty(
            render(tpl, {
                body: md.render(info.body),
                title: info.title,
                description: info.description,
            }),
        ),
    );

    console.log(green(' Compiled ' + info.source + ' into ' + info.htmlFile));
}

main()
    .then(function() {})
    .catch(function(error) {
        console.log(error);
    });
