(function($){
  'use strict';

  function initSelectEnhancements(ctx) {
    var scope = ctx && ctx.length ? ctx : $(document);

    if ($.fn.SUIselect2) {
      scope.find('select.sui-select').each(function(){
        var $el = $(this);
        if (!$el.data('select2')) {
          $el.SUIselect2({
            placeholder: function(){
              return $el.data('placeholder');
            },
            dropdownCssClass: 'sui-select-dropdown'
          });
        }
      });
    }
  }

  function initChoices(ctx) {
    var scope = ctx && ctx.length ? ctx : $(document);

    if (typeof window.Choices !== 'function') {
      return;
    }

    scope.find('select[data-sui-choices], input[data-sui-choices]').each(function(){
      if (this._suiChoicesInstance) {
        return;
      }
      this._suiChoicesInstance = new window.Choices(this, {
        shouldSort: false,
        searchEnabled: true,
        itemSelectText: ''
      });
    });
  }

  function initDateRangePicker(ctx) {
    var scope = ctx && ctx.length ? ctx : $(document);

    if (typeof $.fn.daterangepicker !== 'function') {
      return;
    }

    scope.find('input[data-sui-daterangepicker]').each(function(){
      var $el = $(this);
      if ($el.data('daterangepicker')) {
        return;
      }

      $el.daterangepicker({
        autoApply: true,
        autoUpdateInput: false,
        locale: {
          cancelLabel: 'Clear'
        }
      });

      $el.on('apply.daterangepicker', function(ev, picker){
        $(this).val(
          picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD')
        );
      });

      $el.on('cancel.daterangepicker', function(){
        $(this).val('');
      });
    });
  }

  function initAlphaColorPicker(ctx) {
    var scope = ctx && ctx.length ? ctx : $(document);
    var alphaPicker = window.wpColorPickerAlpha || window.ColorPickerAlpha;

    if (!$.fn.wpColorPicker || !alphaPicker) {
      return;
    }

    scope.find('input[data-sui-colorpicker], input.alpha-color-picker').each(function(){
      var $el = $(this);
      if ($el.data('wpWpColorPicker')) {
        return;
      }
      $el.wpColorPicker();
    });
  }

  function initSortable(ctx) {
    var scope = ctx && ctx.length ? ctx : $(document);

    if (typeof window.Sortable !== 'function') {
      return;
    }

    scope.find('[data-sui-sortable]').each(function(){
      if (this._suiSortableInstance) {
        return;
      }
      this._suiSortableInstance = new window.Sortable(this, {
        animation: 150,
        handle: '[data-sui-sortable-handle]',
        draggable: '[data-sui-sortable-item]'
      });
    });
  }

  function initMetaboxBridge(ctx) {
    var scope = ctx && ctx.length ? ctx : $(document);

    scope.find('.postbox, .sui-box, .inside').each(function(){
      var $box = $(this);
      initSelectEnhancements($box);
      initChoices($box);
      initDateRangePicker($box);
      initAlphaColorPicker($box);
      initSortable($box);
    });
  }

  function initAll(ctx) {
    initSelectEnhancements(ctx);
    initChoices(ctx);
    initDateRangePicker(ctx);
    initAlphaColorPicker(ctx);
    initSortable(ctx);
    initMetaboxBridge(ctx);
  }

  $(document).ready(function(){
    initAll($(document));
  });

  $(document).on('postbox-toggled', function(){
    initAll($(document));
  });

  window.PSSharedUIAdminComponents = {
    initAll: initAll,
    initSelectEnhancements: initSelectEnhancements,
    initChoices: initChoices,
    initDateRangePicker: initDateRangePicker,
    initAlphaColorPicker: initAlphaColorPicker,
    initSortable: initSortable,
    initMetaboxBridge: initMetaboxBridge
  };
})(jQuery);
