/* Full example of API usage including "like button" as a custom control */

//import Spotlight from "./src/js/spotlight.js";

(
    function()
    {

        const gallery1 = 
        [
            {

                title: "Minecraft Legends Myth: Ichorous Grove",
                description: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
                src: "images/mclegends-ich000.png",
                button: "Next Slide",
                onclick: Spotlight.next,
                like: false
            },{
                title: "Minecraft Legends Myth: Ichorous Grove",
                description: "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
                src: "images/mclegends-ich001.png",
                button: "Next Slide",
                onclick: Spotlight.next,
                like: false,
            },{
                title: "Minecraft Legends Myth: Ichorous Grove",
                description: "In hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim.",
                src: "images/mclegends-ich001.png",
                button: "Next Slide",
                onclick: Spotlight.next,
                like: false
            },{
                media: "node",
                control: "next,prev,close",
                src: 
                (
                    function()
                    {
                        const iframe = document.createElement("iframe");
                        iframe.src = "https://www.youtube.com/embed/Q-aXSqCxKfU?si=zdNeK_TA4RTejf_4";
                        return iframe;
                    }
                    ()
                )
            },{
                title: "Invincible: Doc Seismic Attacks",
                description: "In hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim.",
                src: "images/mclegends-ich001.png",
                button: "Close Gallery",
                onclick: Spotlight.close,
                like: false
            },{
                title: "Secret Project 1",
                description: "Its a secret to everyone!",
                src: "images/TempImages/secret.png",
                button: "Close Gallery",
                onclick: Spotlight.close,
                like: false
            }
        ];

        const gallery2 = 
        [
            {

                title: "Minecraft Legends Myth: Ichorous Grove",
                description: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
                src: "images/mclegends-ich000.png",
                button: "Next Slide",
                onclick: Spotlight.next,
                like: false
            },{
                title: "Minecraft Legends Myth: Ichorous Grove",
                description: "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
                src: "images/mclegends-ich001.png",
                button: "Next Slide",
                onclick: Spotlight.next,
                like: false,
            },{
                title: "Minecraft Legends Myth: Ichorous Grove",
                description: "In hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim.",
                src: "images/mclegends-ich001.png",
                button: "Next Slide",
                onclick: Spotlight.next,
                like: false
            },{
                media: "node",
                control: "next,prev,close",
                src: 
                (
                    function()
                    {
                        const iframe = document.createElement("iframe");
                        iframe.src = "https://www.youtube.com/embed/Q-aXSqCxKfU?si=zdNeK_TA4RTejf_4";
                        return iframe;
                    }
                    ()
                )
            },{
                title: "Invincible: Doc Seismic Attacks",
                description: "In hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim.",
                src: "images/mclegends-ich001.png",
                button: "Close Gallery",
                onclick: Spotlight.close,
                like: false
            },{
                title: "Secret Project 1",
                description: "Its a secret to everyone!",
                src: "images/TempImages/secret.png",
                button: "Close Gallery",
                onclick: Spotlight.close,
                like: false
            }
        ];

        window.showGallery = function(index)
        {

            const control = to_array(document.getElementById("control").getElementsByTagName("input"));
            const animation = to_array(document.getElementById("animation").getElementsByTagName("input"));
            const modifier = document.getElementById("modifier").getElementsByTagName("input");

            // store the button element to apply dom changes to it
            let like;
            // store the current index
            let slide = 0;

            function handler()
            {
                // get the current like state
                // at this point we use the stored last index from the variable "slide"
                const current_like_state = !gallery[slide].like;

                // toggles the current like state
                gallery[slide].like = current_like_state;

                // assign the state as class to visually represent the current like state
                this.classList.toggle("on");

                if(current_like_state)
                {

                    // do something if liked ...
                }
                else
                {

                    // do something if unliked ...
                }
            }

            const options = 
            {

                class: "only-this-gallery",
                index: index,
                control: control,
                animation: animation,
                // fires when gallery opens
                onshow: function(index)
                {
                    // the method "addControl" returns the new created control element
                    like = Spotlight.addControl("like", handler);
                },
                // fires when gallery change to another page
                onchange: function(index, options)
                {
                    // store the current index for the button listener
                    // the slide index start from 1 (as "page 1")
                    slide = index - 1;

                    // initially apply the stored like state when slide is openened
                    // at this point we use the stored like element
                    like.classList.toggle("on", gallery1[slide].like);
                },
                // fires when gallery is requested to close
                onclose: function(index)
                {
                    // remove the custom button, so you are able
                    // to open next gallery without this custom control
                    Spotlight.removeControl("like");
                }
            };

            assign(options, modifier);

            Spotlight.show(gallery1, options);
        };

        /* helper functions to assign options for the demo page, so skip this part from here */

        function to_array(nodelist)
        {
            const arr = [];

            for(let i = 0, node; i < nodelist.length; i++)
            {
                node = nodelist[i];
                node.checked && arr.push(node.value);
            }
            return arr;
        }

        function assign(options, nodelist)
        {

            for(let i = 0, node; i < nodelist.length; i++)
            {

                node = nodelist[i];

                if(node.checked)
                {
                    if(node.name)
                    {
                        options[node.name] = node.value;
                    }
                    else
                    {
                        options[node.value] = node.checked;
                    }
                }
            }
        }
    }
    ()
);