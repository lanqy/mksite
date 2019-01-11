# mkstaict
基于 Nodejs 的静态网站生成器

## 用法

创建一个配置文件 ( config.json )，例如：

```
{
    "siteName": "site name here",
    "staticDir": "static",
    "baseUrl": "https://lanqy.xyz",
    "sourceDir": "source/_posts/*",
    "targetDir": "website",
    "templateFile": "template/tpl.html",
    "indexTemplateFile": "template/index.html",
    "itemTemplateFile": "template/item.html"
}
```
