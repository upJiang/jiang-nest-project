## 文件上传

> 使用 `multer` 中间件实现文件上传，通过解析请求的 `multipart/form-data` 数据，从中提取文件并将其保存到指定位置或存储系统中。它支持多种存储方式，例如本地磁盘、云存储服务等。

> multipart/form-data是一种HTTP请求的编码类型，适合传输包含文件的表单数据，允许将表单信息分为多个部分，每个部分都可以有自己的内容类型。这使得其可以同时发送文本字段和文件数据，非常适合文件上传的场景。

- 安装相关依赖

```
yarn add multer
yarn add @types/multer -D
```

## 创建 Upload 模块

```
nest g resource upload
```

### 配置 Multer

Multer 有四个基本设置：

- `diskStorage`：控制文件的存储方式，存储到磁盘里，可定义文件的储存路径和文件名
- `memoryStorage`：控制文件的储存方式，储存到内存中，适用于临时文件处理
- `limits`：定义上传文件的大小限制
- `fileFilter`：根据文件类型，过滤文件
