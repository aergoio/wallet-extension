const tooltip = {
    bind: function (el, binding) {
        if (el.className.indexOf('tooltipped-') === -1) {
            el.className += ' tooltipped-s';
        }
        el.className += ' tooltipped tooltipped-no-delay';

        el.title = binding.value;
        
        el.addEventListener('mouseover', function(e){
            el.setAttribute('aria-label', el.title);
        });

        el.addEventListener('mouseout', function(e){
            el.setAttribute('aria-label', '');
        });
    },

    update: function(el, binding) {
        el.title = binding.value;
    }
};

export {
    tooltip
};
