## JellyDonut Engine

This is one of my many attempts at writing my own game engine.

I thoroughly enjoy the process of setting up a good base for a project. Sadly, one could argue I have some way to go before I manage to create a good project foundation, but I am learning constantly and enjoy doing it.

This engine has been a fun way of learning about Virtual File Systems, BSP parsing, SSBOs, and simple lighting implementations.
The rendering pipeline that I created is questionable and needs to be rewritten. It uses a RenderCommand queue, but I realized that it is fighting the Raylib batching and breaking it; performance gets funky.

One thing I realized is that I am not the biggest fan of object-oriented programming languages for writing a game engine. You run into a lot of chicken-and-egg issues with constructors and need to create a secondary initialization for the different classes and systems you set up. It is frustrating, but I will figure something out eventually!

::youtube(https://youtu.be/SP530n8n1O0)