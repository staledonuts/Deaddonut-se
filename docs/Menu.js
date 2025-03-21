const menu = document.querySelector(".topmenu");
const menuLinks = menu.querySelectorAll("a");
const menuLinkActive = menu.querySelector("li.active");
const activeClass = "active";

doCalculations(menuLinkActive);

for (const menuLink of menuLinks) 
{
    menuLink.addEventListener("click", function (e) 
    {
        e.preventDefault();
        menu.querySelector("li.active").classList.remove(activeClass);
        menuLink.parentElement.classList.add(activeClass);
        doCalculations(menuLink);
    });
}

function doCalculations(link) 
{
    menu.style.setProperty("--transformJS", `${link.offsetLeft}px`);
    menu.style.setProperty("--widthJS", `${link.offsetWidth}px`);
}

window.addEventListener("resize", function () 
{
const menuLinkActive = menu.querySelector("li.active");
doCalculations(menuLinkActive);
});

document.addEventListener("DOMContentLoaded", function () 
{
    const menuItems = document.querySelectorAll(".topmenu li");
    const contentContainers = document.querySelectorAll(".content-container");

    function showContainer(containerId) {
        contentContainers.forEach(container => {
            container.classList.remove("active"); // Hide all containers
        });

        document.getElementById(containerId).classList.add("active"); // Show selected container
    }

    menuItems.forEach(item => {
        item.addEventListener("click", function (event) {
            event.preventDefault();

            menuItems.forEach(el => el.classList.remove("active")); // Remove active class from all
            this.classList.add("active"); // Set clicked menu item as active

            const containerId = this.getAttribute("data-container");
            showContainer(containerId);
        });
    });

    // Show the default section (Home) on page load
    showContainer("home");
});