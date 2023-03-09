---
title: "Tips for Technical Documentation Formatting"
description: "How to write like an open-source maintainer"
pubDate: "Mar 8 2023"
---

*This is a list of software documentation writing tips I've accumulated over the years.*

## Markdown
Markdown is used in merge request (pull request) descriptions, comments, and in-repo documentation like READMEs. (It's even what this blog is written in!)

[Handy Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/)

[Markdown also supports code syntax highlighting](https://www.markdownguide.org/extended-syntax/#syntax-highlighting). Just put the language file extension in the same line right after backticks.
```
    ```ts
    const getBobPromise = async (): Promise<string> => {
        return 'bob';
    }
    ```
```
becomes
```ts
const getBobPromise = async (): Promise<string> => {
    return 'bob';
}
```

### Other Markdown Syntax Support
[Coda kind of supports it](https://help.coda.io/en/articles/1821353-markdown-shortcuts-in-coda)

[Google Docs has an option to enable it](https://support.google.com/docs/answer/12014036?hl=en)

[You can preview it in VSCode](https://code.visualstudio.com/docs/languages/markdown#_markdown-preview)

## Link to specific line of code
It's often helpful in a conversation, merge request, or technical documentation to point to a line or lines of code in a codebase. It saves you from having to copy-paste and embed the snippet, and it saves the reader from having to find the specific line of code themselves.

Both GitHub and GitLab support this by clicking on the line in the Web UI. You can also shift-click to select a range of lines.

[Example](https://github.com/kevinyou/blog/blob/main/src/pages/index.astro#L8-L10) - the lines of code that determine how posts are sorted on this blog.

### Permalink
Both GitHub and GitLab support a "permalink" feature in their Web UIs. This will generate a link to the file at a specific commit, rather than whatever branch you were looking at.

This is extremely useful because most code is always changing. The link in the above example may not even point to the lines of code in my `main` branch when I first wrote this post. The file might not even exist in the future!

But if link to a specific commit, then the link is guaranteed to always point to the same lines of code.

[Example](https://github.com/kevinyou/blog/blob/b4f9805baff01470e969e450fb255317f4299a95/src/pages/index.astro) - the same lines of code, forever and always

```
https://github.com/kevinyou/blog/blob/b4f9805baff01470e969e450fb255317f4299a95/src/pages/index.astro
```

## Add screenshots or screen recordings
On MacOS (which I use at work):
- [QuickTime Player](https://support.apple.com/guide/quicktime-player/record-your-screen-qtp97b08e666/mac) can record your screen
- `Command + Shift + 4` to take a screenshot of selected area and save to your desktop
- `Control + Command + Shift + 4` to take a screenshot and then copy to clipboard

## Diagrams
Nothing beats the classics: whiteboard or pen and paper for simplicity, especially in-person.

But if you need to share digitally, here's what I use:

### Mermaid
[Mermaid](https://mermaid.js.org/) is a lightweight diagramming tool that is fully text-based.

At work, our GitLab instance has a Mermaid Markdown plugin so it will render Mermaid diagrams in code blocks in our README and MR description/comments. This allows me to create diagrams quickly.


It's also possible on [GitHub](https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/), and there's even a [VSCode plugin](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) for previewing it.

There's also ways to use it in mdx and probably a way to use it in Astro but I got lazy and gave up. But it would be really cool if I showed you a Mermaid diagram in this blog post, right?

### Lucidchart
[Lucidchart](https://www.lucidchart.com/pages/) is a much more fully featured diagramming tool. It's useful for larger designs that change frequently.

It's the power tool of diagramming compared to Mermaid which is more like the, uh, Swiss Army knife? Bottle opener? Pick your favorite tooling metaphor here.

## API Documentation
OpenAPI Specification (also known as Swagger) is the best for documenting REST APIs.

There's a [web editor](https://editor.swagger.io/), [VSCode plugin](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi), [GitHub plugin](https://github.com/peter-evans/swagger-github-pages), there's also a GitLab plugin (I got too lazy to find it but that's how I use it at work). The whole shebang.