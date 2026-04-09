document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.carousel').forEach(function (root) {
        if (root.classList.contains('flickity-enabled')) return;

        new Flickity(root, {
            cellSelector: '.carousel--cell',
            cellAlign: 'left',
            contain: true,
            groupCells: true,
            wrapAround: false,
            pageDots: false,
            percentPosition: true,
            draggable: '>1',
            lazyLoad: 2
        });
    });
});