# mksite

基于 Nodejs 的静态网站生成器

## 用法

目录说明：

-   source 原始文件 ( .md 文件 ) 目录
-   static 静态资源目录
-   template 模板文件目录

创建配置文件 ( config.json )，例如：

```json
{
    "siteName": "site name here",
    "staticDir": "static",
    "baseUrl": "https://lanqy.xyz", // 用于生成 atom.xml
    "sourceDir": "source/_posts/*",
    "targetDir": "website",
    "navTemplateFile": "template/nav.html", // 导航模板
    "postTemplateFile": "template/post.html", // 文章模板
    "indexTemplateFile": "template/index.html", // 首页模板
    "itemTemplateFile": "template/item.html" // 列表模板
}
```

模板文件目录 ( template )，包含四个文件，分别为：

### template/nav.html :

```html
<li class="nav-item"><a href="{{link}}">{{title}}</a></li>
```

### template/post.html :

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui"
        />
        <title>{{title}}</title>
        <link href="/css/style.css" rel="stylesheet" />
        <meta name="description" content="{{description}}" />
    </head>

    <body>
        <header class="header">
            <div class="container header-wrap">
                <h1 class="site-name"><a href="/"> 首页 </a></h1>
                <ul class="nav">
                    {{navs}}
                </ul>
            </div>
        </header>

        <div class="page-body"><div class="markdown-body">{{body}}</div></div>
    </body>
</html>
```

### template/index.html :

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui"
        />
        <link href="/css/style.css" rel="stylesheet" />
        <title>{{siteName}}</title>
    </head>

    <body>
        <div>
            <div>
                <header class="header">
                    <div class="container header-wrap">
                        <h1 class="site-name"><a href="/"> 首页 </a></h1>
                        <ul class="nav">
                            {{navs}}
                        </ul>
                    </div>
                </header>
            </div>
            <div class="post-list">{{lists}}</div>
        </div>
    </body>
</html>
```

### template/item.html :

```html
<div class="post-item">
    <h2 class="post-title"><a href="{{link}}">{{title}}</a> <span>{{created}}</span></h2>
</div>
```

一切准备就绪之后

### 安装模块

`npm install`

### 运行

```
node ./index.js
```

另一个用 golang 写的版本： https://github.com/lanqy/mksite.go
