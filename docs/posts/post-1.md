# Welcome to my Blog.
__This is where i post new things I am working on, new things I have learned, and things that are on my mind.__

## What i am currently doing.
Currently i am learning C and WASM because of building this webpage. I tried working in pure Javascript and Html before and i was not enjoying myself. Working in those languages is a messy process that i do not enjoy, but the C Wasm experience is a bit more in my style of programming.

The webpage is built with [Clay](https://github.com/nicbarker/clay), [cJson](https://github.com/DaveGamble/cJSON) and [md4c](https://github.com/mity/md4c).


### Odin
I am also diving into [Odin Lang](https://odin-lang.org/) because I really like the syntax and thought things like Swizzling and the possibility of setting matrix's to different value types like int or uint or f64 and so on is really cool!. Currently trying to Write a Virtual files system in the language, to then either write my own little game engine on the side using SDL3 or Raylib in Odin. I have not picked what backend i want to use yet. but i also might just use the VFS as a library using interop to another library just to try out how i could do that.

I have so far managed to create a custom archive format kind of like Quake 1 used.

``` Odin
Pak_Header :: struct #packed {
    magic:      [4]u8,
    version:    u32,
    file_count: u32,
}
```
A header.

``` Odin
Pak_Entry :: struct #packed {
    path:   [MAX_PATH_LEN]u8,
    offset: u64,
    size:   u64,
}
```
A file entry.

figured out how to pack the files, now i just need to implement the reading as well.


### CSharp
I do already have a project working on a csharp raylib engine and i might just implement a Odin interop VFS system for it just for fun!
![Engine in Action](/images/images/Jelly/JellyDonut_Csharp_Screen01.png "Game engine.")