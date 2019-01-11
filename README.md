# mksite
基于 Nodejs 的静态网站生成器

## 用法

目录说明：

- source 原始文件 ( .md 文件 ) 目录
- static 静态资源目录
- template 模板文件目录


创建配置文件 ( config.json )，例如：

```
{
    "siteName": "site name here",
    "staticDir": "static",
    "baseUrl": "https://lanqy.xyz", // 可选
    "sourceDir": "source/_posts/*",
    "targetDir": "website",
    "templateFile": "template/tpl.html", // 文章模板
    "indexTemplateFile": "template/index.html", // 首页模板
    "itemTemplateFile": "template/item.html" // 列表模板
}
```

创建原始文件目录 source ( .md 文件 ) 目录

创建静态资源文件目录( static )

创建模板文件目录 ( template )，包含三个文件，分别为：


### template/tpl.html :

```html
<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui" />
        <title>{{title}}</title>
        <link href="/css/style.css" rel="stylesheet" />
        <meta name="description" content="{{description}}">
    </head>
    <body> 
        <header class="header">
            <div class="container header-wrap">
                <h1 class="site-name">
                    <a href="/">
                        首页
                    </a>
                </h1> 
                <ul class="nav">
                    <li class="nav-item">
                        <a href="/about">关于</a>
                    </li>
                </ul>
            </div>
        </header>

        <div class="page-body">
            <div class="markdown-body">
                {{body}}
            </div>
        </div>

        <footer class="container footer">
            <div class="centered">
                <span>2018 ~ </span> 
                <span>©</span> 
                <span>
                    lanqy
                </span>
            </div>
        </footer>
    </body>
</html>

```

### template/index.html :

```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui" />
        <meta name="description" content="lanqy 在这里写作"/>
        <link href="/css/style.css" rel="stylesheet" />
        <title>{{siteName}}</title>
        <link rel="alternate" href="/atom.xml" type="application/rss+xml" title="让思绪停留在这里"/>
    </head>
    <body>
        <div>
            <div>
                <header class="header">
                    <div class="container header-wrap">
                        <h1 class="site-name">
                            <a href="/">
                                首页
                            </a>
                        </h1> 
                        <ul class="nav">
                            <li class="nav-item">
                                <a href="/about">关于</a>
                            </li>
                        </ul>
                    </div>
                </header>
            </div>        
            <div class="post-list">
                {{lists}}
            </div>
            <footer class="container footer">
                <div class="centered">
                    <span>2018 ~ </span> 
                    <span>©</span> 
                    <span>
                        lanqy
                    </span>
                </div>
            </footer>
        </div>
    </body>
</html>

```

### template/item.html :

```html
<div class="post-item">
    <h2 class="post-title">
        <a href="{{link}}">{{title}}</a>
        <span>{{created}}</span>
    </h2>
</div>

```

一切准备就绪之后

### 安装模块

```npm install ```

### 运行

```
node ./index.js
```

    


