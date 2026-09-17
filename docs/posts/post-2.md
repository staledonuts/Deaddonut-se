# __Building a Game Engine__

This is basically a technical walkthrough of what I find useful for my little game engine.

---
### Asset Handling
> I use a [Virtual File System](https://github.com/Lurler/TrimKit.VirtualFileSystem), which I find to be a great solution for keeping track of files and easily loading a collection of files into memory from a single archive. I customized it to use my integer-based string interning [solution](https://github.com/staledonuts/IntName). This minimizes the number of string comparisons and creates an integer lookup for each file.
### Rendering / Backend
> I enjoy working with the Raylib_cs library, but I have started feeling the limitations of it and what it can realistically be used for. Still, I would recommend using [Raylib](https://www.raylib.com/) for most smaller projects. Use it for tools! It is fantastic.
### Level Editing
> As the goal is to make a first-person shooter, I chose to use [libBSP](https://github.com/wfowler1/LibBSP) and create levels in [TrenchBroom](https://trenchbroom.github.io/), a very good and mature BSP level authoring tool.

