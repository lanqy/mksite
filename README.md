# mkstaict
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

创建模板文件目录 ( template )


    


