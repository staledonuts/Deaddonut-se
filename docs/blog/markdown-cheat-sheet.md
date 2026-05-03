# Markdown Cheat Sheet

A quick reference for all the Markdown syntax you can use in blog posts.

---

## Headings

```
# H1 — Page title
## H2 — Section
### H3 — Subsection
#### H4
##### H5
###### H6
```

---

## Emphasis

```
**Bold text**
*Italic text*
~~Strikethrough~~
**_Bold and italic_**
```

**Bold text** | *Italic text* | ~~Strikethrough~~ | **_Bold and italic_**

---

## Lists

### Unordered

```
- Item one
- Item two
  - Nested item
  - Another nested
- Item three
```

- Item one
- Item two
  - Nested item
  - Another nested
- Item three

### Ordered

```
1. First
2. Second
3. Third
```

1. First
2. Second
3. Third

---

## Links

```
[Link text](https://example.com)
[Link with title](https://example.com "Hover title")
```

[deaddonut.se](https://deaddonut.se)

---

## Images

```
![Alt text](images/my-image.png)
![External image](https://example.com/photo.jpg)
![Image in parent folder](../images/logo.png)
```

Paths are relative to the blog post file. Put images in `docs/blog/images/` for easy organisation.

---

## Blockquotes

```
> This is a blockquote.
> It can span multiple lines.
>
> Even multiple paragraphs.
```

> This is a blockquote.
> It can span multiple lines.

---

## Code

### Inline code

```
Use `backticks` for inline code.
```

Use `backticks` for inline code.

### Fenced code block

````
```js
function greet(name) {
    return `Hello, ${name}!`;
}
```
````

```js
function greet(name) {
    return `Hello, ${name}!`;
}
```

Supported language hints: `js`, `ts`, `html`, `css`, `glsl`, `python`, `bash`, `json`, `md`, and many more.

---

## Horizontal Rule

```
---
```

---

## Tables

```
| Column A | Column B | Column C |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

| Column A | Column B | Column C |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

Alignment:

```
| Left     | Center   | Right    |
|:---------|:--------:|---------:|
| text     | text     | text     |
```

| Left     | Center   | Right    |
|:---------|:--------:|---------:|
| text     | text     | text     |

---

## Task Lists

```
- [x] Write the first blog post
- [x] Add image support
- [ ] Post about shaders
```

- [x] Write the first blog post
- [x] Add image support
- [ ] Post about shaders

---

## Escaping Characters

Put a backslash before special characters to display them literally:

```
\* not italic \*
\# not a heading
\` not code \`
```

---

## Tips for Blog Posts

- Keep filenames lowercase with hyphens: `my-post-title.md`
- Add the post to `blog/index.json` with a `filename`, `title`, and `date` (YYYY-MM-DD)
- Put post images in `docs/blog/images/` and reference them as `images/my-image.png`
- The 10 most recent posts (by date) are shown automatically
