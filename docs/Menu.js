const menu = document.querySelector(".menu");
const menuLinks = menu.querySelectorAll("a");
const menuLinkActive = menu.querySelector("li.active");
const activeClass = "active";

doCalculations(menuLinkActive);

for (const menuLink of menuLinks) {
menuLink.addEventListener("click", function (e) {
    e.preventDefault();
    menu.querySelector("li.active").classList.remove(activeClass);
    menuLink.parentElement.classList.add(activeClass);
    doCalculations(menuLink);
});
}

function doCalculations(link) {
menu.style.setProperty("--transformJS", `${link.offsetLeft}px`);
menu.style.setProperty("--widthJS", `${link.offsetWidth}px`);
}

window.addEventListener("resize", function () {
const menuLinkActive = menu.querySelector("li.active");
doCalculations(menuLinkActive);
});