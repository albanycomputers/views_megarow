/**
 * @file
 *
 * Provides modal-like functionality that opens a "megarow" in a table
 * instead of opening a dialog. Multiple megarows can be open at the same time,
 * each inserted below the triggering (parent) row.
 *
 * Inspired by CTools modal.
 */

(function ($) {
  // Add a help to scroll to the closed item
  // We scroll to a padding above the selected item due to the potential admin bar,
  // shortcuts and potential sticky table headers.
  // The value of the padding is defined in the view style settings.
  $.fn.viewsMegarowGoTo = function (scrollPadding) {
    $('html, body').animate({
      scrollTop: ($(this).offset().top - scrollPadding) + 'px'
    }, 'fast');
    return this;

  };
  Backdrop.ViewsMegarow = Backdrop.ViewsMegarow || {};

  /**
   * Display the megarow.
   */
  Backdrop.ViewsMegarow.open = function(entityId, target) {
    // If there's already a megarow opened for this entity, abort.
    var row_parent_megarow = $(target).parents('tr').next('tr.megarow');
    if (row_parent_megarow != undefined && row_parent_megarow.length > 0) {
      return;
    }

    var defaults = {
      megarowTheme: 'ViewsMegarowDialog',
      throbberTheme: 'ViewsMegarowThrobber',
      animation: 'show',
      animationSpeed: 'fast'
    };
    var settings = {};
    $.extend(true, settings, defaults, Backdrop.settings.ViewsMegarow);
    Backdrop.ViewsMegarow.currentSettings = settings;

    // Get the megarow HTML, add the "Loading" title and animation.
    var megarowContent = $(Backdrop.theme(settings.megarowTheme, entityId));
    $('.megarow-title', megarowContent).html(Backdrop.ViewsMegarow.currentSettings.loadingText);
    $('.megarow-content', megarowContent).html(Backdrop.theme(settings.throbberTheme));
    megarowContent.hide();

    // Extract the width of the megarow.
    var views_table = target.parents('.views-table');
    var nbcols = 1;
    var arr_classes = views_table.attr('class').split(' ');
    for (var i = 0 ; i < arr_classes.length ; i++) {
      result = arr_classes[i].substr(0, 5);
      if (result == 'cols-') {
        nbcols = arr_classes[i].substr(5);
      }
    }

    // Create our megarow.
    var wrapper_html = '';
    wrapper_html += '<tr class="megarow">';
    wrapper_html += '  <td colspan="' + nbcols + '">';
    wrapper_html += '  <div class="views-megarow-content views-megarow-content-' + entityId + '">';
    wrapper_html +=      $(megarowContent).html();
    wrapper_html += '   </div>';
    wrapper_html += '  </td>';
    wrapper_html += '</tr>';
    $('tr.item-' + entityId, views_table).after(wrapper_html);

    // Mark the parent row as active.
    $('tr.item-' + entityId, views_table).addClass('views-row-active');

    // Get the megarow from the DOM, now that it's been inserted.
    var megarow = views_table.find('.views-megarow-content-' + entityId, views_table);

    // Bind a click for closing the megarow.
    $('.close', megarow).bind('click', { entityId: entityId }, function(event) {
      Backdrop.ViewsMegarow.close(event.data.entityId, event.target);
      event.preventDefault();
    });
  };

  /**
   * Close the megarow.
   */
  Backdrop.ViewsMegarow.close = function(entityId, target) {
    // Target the megarow of the triggering element
    // (submit button or close link).
    var megarow = $(target).parents('.views-megarow-content:first');
    if (Backdrop.ViewsMegarow.currentSettings.scrollEnabled) {
      $(megarow).viewsMegarowGoTo(Backdrop.ViewsMegarow.currentSettings.scrollPadding);
    }
    // Unbind the events.
    $(document).trigger('CToolsDetachBehaviors', megarow);

    // Set our animation parameters and use them.
    var animation = Backdrop.ViewsMegarow.currentSettings.animation;
    if (animation == 'fadeIn') {
      animation = 'fadeOut';
    }
    else if (animation == 'slideDown') {
      animation = 'slideUp';
    }
    else {
      animation = 'hide';
    }

    // Close and remove the megarow.
    $(megarow).hide()[animation](Backdrop.ViewsMegarow.currentSettings.animationSpeed);
    $(megarow).parents('tr:first').remove();

    // Mark the parent row as inactive.
    $('tr.item-' + entityId).removeClass('views-row-active');
  }

  /**
   * Provide the HTML to create the megarow.
   */
  Backdrop.theme.prototype.ViewsMegarowDialog = function (entityId) {
    var html = '';
    html += '<div>'; // This div doesn't get inserted into a DOM.
    html += '  <div class="megarow-header clearfix">';
    html += '    <span class="megarow-title"></span>';
    html += '      <a class="close" href="#">' + Backdrop.ViewsMegarow.currentSettings.close + '</a>';
    html += '    </div>';
    html += '   <div class="megarow-content"></div>';
    html += '</div>';
    return html;
  }

  /**
   * Provide the HTML to create the throbber.
   */
  Backdrop.theme.prototype.ViewsMegarowThrobber = function () {
    var html = '';
    html += '  <div class="megarow-throbber">';
    html += '    <div class="megarow-throbber-wrapper">';
    html +=        Backdrop.ViewsMegarow.currentSettings.throbber;
    html += '    </div>';
    html += '  </div>';

    return html;
  };

  /**
   * Handler to prepare the megarow for the response
   */
  Backdrop.ViewsMegarow.clickAjaxLink = function () {
    var classes  = $(this).parents('tr').attr('class');

    // Extract the entity idem from a custom class storing it
    // to ease the manipulation of the rows.
    var entityId = /item\-([0-9]+)/.exec(classes)[1];

    Backdrop.ViewsMegarow.open(entityId, $(this));

    return false;
  };

  /**
   * Bind links that will open megarows to the appropriate function.
   */
  Backdrop.behaviors.ViewsMegarow = {
    attach: function(context) {
      // Bind links
      // Note that doing so in this order means that the two classes can be
      // used together safely.
      $('a.views-megarow-open:not(.views-megarow-open-processed)', context)
        .addClass('views-megarow-open-processed')
        .click(Backdrop.ViewsMegarow.clickAjaxLink)
        .each(function () {
          // Create a DOM attribute to ease the manipulation of the row
          // by any other module.
          var classes = $(this).parents('tr').attr('class');
          var entityId = /item\-([0-9]+)/.exec(classes)[1];
          $(this).parents('tr').attr('data-entity-id', entityId);

          // Create a backdrop ajax object
          var elementSettings = {};
          if ($(this).attr('href')) {
            elementSettings.url = $(this).attr('href');
            elementSettings.event = 'click';
            elementSettings.progress = { type: 'throbber' };
          }
          var base = $(this).attr('href');
          Backdrop.ajax[base] = new Backdrop.ajax(base, this, elementSettings);
        }
      );

      // Bind our custom event to the form submit
      $('.megarow-content form:not(.views-megarow-open-processed)')
        .addClass('views-megarow-open-processed')
        .each(function() {
          var elementSettings = {};
          elementSettings.url = $(this).attr('action');
          elementSettings.event = 'submit';
          elementSettings.progress = { 'type': 'throbber' }
          var base = $(this).attr('id');

          Backdrop.ajax[base] = new Backdrop.ajax(base, this, elementSettings);
          Backdrop.ajax[base].form = $(this);

          $('input[type=submit], button', this).click(function() {
            Backdrop.ajax[base].element = this;
            this.form.clk = this;
          });
        });
    }
  };

  /**
   * AJAX command to place HTML within the megarow.
   */
  Backdrop.ViewsMegarow.megarow_display = function(ajax, response, status) {
    var target = $(ajax.element).parents('.views-table');
    var megarow = $('.views-megarow-content-' + response.entity_id, target);

    // Update the megarow content.
    $('.megarow-title', megarow).html(response.title);
    // .html strips off <form> tag for version Jquery 1.7, using append instead.
    $('.megarow-content', megarow).html('');
    $('.megarow-content', megarow).append(response.output);
    Backdrop.attachBehaviors();
  }

  /**
   * AJAX command to dismiss the megarow.
   */
  Backdrop.ViewsMegarow.megarow_dismiss = function(ajax, response, status) {
    // Close the megarow of the calling element
    // (form submit button or close link).
    Backdrop.ViewsMegarow.close(response.entity_id, ajax.element);
  }

  /**
   * AJAX command to refresh the parent row of a megarow.
   */
  Backdrop.ViewsMegarow.megarow_refresh_parent = function(ajax, response, status) {
    // No row found, nothing to update.
    if ($('tr.item-' + response.entity_id).length == 0) {
      return;
    }

    // Fetch the current page using ajax, and extract the relevant data.
    var table = $('tr.item-' + response.entity_id).parents('table');
    var viewName = table.attr('data-view-name');
    var display = Backdrop.settings.ViewsMegarow.display_id;

    // If we don't have a specify display defined extract it from our table.
    if (display === undefined) {
      display = table.attr('data-view-display');
    }

    var url = Backdrop.settings.basePath + 'views_megarow/refresh/' + viewName + '/' + display;

    // Add arguments to the url if they have been passed in.
    if (Backdrop.settings.ViewsMegarow.args !== undefined) {
      url += '/' + Backdrop.settings.ViewsMegarow.args;
    }

    // Preserve initial destination URL query parameter.
    url += '?destination=' + Backdrop.ViewsMegarow.currentSettings.destination;

    $.get(url, function(data) {
      $('tr.item-' + response.entity_id + ' td', data).each(function(index) {
        // Ignore cells that contain form elements.
        if ($('input', this).length == 0 && $('select', this).length == 0) {
          var targetElement = $('tr.item-' + response.entity_id + ' td:eq(' + index + ')');
          var newContent = $(this).html();
          targetElement.html(newContent);
          Backdrop.attachBehaviors(targetElement);
        }
      });
    });
  }

  $(function() {
    Backdrop.ajax.prototype.commands.megarow_display = Backdrop.ViewsMegarow.megarow_display;
    Backdrop.ajax.prototype.commands.megarow_dismiss = Backdrop.ViewsMegarow.megarow_dismiss;
    Backdrop.ajax.prototype.commands.megarow_refresh_parent = Backdrop.ViewsMegarow.megarow_refresh_parent;
  });
})(jQuery);
