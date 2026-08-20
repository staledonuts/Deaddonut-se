# __Building a Game Engine.__

This is basically a technical walkthrough of what i think is useful for my little game engine.

---
### Assets handling
> I use a [Virtual file system](https://github.com/Lurler/TrimKit.VirtualFileSystem) which i find being a good solution for keeping track of files and easily loading one library of files into memory, I customized it to use my integer based string interning [solution](https://github.com/staledonuts/IntName). Which minimizes the amount of string comparsions it does.
### Rendering / Backend
> I enjoy working in the Raylib_cs library, but i have started feeling the limitations of it and what it actually can be used for. But i would recommend using [Raylib](https://www.raylib.com/) for most smaller projects. Use it for tools! it is fantastic.
### Level Editing
> As the goal is to make a first person shooter, I choose to use [libBSP](https://github.com/wfowler1/LibBSP) and create levels in [Trenchbroom](https://trenchbroom.github.io/) a very good and very mature bsp level authoring tool.

